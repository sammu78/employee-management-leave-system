import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentApi } from '../../api/departmentApi';

export const fetchDepartments = createAsyncThunk(
  'department/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentApi.getAll();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'department/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await departmentApi.create(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'department/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await departmentApi.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'department/delete',
  async (id, { rejectWithValue }) => {
    try {
      await departmentApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const departmentSlice = createSlice({
  name: 'department',
  initialState: {
    departments: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearDepartmentStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
        state.successMessage = 'Department created successfully!';
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.map((d) =>
          d.id === action.payload.id ? action.payload : d
        );
        state.successMessage = 'Department updated successfully!';
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d.id !== action.payload);
        state.successMessage = 'Department deleted successfully!';
      });
  },
});

export const { clearDepartmentStatus } = departmentSlice.actions;
export default departmentSlice.reducer;

