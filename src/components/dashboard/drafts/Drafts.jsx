import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setDrafts,
  setDraftPagination,
  resetDrafts,
} from "../../../store/storyCardSlice";
import DraftCard from "./DraftCard";
import { toast } from "react-toastify";
import LoadingOverlay from "../../loading-overlay/LoadingOverlay";
import { GetMyDrafts } from "../../../apis/apicalls/apicalls";

export default function Drafts() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { drafts, draftPagination } = useSelector((state) => state.storyCard);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get current page from URL query params, default to 1
  const currentPageFromUrl = parseInt(searchParams.get("pageNumber")) || 1;

  // Update URL when page changes
  const updatePageInUrl = (page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newSearchParams.delete("pageNumber");
    } else {
      newSearchParams.set("pageNumber", page.toString());
    }
    setSearchParams(newSearchParams);
  };

  const fetchData = async (
    force = false,
    page = currentPageFromUrl,
    append = false
  ) => {
    if (
      !force &&
      !append &&
      drafts.length > 0 &&
      page === draftPagination.currentPage
    ) {
      return;
    }

    if (isLoading || isLoadingMore) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const authToken = localStorage.getItem("token");

      if (authToken === null) {
        setIsLoading(false);
        setIsLoadingMore(false);
        toast.warn("Login to access this page");
        navigate("/user-login");
        return;
      }

      const response = await GetMyDrafts(authToken, {
        pageNumber: page,
        pageSize: draftPagination.pageSize,
        orderBy: null,
      });

      if (response.status === 429) {
        setIsLoading(false);
        setIsLoadingMore(false);
        toast.warn(
          "Too many requests are made, please relax yourself while using this application"
        );
        return;
      }

      if (response.status === 401) {
        setIsLoading(false);
        setIsLoadingMore(false);
        navigate("/user-login");
        return;
      }

      // Extract pagination data from headers
      const paginationHeader = response.headers.get("X-Pagination");
      if (paginationHeader) {
        const paginationData = JSON.parse(paginationHeader);
        dispatch(
          setDraftPagination({
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
          setDraftPagination({
            currentPage: page,
            totalPages:
              drafts.length > 0
                ? Math.ceil(drafts.length / draftPagination.pageSize)
                : 1,
            pageSize: draftPagination.pageSize,
            totalCount: drafts.length,
            hasPrevious: page > 1,
            hasNext: drafts.length === draftPagination.pageSize,
          })
        );
      }

      const data = await response.json();
      if (data.success) {
        if (append) {
          dispatch(setDrafts([...drafts, ...data.data]));
        } else {
          dispatch(setDrafts(data.data));
        }
      } else {
        toast.error(data.errorMessage || "Failed to load drafts");
      }
    } catch (error) {
      toast.error("Network error: Please try again later");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Go to specific page (replaces current data and updates URL)
  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= draftPagination.totalPages &&
      page !== draftPagination.currentPage
    ) {
      updatePageInUrl(page);
      fetchData(true, page, false);
    }
  };

  // Refresh current page
  const refreshData = () => {
    dispatch(resetDrafts());
    fetchData(true, currentPageFromUrl, false);
  };

  // Effect to handle URL changes (back/forward navigation)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("pageNumber")) || 1;
    if (pageFromUrl !== draftPagination.currentPage || location.state?.forceFetch) {
      fetchData(true, pageFromUrl, false);
    }
  }, [searchParams, location.state, draftPagination.currentPage]);

  // Initial data fetch
  useEffect(() => {
    if (drafts.length === 0 || location.state?.forceFetch) {
      fetchData(true, currentPageFromUrl, false);
    }
  }, [drafts.length, location.state, currentPageFromUrl]);

  // Pagination component
  const PaginationControls = () => {
    if (draftPagination.totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        draftPagination.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(
        draftPagination.totalPages,
        startPage + maxVisiblePages - 1
      );

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // First page and ellipsis
      if (startPage > 1) {
        pages.push(
          <button
            key={1}
            onClick={() => goToPage(1)}
            className="group relative px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-blue-700 bg-white/70 hover:bg-blue-50/80 rounded-xl border border-stone-200/60 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10">1</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-blue-100/0 group-hover:from-blue-100/20 group-hover:to-blue-200/20 rounded-xl transition-all duration-300"></div>
          </button>
        );
        if (startPage > 2) {
          pages.push(
            <div
              key="ellipsis1"
              className="flex items-center justify-center px-2 py-2"
            >
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          );
        }
      }

      // Page numbers
      for (let i = startPage; i <= endPage; i++) {
        const isActive = i === draftPagination.currentPage;
        pages.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`group relative px-4 py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all duration-300 transform hover:scale-105 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25 ring-2 ring-blue-200"
                : "text-stone-600 hover:text-blue-700 bg-white/70 hover:bg-blue-50/80 border-stone-200/60 hover:border-blue-200 hover:shadow-md"
            }`}
          >
            <span className="relative z-10">{i}</span>
            {!isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-blue-100/0 group-hover:from-blue-100/20 group-hover:to-blue-200/20 rounded-xl transition-all duration-300"></div>
            )}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"></div>
            )}
          </button>
        );
      }

      // Last page and ellipsis
      if (endPage < draftPagination.totalPages) {
        if (endPage < draftPagination.totalPages - 1) {
          pages.push(
            <div
              key="ellipsis2"
              className="flex items-center justify-center px-2 py-2"
            >
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          );
        }
        pages.push(
          <button
            key={draftPagination.totalPages}
            onClick={() => goToPage(draftPagination.totalPages)}
            className="group relative px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-blue-700 bg-white/70 hover:bg-blue-50/80 rounded-xl border border-stone-200/60 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10">{draftPagination.totalPages}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-blue-100/0 group-hover:from-blue-100/20 group-hover:to-blue-200/20 rounded-xl transition-all duration-300"></div>
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex flex-col items-center space-y-6 mt-16 mb-12">
        {/* Pagination Info */}
        <div className="text-center">
          <p className="text-sm text-stone-500 font-medium">
            Showing page{" "}
            <span className="text-blue-600 font-semibold">
              {draftPagination.currentPage}
            </span>{" "}
            of{" "}
            <span className="text-blue-600 font-semibold">
              {draftPagination.totalPages}
            </span>{" "}
            ({draftPagination.totalCount} drafts)
          </p>
        </div>

        {/* Main Pagination Container */}
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-200/20 via-blue-100/30 to-blue-200/20 rounded-2xl blur-xl"></div>

          {/* Pagination Controls */}
          <div className="relative flex items-center space-x-2 bg-white/90 backdrop-blur-lg rounded-2xl p-3 shadow-xl border border-white/40">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(draftPagination.currentPage - 1)}
              disabled={!draftPagination.hasPrevious}
              className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300 transform ${
                draftPagination.hasPrevious
                  ? "text-stone-600 hover:text-blue-700 bg-white/70 hover:bg-blue-50/80 border-stone-200/60 hover:border-blue-200 shadow-sm hover:shadow-md hover:scale-105"
                  : "text-stone-400 bg-stone-50/50 border-stone-200/40 cursor-not-allowed opacity-60"
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  draftPagination.hasPrevious ? "group-hover:-translate-x-0.5" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {renderPageNumbers()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(draftPagination.currentPage + 1)}
              disabled={!draftPagination.hasNext}
              className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300 transform ${
                draftPagination.hasNext
                  ? "text-stone-600 hover:text-blue-700 bg-white/70 hover:bg-blue-50/80 border-stone-200/60 hover:border-blue-200 shadow-sm hover:shadow-md hover:scale-105"
                  : "text-stone-400 bg-stone-50/50 border-stone-200/40 cursor-not-allowed opacity-60"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  draftPagination.hasNext ? "group-hover:translate-x-0.5" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Jump (optional - shows on larger screens) */}
        {draftPagination.totalPages > 10 && (
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <span className="text-stone-500 font-medium">Quick jump:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={draftPagination.totalPages}
                placeholder="Page"
                className="w-16 px-2 py-1 text-center text-xs border border-stone-200/60 rounded-lg focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 focus:outline-none transition-all duration-200"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= draftPagination.totalPages) {
                      goToPage(page);
                      e.target.value = "";
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  const page = parseInt(input.value);
                  if (page >= 1 && page <= draftPagination.totalPages) {
                    goToPage(page);
                    input.value = "";
                  }
                }}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200"
              >
                Go
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section>
      <div>
        <DraftCard
          title="Your Drafts"
          secondaryTitle="Where your stories begin to take shape"
          data={drafts}
          refetch={refreshData}
        />
        {drafts.length > 0 && <PaginationControls />}
      </div>

      {isLoading && (
        <LoadingOverlay
          isVisible={isLoading}
          message="Loading drafts"
          submessage="Please wait while we load your drafts"
          variant="slate"
          size="medium"
          showDots={true}
        />
      )}

      {isLoadingMore && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-stone-200/50">
          <div className="flex items-center space-x-2 text-sm text-stone-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more drafts...</span>
          </div>
        </div>
      )}
    </section>
  );
}