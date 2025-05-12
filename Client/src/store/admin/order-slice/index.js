import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  isLoading: false,
  error: null,
  orderList: [],
  orderDetails: null,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/orders/get`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/orders/details/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/orders/update/${id}`,
        {
          orderStatus,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrder", // Renamed for consistency
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    clearAdminOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.orderList = action.payload.data;
        } else {
          state.orderList = [];
          state.error = action.payload?.message || "Failed to fetch admin orders.";
        }
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch admin orders.";
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.orderDetails = action.payload.data;
        } else {
          state.orderDetails = null;
          state.error = action.payload?.message || "Failed to fetch admin order details.";
        }
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.payload?.message || action.error?.message || "Failed to fetch admin order details.";
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to update order status.";
        }
        
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to update order status.";
      });
  },
});

export const { resetOrderDetails, clearAdminOrderError } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
