import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const refreshSession = createAsyncThunk('auth/refresh', async (_, thunkApi) => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    return thunkApi.rejectWithValue('Unauthenticated');
  }

  return response.json();
});

export const loginWithGoogle = createAsyncThunk(
  'auth/google',
  async (idToken, thunkApi) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return thunkApi.rejectWithValue(payload.error || 'Login failed');
    }

    return response.json();
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(refreshSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = null;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = null;
      });
  }
});

export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN';

export default authSlice.reducer;
