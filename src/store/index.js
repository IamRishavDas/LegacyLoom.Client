import { configureStore } from '@reduxjs/toolkit';
import storyCardReducer from "./storyCardSlice";

export const store = configureStore({
  reducer: {
    storyCard: storyCardReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});