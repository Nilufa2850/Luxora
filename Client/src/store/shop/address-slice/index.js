import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  isLoading: false,
  addressList: [],
  error: null, 
};

export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/shop/address/add`,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "/addresses/fetchAllAddresses",
  async (userId, { rejectWithValue }) => {
    if (!userId) {
        return rejectWithValue({ message: "User ID not provided for fetching addresses.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/address/get/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const editaAddress = createAsyncThunk( 
  "/addresses/editaAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/shop/address/update/${userId}/${addressId}`,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/shop/address/delete/${userId}/${addressId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const addressSlice = createSlice({
  name: "shopAddress", 
  initialState,
  reducers: {
    clearAddressError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to add address.";
        }
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to add address.";
      })
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
            state.addressList = action.payload.data;
        } else {
            state.addressList = [];
            state.error = action.payload?.message || "Failed to fetch addresses.";
        }
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.addressList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch addresses.";
      })
      .addCase(editaAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editaAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to update address.";
        }
      })
      .addCase(editaAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to update address.";
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to delete address.";
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to delete address.";
      });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
