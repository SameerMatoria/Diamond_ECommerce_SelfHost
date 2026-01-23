import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchHealth = createAsyncThunk('health/fetch', async () => {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
});

const healthSlice = createSlice({
  name: 'health',
  initialState: {
    status: 'idle',
    data: null,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchHealth.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default healthSlice.reducer;
