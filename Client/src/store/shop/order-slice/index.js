import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  approvalURL: null,
  isLoading: false,
  error: null,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/shop/order/create`,
        orderData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, PayerID, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/shop/order/capture`,
        {
          paymentId,
          PayerID,
          orderId,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    if (!userId) {
        return rejectWithValue({ message: "User ID not provided for fetching orders.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/order/list/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    if (!id) {
        return rejectWithValue({ message: "Order ID not provided for fetching details.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/order/details/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shopOrder",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    clearApprovalURL: (state) => {
      state.approvalURL = null;
    },
    clearShopOrderError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.approvalURL = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.approvalURL = action.payload.approvalURL;
          state.orderId = action.payload.orderId;
          if (action.payload.orderId) {
            sessionStorage.setItem(
              "currentOrderId",
              JSON.stringify(action.payload.orderId)
            );
          }
        } else {
          state.error = action.payload?.message || "Failed to create order.";
        }
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        state.error = action.payload?.message || action.error?.message || "Order creation failed.";
      })
      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.orderDetails = action.payload.data;
        } else {
          state.error = action.payload?.message || "Payment capture failed.";
        }
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Payment capture failed.";
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
            state.orderList = action.payload.data;
        } else {
            state.orderList = [];
            state.error = action.payload?.message || "Failed to fetch user orders.";
        }
      })
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch user orders.";
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
            state.orderDetails = action.payload.data;
        } else {
            state.orderDetails = null;
            state.error = action.payload?.message || "Failed to fetch order details.";
        }
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.payload?.message || action.error?.message || "Failed to fetch order details.";
      });
  },
});

export const { resetOrderDetails, clearApprovalURL, clearShopOrderError } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
