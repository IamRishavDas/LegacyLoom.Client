import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setTimelines, resetStoryCardState } from '../../../store/storyCardSlice';
import StoryCard from '../StoryCard';
import { GetMyTimelines } from '../../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';
import LoadingOverlay from '../../loading-overlay/LoadingOverlay';

export default function MyTimelines() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { timelines } = useSelector((state) => state.storyCard);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Get current page from URL query params, default to 1
  const currentPageFromUrl = parseInt(searchParams.get('pageNumber')) || 1;
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: currentPageFromUrl,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false
  });

  // Update URL when page changes
  const updatePageInUrl = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 1) {
      // Remove pageNumber param if it's page 1 (cleaner URL)
      newSearchParams.delete('pageNumber');
    } else {
      newSearchParams.set('pageNumber', page.toString());
    }
    setSearchParams(newSearchParams);
  };

  const fetchData = async (force = false, page = currentPageFromUrl, append = false) => {
    // Don't fetch if we already have data and it's not forced
    if (!force && !append && timelines.length > 0 && page === pagination.currentPage) {
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading || isLoadingMore) return;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const authToken = localStorage.getItem('token');

      if (authToken === null) {
        setIsLoading(false);
        setIsLoadingMore(false);
        toast.warn("Login to access this page");
        navigate('/user-login');
        return;
      }

      const response = await GetMyTimelines(authToken, { 
        pageNumber: page, 
        pageSize: pagination.pageSize, 
        orderBy: null 
      });

      if(response.status === 429){
        setIsLoading(false);
        setIsLoadingMore(false);
        toast.warn("Too many request are made, please relax yourself while using this application");
        return;
      }

      if (response.status === 401) {
        setIsLoading(false);
        setIsLoadingMore(false);
        navigate('/user-login');
        return;
      }

      // Extract pagination data from headers
      const paginationHeader = response.headers.get('X-Pagination');
      console.log('Pagination header:', paginationHeader);
      
      if (paginationHeader) {
        const paginationData = JSON.parse(paginationHeader);
        setPagination({
          currentPage: paginationData.CurrentPage,
          totalPages: paginationData.TotalPages,
          pageSize: paginationData.PageSize,
          totalCount: paginationData.TotalCount,
          hasPrevious: paginationData.HasPrevious,
          hasNext: paginationData.HasNext
        });
      }

      const data = await response.json();
      if (data.success) {
        if (append) {
          // Append new data to existing timelines
          dispatch(setTimelines([...timelines, ...data.data]));
        } else {
          // Replace existing timelines
          dispatch(setTimelines(data.data));
        }
      } else {
        toast.error(data.errorMessage || 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error fetching timelines:', error);
      toast.error('Network error: Please try again later');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more data (for infinite scroll or "Load More" button)
  const loadMore = () => {
    if (pagination.hasNext && !isLoadingMore) {
      fetchData(false, pagination.currentPage + 1, true);
    }
  };

  // Go to specific page (replaces current data and updates URL)
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      updatePageInUrl(page);
      fetchData(true, page, false);
    }
  };

  // Refresh current page
  const refreshData = () => {
    fetchData(true, currentPageFromUrl, false);
  };

  // Effect to handle URL changes (back/forward navigation)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('pageNumber')) || 1;
    
    // If URL page is different from current pagination state, fetch new data
    if (pageFromUrl !== pagination.currentPage) {
      fetchData(true, pageFromUrl, false);
    }
  }, [searchParams]);

  // Initial data fetch
  useEffect(() => {
    // Only fetch if we don't have data or if the page has changed
    if (timelines.length === 0 || currentPageFromUrl !== pagination.currentPage) {
      fetchData(true, currentPageFromUrl, false);
    }
  }, []);

  // Pagination component
  const PaginationControls = () => {
    console.log(pagination.totalPages);
    if (pagination.totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust start if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(
          <button
            key={1}
            onClick={() => goToPage(1)}
            className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
          >
            1
          </button>
        );
        if (startPage > 2) {
          pages.push(
            <span key="ellipsis1" className="px-2 py-2 text-stone-400">
              ...
            </span>
          );
        }
      }

      // Add visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              i === pagination.currentPage
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-600 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            {i}
          </button>
        );
      }

      // Add last page and ellipsis if needed
      if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) {
          pages.push(
            <span key="ellipsis2" className="px-2 py-2 text-stone-400">
              ...
            </span>
          );
        }
        pages.push(
          <button
            key={pagination.totalPages}
            onClick={() => goToPage(pagination.totalPages)}
            className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
          >
            {pagination.totalPages}
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex flex-col items-center space-y-4 mt-12 mb-8">
        {/* Pagination Info */}
        {/* <div className="text-sm text-stone-600">
          Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
          {pagination.totalCount} stories
        </div> */}

        {/* Pagination Controls */}
        {/* <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-stone-200/50"> */}
          {/* Previous Button */}
          {/* <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevious || isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              pagination.hasPrevious && !isLoading
                ? 'text-stone-600 hover:text-amber-600 hover:bg-amber-50'
                : 'text-stone-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button> */}

          {/* Page Numbers */}
          {/* {renderPageNumbers()} */}

          {/* Next Button */}
          {/* <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              pagination.hasNext && !isLoading
                ? 'text-stone-600 hover:text-amber-600 hover:bg-amber-50'
                : 'text-stone-400 cursor-not-allowed'
            }`}
          >
            Next
          </button> */}
        {/* </div> */}

        {/* Load More Button (Alternative to pagination) */}
        {pagination.hasNext && (
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 shadow-lg ${
              isLoadingMore
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLoadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Load More Stories'
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <section>
      <div>
        <StoryCard
          title="Stories from your Heart"
          secondaryTitle="Where memories find their voice and moments become eternal"
          data={timelines}
          refetch={refreshData}
        />
        
        {/* Pagination Controls */}
        {timelines.length > 0 && <PaginationControls />}
      </div>
      
      {isLoading && (
        <LoadingOverlay
          isVisible={isLoading}
          message="Loading timelines"
          submessage="Please wait while we load your timelines"
          variant="slate"
          size="medium"
          showDots={true}
        />
      )}
      
      {isLoadingMore && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-stone-200/50">
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more stories...</span>
          </div>
        </div>
      )}
    </section>
  );
}