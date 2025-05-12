import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  cartItems: null, 
  isLoading: false,
  error: null,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/shop/cart/add`,
        {
          userId,
          productId,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    if (!userId) { 
        return rejectWithValue({ message: "User ID not provided for fetching cart items.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/cart/get/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/shop/cart/${userId}/${productId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/shop/cart/update-cart`,
        {
          userId,
          productId,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shopCart", 
  initialState,
  reducers: {
    clearCartError: (state) => {
        state.error = null;
    },
    resetCart: (state) => { 
        state.cartItems = null;
        state.isLoading = false;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.cartItems = action.payload.data;
        } else {
          state.error = action.payload?.message || "Failed to add to cart.";
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to add to cart.";
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.cartItems = action.payload.data;
        } else {
          
          if (action.payload?.status === 404 || (action.payload && !action.payload.success)) {
            state.cartItems = null; // Or an empty cart structure: { items: [] }
          } else {
            state.error = action.payload?.message || "Failed to fetch cart items.";
          }
        }
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.cartItems = null; 
        if (action.payload?.status !== 404) {
            state.error = action.payload?.message || action.error?.message || "Failed to fetch cart items.";
        }
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.cartItems = action.payload.data;
        } else {
          state.error = action.payload?.message || "Failed to update cart quantity.";
        }
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to update cart quantity.";
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.cartItems = action.payload.data;
        } else {
          state.error = action.payload?.message || "Failed to delete cart item.";
        }
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to delete cart item.";
      });
  },
});

export const { clearCartError, resetCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
