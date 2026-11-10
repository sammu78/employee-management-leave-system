import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../../api/dashboardApi';

export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAdminStats();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchEmployeeDashboard = createAsyncThunk(
  'dashboard/fetchEmployee',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getEmployeeStats();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    adminStats: null,
    employeeStats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.adminStats = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmployeeDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeStats = action.payload;
      })
      .addCase(fetchEmployeeDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
