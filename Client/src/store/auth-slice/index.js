import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false, 
  error: null,    
};

export const registerUser = createAsyncThunk(
  "/auth/register", 
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`, 
        formData,
        {
          withCredentials: true, 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login", 
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`, 
        formData,
        {
          withCredentials: true, 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/logout`, 
        {}, 
        {
          withCredentials: true, 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, success: false });
    }
  }
);

// RENAMED from checkAuthStatus to checkAuth
export const checkAuth = createAsyncThunk(
  "/auth/checkAuth", // Changed prefix to match new name for consistency
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/check-auth`, 
        {
          withCredentials: true, 
          headers: { 
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { success: false, message: "Not authenticated" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload; 
        state.loading = false;
        state.error = null;
    },
    clearAuthError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.success) {
            state.error = action.payload.message || "Registration failed";
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || "Registration request failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.error = action.payload.message || "Login failed";
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || "Login request failed";
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || action.error?.message || "Logout request failed";
      })
      // UPDATED to use checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = null; 
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        if (action.payload?.message !== "Not authenticated" && action.payload?.message !== "Unauthorised user!") {
            state.error = action.payload?.message || action.error?.message || "Auth check failed";
        }
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
