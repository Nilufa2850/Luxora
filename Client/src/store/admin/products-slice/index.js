import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ADDED: Define the API_URL using the environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  isLoading: false,
  productList: [],
  error: null, // ADDED: For storing error messages
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  // ADDED: rejectWithValue for error handling
  async (formData, { rejectWithValue }) => { 
    try {
      const result = await axios.post(
        // CHANGED: Use API_URL
        `${API_URL}/admin/products/add`, 
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      // ADDED: Return a serializable error object
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  // ADDED: rejectWithValue for error handling
  async (_, { rejectWithValue }) => { 
    try {
      const result = await axios.get(
        // CHANGED: Use API_URL
        `${API_URL}/admin/products/get` 
      );
      return result?.data;
    } catch (error) {
      // ADDED: Return a serializable error object
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  // ADDED: rejectWithValue for error handling
  async ({ id, formData }, { rejectWithValue }) => { 
    try {
      const result = await axios.put(
        // CHANGED: Use API_URL
        `${API_URL}/admin/products/edit/${id}`, 
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      // ADDED: Return a serializable error object
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  // ADDED: rejectWithValue for error handling
  async (id, { rejectWithValue }) => { 
    try {
      const result = await axios.delete(
        // CHANGED: Use API_URL
        `${API_URL}/admin/products/delete/${id}` 
      );
      return result?.data;
    } catch (error) {
      // ADDED: Return a serializable error object
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    // ADDED: Optional reducer to clear errors
    clearAdminProductsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllProducts
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null; // ADDED: Clear previous errors
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) { // ADDED: Check for success flag from backend
            state.productList = action.payload.data;
        } else {
            state.productList = [];
            state.error = action.payload?.message || "Failed to fetch products."; // ADDED: Set error from payload
        }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch products."; // ADDED: Set error
      })
      // addNewProduct
      .addCase(addNewProduct.pending, (state) => { // ADDED: Cases for addNewProduct
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to add product.";
        }
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to add product.";
      })
      // editProduct
      .addCase(editProduct.pending, (state) => { // ADDED: Cases for editProduct
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to update product.";
        }
        // Component re-fetches productList.
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to update product.";
      })
      // deleteProduct
      .addCase(deleteProduct.pending, (state) => { 
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to delete product.";
        }
       
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to delete product.";
      });
  },
});


export const { clearAdminProductsError } = AdminProductsSlice.actions;

export default AdminProductsSlice.reducer;
