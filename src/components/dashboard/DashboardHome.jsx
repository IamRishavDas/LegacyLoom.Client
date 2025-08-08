import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  setPublicFeed,
  setPublicPagination,
  resetStoryCardState,
} from '../../store/storyCardSlice';
import PublicFeed from './dashboard-content/PublicFeed';
import { GetPublicFeed } from '../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';
import LoadingOverlay from '../loading-overlay/LoadingOverlay';

export default function DashboardHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { publicFeed, publicPagination } = useSelector((state) => state.storyCard);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Track initial fetch

  // Get current page from URL query params, default to 1
  const currentPageFromUrl = parseInt(searchParams.get('pageNumber')) || 1;

  // Update URL when page changes
  const updatePageInUrl = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newSearchParams.delete('pageNumber');
    } else {
      newSearchParams.set('pageNumber', page.toString());
    }
    setSearchParams(newSearchParams);
  };

  const fetchData = useCallback(
    async (force = false, page = currentPageFromUrl, append = false) => {
      if (
        !force &&
        !append &&
        hasFetched &&
        publicFeed.length > 0 &&
        page === publicPagination.currentPage
      ) {
        // console.log('fetchData skipped: already fetched and data exists');
        return;
      }

      if (isLoading || isLoadingMore) {
        // console.log('fetchData skipped: already loading');
        return;
      }

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
          toast.warn('Login to access this page');
          navigate('/user-login');
          return;
        }

        const response = await GetPublicFeed(authToken, {
          pageNumber: page,
          pageSize: publicPagination.pageSize,
          orderBy: null,
        });

        if (response.status === 429) {
          setIsLoading(false);
          setIsLoadingMore(false);
          toast.warn(
            'Too many requests are made, please relax yourself while using this application'
          );
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
        if (paginationHeader) {
          const paginationData = JSON.parse(paginationHeader);
          dispatch(
            setPublicPagination({
              currentPage: paginationData.CurrentPage,
              totalPages: paginationData.TotalPages,
              pageSize: paginationData.PageSize,
              totalCount: paginationData.TotalCount,
              hasPrevious: paginationData.HasPrevious,
              hasNext: paginationData.HasNext,
            })
          );
        } else {
          // Fallback pagination if header is missing
          dispatch(
            setPublicPagination({
              currentPage: page,
              totalPages:
                publicFeed.length > 0
                  ? Math.ceil(publicFeed.length / publicPagination.pageSize)
                  : 1,
              pageSize: publicPagination.pageSize,
              totalCount: publicFeed.length,
              hasPrevious: page > 1,
              hasNext: publicFeed.length === publicPagination.pageSize,
            })
          );
        }

        const data = await response.json();
        if (data.success) {
          if (append) {
            dispatch(setPublicFeed([...publicFeed, ...data.data]));
          } else {
            dispatch(setPublicFeed(data.data));
          }
          setHasFetched(true); // Mark fetch as complete
        } else {
          toast.error(data.errorMessage || 'Failed to load stories');
          setHasFetched(true); // Prevent infinite retries on error
        }
      } catch (error) {
        // console.error('Error fetching public feed:', error);
        toast.error('Network error: Please try again later');
        setHasFetched(true); // Prevent infinite retries on error
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [publicFeed, publicPagination, currentPageFromUrl, dispatch, navigate, isLoading, isLoadingMore, hasFetched]
  );

  // Refresh current page
  const refreshData = useCallback(() => {
    // console.log('refreshData called');
    dispatch(resetStoryCardState());
    setHasFetched(false); // Allow fetch on refresh
    fetchData(true, currentPageFromUrl, false);
  }, [dispatch, fetchData, currentPageFromUrl]);

  // Effect to handle URL changes (back/forward navigation)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('pageNumber')) || 1;
    if (pageFromUrl !== publicPagination.currentPage || location.state?.forceFetch) {
      // console.log('URL change or forceFetch, fetching data:', { pageFromUrl, currentPage: publicPagination.currentPage, forceFetch: location.state?.forceFetch });
      fetchData(true, pageFromUrl, false);
    }
  }, [searchParams, location.state, publicPagination.currentPage, fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (!hasFetched || location.state?.forceFetch) {
      // console.log('Initial fetch or forceFetch, hasFetched:', hasFetched, 'forceFetch:', location.state?.forceFetch);
      fetchData(true, currentPageFromUrl, false);
    }
  }, [hasFetched, location.state, currentPageFromUrl, fetchData]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        {hasFetched && publicFeed.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
            <p className="text-stone-600 text-lg">No stories available.</p>
            <button
              onClick={refreshData}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          publicFeed && (
            <PublicFeed
              apiData={{ data: publicFeed }}
              refetch={refreshData}
              pagination={publicPagination}
              goToPage={(page) => {
                if (
                  page >= 1 &&
                  page <= publicPagination.totalPages &&
                  page !== publicPagination.currentPage
                ) {
                  updatePageInUrl(page);
                  fetchData(true, page, false);
                }
              }}
            />
          )
        )}
      </div>
      {isLoading && (
        <LoadingOverlay
          isVisible={isLoading}
          message="Loading timelines"
          submessage="Please wait while we load timelines"
          variant="slate"
          size="medium"
          showDots={true}
        />
      )}
      {isLoadingMore && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-stone-200/50">
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more stories...</span>
          </div>
        </div>
      )}
    </>
  );
}