import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
        "http://localhost:8080/api/shop/order/create",
        orderData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, PayerID, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/shop/order/capture",
        {
          paymentId,
          PayerID,
          orderId,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/shop/order/list/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/shop/order/details/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
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
    clearOrderError: (state) => {
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
          // Toast notifications are typically handled in components after dispatch
          // toast.success(action.payload.message || "Payment successful!");
        } else {
          state.error = action.payload?.message || "Payment capture failed.";
          // toast.error(action.payload?.message || "Payment capture failed.");
        }
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Payment capture failed.";
        // toast.error(action.payload?.message || action.error?.message || "Payment capture failed.");
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
            state.error = action.payload?.message || "Failed to fetch orders.";
        }
      })
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch orders.";
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

export const { resetOrderDetails, clearApprovalURL, clearOrderError } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
