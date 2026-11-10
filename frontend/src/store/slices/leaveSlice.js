import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaveApi } from '../../api/leaveApi';

export const fetchMyLeaves = createAsyncThunk(
  'leave/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await leaveApi.getMyLeaves(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllLeaves = createAsyncThunk(
  'leave/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await leaveApi.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyBalance = createAsyncThunk(
  'leave/fetchMyBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaveApi.getMyBalance();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const applyLeave = createAsyncThunk(
  'leave/apply',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await leaveApi.apply(formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveLeave = createAsyncThunk(
  'leave/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leaveApi.approve(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectLeave = createAsyncThunk(
  'leave/reject',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await leaveApi.reject(id, { rejectionReason });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const cancelLeave = createAsyncThunk(
  'leave/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leaveApi.cancel(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    myLeaves: [],
    allLeaves: [],
    myBalance: null,
    pagination: {
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearLeaveStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // My leaves
      .addCase(fetchMyLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload.content;
        state.pagination = {
          pageNumber: action.payload.pageNumber,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
        };
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // All leaves
      .addCase(fetchAllLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.allLeaves = action.payload.content;
        state.pagination = {
          pageNumber: action.payload.pageNumber,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
        };
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // My Balance
      .addCase(fetchMyBalance.fulfilled, (state, action) => {
        state.myBalance = action.payload;
      })
      // Apply
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves.unshift(action.payload);
        state.successMessage = 'Leave request submitted successfully!';
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.allLeaves = state.allLeaves.map((l) => (l.id === action.payload.id ? action.payload : l));
        state.successMessage = 'Leave request approved!';
      })
      // Reject
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.allLeaves = state.allLeaves.map((l) => (l.id === action.payload.id ? action.payload : l));
        state.successMessage = 'Leave request rejected.';
      })
      // Cancel
      .addCase(cancelLeave.fulfilled, (state, action) => {
        state.myLeaves = state.myLeaves.map((l) => (l.id === action.payload.id ? action.payload : l));
        state.allLeaves = state.allLeaves.map((l) => (l.id === action.payload.id ? action.payload : l));
        state.successMessage = 'Leave request cancelled successfully.';
      });
  },
});

export const { clearLeaveStatus } = leaveSlice.actions;
export default leaveSlice.reducer;
