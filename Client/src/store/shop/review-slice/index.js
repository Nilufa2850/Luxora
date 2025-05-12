import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

export const addReview = createAsyncThunk(
  "/reviews/addReview", 
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/shop/review/add`,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const getReviews = createAsyncThunk(
  "/reviews/getReviews", 
  async (productId, { rejectWithValue }) => { 
    if (!productId) {
        return rejectWithValue({ message: "Product ID not provided for fetching reviews.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/review/${productId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const reviewSlice = createSlice({
  name: "shopReviews", // Renamed for clarity
  initialState,
  reducers: {
    resetReviews: (state) => {
        state.reviews = [];
        state.isLoading = false;
        state.error = null;
    },
    clearReviewError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
            state.reviews = action.payload.data;
        } else {
            state.reviews = [];
            state.error = action.payload?.message || "Failed to fetch reviews.";
        }
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch reviews.";
      })
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to add review.";
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to add review.";
      });
  },
});

export const { resetReviews, clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
