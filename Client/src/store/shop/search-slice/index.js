import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  isLoading: false,
  searchResults: [],
  error: null, 
};

export const getSearchResults = createAsyncThunk(
  "/search/getSearchResults", 
  async (keyword, { rejectWithValue }) => {
    if (!keyword || keyword.trim() === "") {
        return rejectWithValue({ message: "Search keyword cannot be empty.", success: false });
    }
    try {
      const response = await axios.get(
        `${API_URL}/shop/search/${keyword}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

const searchSlice = createSlice({
  name: "shopSearch", 
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      state.searchResults = [];
      state.isLoading = false; 
      state.error = null;      
    },
    clearSearchError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
            state.searchResults = action.payload.data;
        } else {
            state.searchResults = [];
            state.error = action.payload?.message || "Failed to fetch search results.";
        }
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.searchResults = [];
        state.error = action.payload?.message || action.error?.message || "Failed to fetch search results.";
      });
  },
});

export const { resetSearchResults, clearSearchError } = searchSlice.actions;

export default searchSlice.reducer;
