import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeApi } from '../../api/employeeApi';

export const fetchEmployees = createAsyncThunk(
  'employee/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employee/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employee/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeApi.create(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employee/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeApi.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deactivateEmployee = createAsyncThunk(
  'employee/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      await employeeApi.deactivate(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employee/delete',
  async (id, { rejectWithValue }) => {
    try {
      await employeeApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    employees: [],
    currentEmployee: null,
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
    clearEmployeeStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.content;
        state.pagination = {
          pageNumber: action.payload.pageNumber,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          last: action.payload.last,
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.successMessage = 'Employee added successfully!';
      })
      // Update
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
        state.successMessage = 'Employee updated successfully!';
      })
      // Deactivate
      .addCase(deactivateEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.map((emp) =>
          emp.id === action.payload ? { ...emp, employmentStatus: 'INACTIVE' } : emp
        );
        state.successMessage = 'Employee deactivated successfully!';
      })
      // Delete
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((emp) => emp.id !== action.payload);
        state.successMessage = 'Employee deleted successfully!';
      });
  },
});

export const { clearEmployeeStatus, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
