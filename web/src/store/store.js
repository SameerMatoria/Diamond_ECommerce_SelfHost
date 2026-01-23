import { configureStore } from '@reduxjs/toolkit';
import healthReducer from './healthSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    health: healthReducer,
    auth: authReducer
  }
});
