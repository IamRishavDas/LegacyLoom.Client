import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVisible: false,
  currentImageIndex: {},
};

const storyCardSlice = createSlice({
  name: 'storyCard',
  initialState,
  reducers: {
    setIsVisible(state, action) {
      state.isVisible = action.payload;
    },
    setCurrentImageIndex(state, action) {
      state.currentImageIndex = { ...state.currentImageIndex, ...action.payload };
    },
    resetStoryCardState(state) {
      state.isVisible = false;
      state.currentImageIndex = {};
    },
  },
});

export const { setIsVisible, setCurrentImageIndex, resetStoryCardState } = storyCardSlice.actions;
export default storyCardSlice.reducer;