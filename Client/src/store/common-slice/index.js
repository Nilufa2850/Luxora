import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  isLoading: false,
  featureImageList: [],
  error: null,
};

export const getFeatureImages = createAsyncThunk(
  "/common/getFeatureImages", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/common/feature/get`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const addFeatureImage = createAsyncThunk(
  "/common/addFeatureImage", 
  async (imageData, { rejectWithValue }) => { 
    try {
      const response = await axios.post(
        `${API_URL}/common/feature/add`,
        imageData 
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const commonSlice = createSlice({
  name: "commonData", 
  initialState,
  reducers: {
    clearCommonError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
            state.featureImageList = action.payload.data;
        } else {
            state.featureImageList = [];
            state.error = action.payload?.message || "Failed to fetch feature images.";
        }
      })
      .addCase(getFeatureImages.rejected, (state, action) => {
        state.isLoading = false;
        state.featureImageList = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch feature images.";
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!action.payload?.success) {
            state.error = action.payload?.message || "Failed to add feature image.";
        }
      })
      .addCase(addFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to add feature image.";
      });
  },
});

export const { clearCommonError } = commonSlice.actions;
export default commonSlice.reducer;
