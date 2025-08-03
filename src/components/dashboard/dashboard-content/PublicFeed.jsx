import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { renderPreview } from '../../../utils/Utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setIsVisible, setCurrentImageIndex, resetStoryCardState } from '../../../store/storyCardSlice';

function PublicFeed(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isVisible, currentImageIndex } = useSelector((state) => state.storyCard);
  const [pullState, setPullState] = useState('idle'); // idle, pulling, refreshing
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isVisible && !location.state?.fromBackNavigation) {
      const timer = setTimeout(() => {
        dispatch(setIsVisible(true));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, dispatch, location.state]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      // console.warn('Container ref is null');
      return;
    }

    const handleTouchStart = (e) => {
      // console.log('Touch start, scrollY:', window.scrollY);
      if (window.scrollY <= 10) {
        touchStartY.current = e.touches[0].clientY;
        setPullState('pulling');
        console.log('Pulling started, touchStartY:', touchStartY.current);
      }
    };

    const handleTouchMove = (e) => {
      if (pullState === 'pulling' && touchStartY.current !== null) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - touchStartY.current;
        // console.log('Touch move, distance:', distance);
        if (distance > 0) {
          setPullDistance(Math.min(distance, 150));
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      // console.log('Touch end, pullState:', pullState, 'pullDistance:', pullDistance);
      if (pullState === 'pulling' && pullDistance > 100) {
        setPullState('refreshing');
        // console.log('Starting refresh');
        setTimeout(() => {
          // console.log('reloading...');
          dispatch(resetStoryCardState());
          if (props.refetch) {
            // console.log('Calling refetch');
            props.refetch();
          }
          setPullState('idle');
          setPullDistance(0);
        }, 1000);
      } else {
        setPullState('idle');
        setPullDistance(0);
      }
      touchStartY.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      // console.log('Cleaning up touch event listeners');
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullState, pullDistance, dispatch, props.refetch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const handleStoryClick = (story) => {
    navigate(`/dashboard/${story.id}`, { state: { fromBackNavigation: true } });
  };

  const nextImage = (storyId, totalImages, e) => {
    e.stopPropagation();
    dispatch(
      setCurrentImageIndex({
        [storyId]: ((currentImageIndex[storyId] || 0) + 1) % totalImages,
      })
    );
  };

  const prevImage = (storyId, totalImages, e) => {
    e.stopPropagation();
    dispatch(
      setCurrentImageIndex({
        [storyId]: ((currentImageIndex[storyId] || 0) - 1 + totalImages) % totalImages,
      })
    );
  };

  const goToImage = (storyId, index, e) => {
    e.stopPropagation();
    dispatch(setCurrentImageIndex({ [storyId]: index }));
  };

  // Pagination component
  const PaginationControls = () => {
    if (props.pagination.totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        props.pagination.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(
        props.pagination.totalPages,
        startPage + maxVisiblePages - 1
      );

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(
          <button
            key={1}
            onClick={() => props.goToPage(1)}
            className="group relative px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-amber-700 bg-white/70 hover:bg-amber-50/80 rounded-xl border border-stone-200/60 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10">1</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 to-amber-100/0 group-hover:from-amber-100/20 group-hover:to-amber-200/20 rounded-xl transition-all duration-300"></div>
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
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        const isActive = i === props.pagination.currentPage;
        pages.push(
          <button
            key={i}
            onClick={() => props.goToPage(i)}
            className={`group relative px-4 py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all duration-300 transform hover:scale-105 ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/25 ring-2 ring-amber-200'
                : 'text-stone-600 hover:text-amber-700 bg-white/70 hover:bg-amber-50/80 border-stone-200/60 hover:border-amber-200 hover:shadow-md'
            }`}
          >
            <span className="relative z-10">{i}</span>
            {!isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 to-amber-100/0 group-hover:from-amber-100/20 group-hover:to-amber-200/20 rounded-xl transition-all duration-300"></div>
            )}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"></div>
            )}
          </button>
        );
      }

      if (endPage < props.pagination.totalPages) {
        if (endPage < props.pagination.totalPages - 1) {
          pages.push(
            <div
              key="ellipsis2"
              className="flex items-center justify-center px-2 py-2"
            >
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-stone-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          );
        }
        pages.push(
          <button
            key={props.pagination.totalPages}
            onClick={() => props.goToPage(props.pagination.totalPages)}
            className="group relative px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-amber-700 bg-white/70 hover:bg-amber-50/80 rounded-xl border border-stone-200/60 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10">{props.pagination.totalPages}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 to-amber-100/0 group-hover:from-amber-100/20 group-hover:to-amber-200/20 rounded-xl transition-all duration-300"></div>
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
            Showing page{' '}
            <span className="text-amber-600 font-semibold">
              {props.pagination.currentPage}
            </span>{' '}
            of{' '}
            <span className="text-amber-600 font-semibold">
              {props.pagination.totalPages}
            </span>{' '}
            ({props.pagination.totalCount} stories)
          </p>
        </div>

        {/* Main Pagination Container */}
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-200/20 via-amber-100/30 to-amber-200/20 rounded-2xl blur-xl"></div>

          {/* Pagination Controls */}
          <div className="relative flex items-center space-x-2 bg-white/90 backdrop-blur-lg rounded-2xl p-3 shadow-xl border border-white/40">
            {/* Previous Button */}
            <button
              onClick={() => props.goToPage(props.pagination.currentPage - 1)}
              disabled={!props.pagination.hasPrevious}
              className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300 transform ${
                props.pagination.hasPrevious
                  ? 'text-stone-600 hover:text-amber-700 bg-white/70 hover:bg-amber-50/80 border-stone-200/60 hover:border-amber-200 shadow-sm hover:shadow-md hover:scale-105'
                  : 'text-stone-400 bg-stone-50/50 border-stone-200/40 cursor-not-allowed opacity-60'
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  props.pagination.hasPrevious ? 'group-hover:-translate-x-0.5' : ''
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
            <div className="flex items-center space-x-1">{renderPageNumbers()}</div>

            {/* Next Button */}
            <button
              onClick={() => props.goToPage(props.pagination.currentPage + 1)}
              disabled={!props.pagination.hasNext}
              className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300 transform ${
                props.pagination.hasNext
                  ? 'text-stone-600 hover:text-amber-700 bg-white/70 hover:bg-amber-50/80 border-stone-200/60 hover:border-amber-200 shadow-sm hover:shadow-md hover:scale-105'
                  : 'text-stone-400 bg-stone-50/50 border-stone-200/40 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  props.pagination.hasNext ? 'group-hover:translate-x-0.5' : ''
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
        {props.pagination.totalPages > 10 && (
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <span className="text-stone-500 font-medium">Quick jump:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={props.pagination.totalPages}
                placeholder="Page"
                className="w-16 px-2 py-1 text-center text-xs border border-stone-200/60 rounded-lg focus:border-amber-300 focus:ring-2 focus:ring-amber-200/50 focus:outline-none transition-all duration-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= props.pagination.totalPages) {
                      props.goToPage(page);
                      e.target.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  const page = parseInt(input.value);
                  if (page >= 1 && page <= props.pagination.totalPages) {
                    props.goToPage(page);
                    input.value = '';
                  }
                }}
                className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors duration-200"
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
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-slate-100">
      <div
        className="fixed top-0 left-0 right-0 h-16 flex items-center justify-center  transition-transform duration-300"
        style={{ transform: `translateY(${pullState === 'pulling' ? pullDistance : 0}px)` }}
      >
        {pullState === 'refreshing' ? (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
          // <span className="text-stone-600">Pull to refresh</span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div
          className={`text-center mb-12 transition-all duration-1000 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
            Stories
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Discover meaningful stories that connect generations and preserve memories
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-8">
          {props.apiData.data.map((story, index) => (
            <div
              key={story.id}
              onClick={() => handleStoryClick(story)}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-stone-200/50 cursor-pointer transform hover:scale-[1.02] ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center text-sm text-stone-500 space-x-2">
                        <Clock size={14} />
                        <span>{formatDate(story.lastModified)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-3 hover:text-amber-700 transition-colors duration-200">
                  {story.storyDTO.title}
                </h2>

                <div className="text-stone-600 leading-relaxed mb-4 font-light line-clamp-3">
                  <div
                    className="text-stone-700 leading-relaxed text-lg font-light"
                    dangerouslySetInnerHTML={{
                      __html: renderPreview(story.storyDTO.content + "   ... see more"),
                    }}
                  />
                </div>

                <div className="text-amber-600 text-sm font-medium flex items-center space-x-1">
                  <span>Read full story</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {story.storyDTO.medias?.images?.length > 0 && (
                <div className="px-6 pb-4">
                  {story.storyDTO.medias.images.length === 1 ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={story.storyDTO.medias.images[0].data}
                        alt={story.storyDTO.title}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={story.storyDTO.medias.images[currentImageIndex[story.id] || 0].data}
                          alt={`${story.storyDTO.title} - Image ${(currentImageIndex[story.id] || 0) + 1}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                          {(currentImageIndex[story.id] || 0) + 1} / {story.storyDTO.medias.images.length}
                        </div>

                        {story.storyDTO.medias.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => prevImage(story.id, story.storyDTO.medias.images.length, e)}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200 backdrop-blur-sm"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={(e) => nextImage(story.id, story.storyDTO.medias.images.length, e)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200 backdrop-blur-sm"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </div>

                      {story.storyDTO.medias.images.length > 1 && (
                        <div className="flex justify-center mt-3 space-x-2">
                          {story.storyDTO.medias.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => goToImage(story.id, index, e)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                (currentImageIndex[story.id] || 0) === index
                                  ? 'bg-amber-500 w-6'
                                  : 'bg-stone-300 hover:bg-stone-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {props.apiData.data.length > 0 && <PaginationControls />}
      </div>
    </div>
  );
}

export default PublicFeed;