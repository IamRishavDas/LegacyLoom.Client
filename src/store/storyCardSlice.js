import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVisible: false,
  currentImageIndex: {},
  timelines: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
  publicFeed: [],
  publicPagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
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
    setPagination(state, action) {
      state.pagination = action.payload;
    },
    resetTimelines(state) {
      state.timelines = [];
      state.pagination = initialState.pagination;
    },
    setPublicFeed(state, action) {
      state.publicFeed = action.payload;
    },
    setPublicPagination(state, action) {
      state.publicPagination = action.payload;
    },
    resetPublicFeed(state) {
      state.publicFeed = [];
      state.publicPagination = initialState.publicPagination;
    },
    resetStoryCardState(state) {
      state.isVisible = false;
      state.currentImageIndex = {};
      state.timelines = [];
      state.pagination = initialState.pagination;
      state.publicFeed = [];
      state.publicPagination = initialState.publicPagination;
    },
  },
});

export const {
  setIsVisible,
  setCurrentImageIndex,
  setTimelines,
  setPagination,
  resetTimelines,
  setPublicFeed,
  setPublicPagination,
  resetPublicFeed,
  resetStoryCardState,
} = storyCardSlice.actions;
export default storyCardSlice.reducer;