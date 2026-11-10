import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi } from '../../api/attendanceApi';

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getToday();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (notes, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.checkIn({ notes });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (notes, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.checkOut({ notes });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getMyAttendance(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllAttendance = createAsyncThunk(
  'attendance/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayAttendance: null,
    myAttendance: [],
    allAttendance: [],
    pagination: {
      pageNumber: 0,
      pageSize: 15,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAttendanceStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Today status
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendance = action.payload;
      })
      // Check in
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
        state.myAttendance.unshift(action.payload);
        state.successMessage = 'Successfully checked in!';
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
        state.myAttendance = state.myAttendance.map((a) =>
          a.id === action.payload.id ? action.payload : a
        );
        state.successMessage = 'Successfully checked out!';
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // My history
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myAttendance = action.payload.content;
        state.pagination = {
          pageNumber: action.payload.pageNumber,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
        };
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // All history (admin)
      .addCase(fetchAllAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload.content;
        state.pagination = {
          pageNumber: action.payload.pageNumber,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
        };
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAttendanceStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
