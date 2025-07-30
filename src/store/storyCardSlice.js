import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVisible: false,
  currentImageIndex: {},
  timelines: [],
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
    setTimelines(state, action) {
      state.timelines = action.payload;
    },
    resetStoryCardState(state) {
      state.isVisible = false;
      state.currentImageIndex = {};
      state.timelines = [];
    },
  },
});

export const { setIsVisible, setCurrentImageIndex, setTimelines, resetStoryCardState } = storyCardSlice.actions;
export default storyCardSlice.reducer;