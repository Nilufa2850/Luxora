import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  loading: false,
  error: null,
  productList: [],
  productDetails: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {
    try {
      let queryString = "";
      const queryParts = [];

      if (sortParams) {
        queryParts.push(`sortBy=${encodeURIComponent(sortParams)}`);
      }

      if (filterParams) {
        for (const key in filterParams) {
          if (filterParams[key] && Array.isArray(filterParams[key]) && filterParams[key].length > 0) {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(filterParams[key].join(','))}`);
          } else if (filterParams[key] && typeof filterParams[key] === 'string' && filterParams[key].trim() !== '') {
             queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(filterParams[key])}`);
          }
        }
      }
      if (queryParts.length > 0) {
        queryString = `?${queryParts.join('&')}`;
      }

      const response = await axios.get(
        `${API_URL}/shop/products/get${queryString}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    if (!id) {
        return rejectWithValue({ message: "Product ID not provided.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/products/details/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => { 
      state.productDetails = null;
      state.error = null; 
    },
    clearShopProductsError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
            state.productList = action.payload.data;
        } else {
            state.productList = [];
            state.error = action.payload?.message || "Failed to fetch products.";
        }
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.loading = false;
        state.productList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch products.";
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
            state.productDetails = action.payload.data;
        } else {
            state.productDetails = null;
            state.error = action.payload?.message || "Failed to fetch product details.";
        }
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.productDetails = null;
        state.error = action.payload?.message || action.error?.message || "Failed to fetch product details.";
      });
  },
});

export const { setProductDetails, clearShopProductsError } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
