import { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Heart, ThumbsDown } from 'lucide-react';
import { renderPreview } from '../../../utils/Utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setIsVisible, setCurrentImageIndex, resetStoryCardState } from '../../../store/storyCardSlice';
import { LikeTimeline, DislikeTimeline } from '../../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';

function PublicFeed(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isVisible, currentImageIndex } = useSelector((state) => state.storyCard);
  const [pullState, setPullState] = useState('idle'); // idle, pulling, refreshing
  const [pullDistance, setPullDistance] = useState(0);
  const [loadingStories, setLoadingStories] = useState(new Set()); // Track loading states
  const [stories, setStories] = useState(props.apiData.data); // Local state for stories
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
    // Sync local stories state with props.apiData.data when it changes
    setStories(props.apiData.data);
  }, [props.apiData.data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleTouchStart = (e) => {
      if (window.scrollY <= 10) {
        touchStartY.current = e.touches[0].clientY;
        setPullState('pulling');
      }
    };

    const handleTouchMove = (e) => {
      if (pullState === 'pulling' && touchStartY.current !== null) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - touchStartY.current;
        if (distance > 0) {
          setPullDistance(Math.min(distance, 150));
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullState === 'pulling' && pullDistance > 100) {
        setPullState('refreshing');
        setTimeout(() => {
          dispatch(resetStoryCardState());
          if (props.refetch) {
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

  const handleLike = async (story, e) => {
    e.stopPropagation();
    const storyId = story.id;

    // Set loading state immediately
    setLoadingStories(prev => new Set(prev).add(storyId));
    
    if (loadingStories.has(storyId)) return;

    // Optimistic update with negative count prevention
    setStories(prevStories => prevStories.map(s => {
      if (s.id === storyId) {
        const wasLiked = s.isLikedByMe;
        const wasDisliked = s.isDislikedByMe;
        return {
          ...s,
          isLikedByMe: !wasLiked,
          isDislikedByMe: false, // Remove dislike if liking
          likes: wasLiked ? Math.max(0, s.likes - 1) : s.likes + 1,
          dislikes: wasDisliked ? Math.max(0, s.dislikes - 1) : s.dislikes
        };
      }
      return s;
    }));

    const authToken = localStorage.getItem("token");

    if (!authToken) {
      toast.warn("Login to perform this operation");
      navigate("/user-login");
      setLoadingStories(prev => {
        const newSet = new Set(prev);
        newSet.delete(storyId);
        return newSet;
      });
      // Revert optimistic update
      setStories(props.apiData.data);
      return;
    }

    try {
      const response = await LikeTimeline(authToken, storyId);
      const data = await response.json();
      
      if (response.ok && data.success) {
        // toast.success(data.data.isLiked ? "Story liked!" : "Like removed!");
        // Update with server data
        setStories(prevStories => prevStories.map(s => {
          if (s.id === storyId) {
            return {
              ...s,
              isLikedByMe: data.data.isLiked,
              likes: data.data.likes,
              dislikes: data.data.dislikes
            };
          }
          return s;
        }));
      } else {
        // Revert to server data on failure
        setStories(props.apiData.data);
        toast.error(data.errorMessage || "Failed to update like");
      }
    } catch (error) {
      // Revert to server data on error
      setStories(props.apiData.data);
      toast.error("An error occurred while updating like");
      // console.error('Error liking story:', error);
    } finally {
      setLoadingStories(prev => {
        const newSet = new Set(prev);
        newSet.delete(storyId);
        return newSet;
      });
    }
  };

  const handleDislike = async (story, e) => {
    e.stopPropagation();
    const storyId = story.id;

    // Set loading state immediately
    setLoadingStories(prev => new Set(prev).add(storyId));
    
    if (loadingStories.has(storyId)) return;

    // Optimistic update with negative count prevention
    setStories(prevStories => prevStories.map(s => {
      if (s.id === storyId) {
        const wasDisliked = s.isDislikedByMe;
        const wasLiked = s.isLikedByMe;
        return {
          ...s,
          isDislikedByMe: !wasDisliked,
          isLikedByMe: false, // Remove like if disliking
          dislikes: wasDisliked ? Math.max(0, s.dislikes - 1) : s.dislikes + 1,
          likes: wasLiked ? Math.max(0, s.likes - 1) : s.likes
        };
      }
      return s;
    }));

    const authToken = localStorage.getItem("token");

    if (!authToken) {
      toast.warn("Login to perform this operation");
      navigate("/user-login");
      setLoadingStories(prev => {
        const newSet = new Set(prev);
        newSet.delete(storyId);
        return newSet;
      });
      // Revert optimistic update
      setStories(props.apiData.data);
      return;
    }

    try {
      const response = await DislikeTimeline(authToken, storyId);
      const data = await response.json();
      
      if (response.ok && data.success) {
        // toast.success(data.data.isDisliked ? "Story disliked!" : "Dislike removed!");
        // Update with server data
        setStories(prevStories => prevStories.map(s => {
          if (s.id === storyId) {
            return {
              ...s,
              isDislikedByMe: data.data.isDisliked,
              dislikes: data.data.dislikes,
              likes: data.data.likes
            };
          }
          return s;
        }));
      } else {
        // Revert to server data on failure
        setStories(props.apiData.data);
        toast.error(data.errorMessage || "Failed to update dislike");
      }
    } catch (error) {
      // Revert to server data on error
      setStories(props.apiData.data);
      toast.error("An error occurred while updating dislike");
      // console.error('Error disliking story:', error);
    } finally {
      setLoadingStories(prev => {
        const newSet = new Set(prev);
        newSet.delete(storyId);
        return newSet;
      });
    }
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
            className="group relative px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="relative z-10">1</span>
          </button>
        );
        if (startPage > 2) {
          pages.push(
            <div
              key="ellipsis1"
              className="flex items-center justify-center px-2 py-2"
            >
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
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
            className={`group relative px-4 py-2.5 text-sm font-semibold rounded-lg border shadow-sm transition-all duration-300 ${
              isActive
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <span className="relative z-10">{i}</span>
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
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
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
            className="group relative px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="relative z-10">{props.pagination.totalPages}</span>
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex flex-col items-center space-y-6 mt-16 mb-12">
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">
            Showing page{' '}
            <span className="text-blue-600 font-semibold">
              {props.pagination.currentPage}
            </span>{' '}
            of{' '}
            <span className="text-blue-600 font-semibold">
              {props.pagination.totalPages}
            </span>{' '}
            ({props.pagination.totalCount} stories)
          </p>
        </div>

        <div className="relative">
          <div className="relative flex items-center space-x-2 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
            <button
              onClick={() => props.goToPage(props.pagination.currentPage - 1)}
              disabled={!props.pagination.hasPrevious}
              className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-300 ${
                props.pagination.hasPrevious
                  ? 'text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-300 shadow-sm hover:shadow-md'
                  : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
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

            <div className="flex items-center space-x-1">{renderPageNumbers()}</div>

            <button
              onClick={() => props.goToPage(props.pagination.currentPage + 1)}
              disabled={!props.pagination.hasNext}
              className={`group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-300 ${
                props.pagination.hasNext
                  ? 'text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-300 shadow-sm hover:shadow-md'
                  : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
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

        {props.pagination.totalPages > 10 && (
          <div className="hidden lg:flex items-center space-x-3 text-sm">
            <span className="text-gray-500 font-medium">Quick jump:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={props.pagination.totalPages}
                placeholder="Page"
                className="w-16 px-2 py-1 text-center text-xs border border-gray-300 rounded-lg focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
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
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-gray-100 hover:bg-gray-200 border border-blue-300 rounded-lg transition-colors duration-200"
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
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      <div
        className="fixed top-0 left-0 right-0 h-16 flex items-center justify-center transition-transform duration-300 z-20"
        style={{ transform: `translateY(${pullState === 'pulling' ? pullDistance : 0}px)` }}
      >
        {pullState === 'refreshing' ? (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div className="space-y-8">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden border border-gray-200 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <Clock size={14} />
                        <span>{formatDate(story.lastModified)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200">
                  {story.storyDTO.title}
                </h2>

                <div className="text-gray-600 leading-relaxed mb-4 font-light line-clamp-3">
                  <div
                    className="text-gray-700 leading-relaxed text-lg font-light"
                    dangerouslySetInnerHTML={{
                      __html: renderPreview(story.storyDTO.content + "   ..."),
                    }}
                  />
                </div>

                <div
                  onClick={() => handleStoryClick(story)}
                  className="w-fit text-blue-600 text-sm font-medium flex items-center space-x-1 cursor-pointer hover:underline"
                >
                  <span>Read full story</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {story.storyDTO.medias?.images?.length > 0 && (
                <div className="px-6 pb-4">
                  {story.storyDTO.medias.images.length === 1 ? (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={story.storyDTO.medias.images[0].data}
                        alt={story.storyDTO.title}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={story.storyDTO.medias.images[currentImageIndex[story.id] || 0].data}
                          alt={`${story.storyDTO.title} - Image ${(currentImageIndex[story.id] || 0) + 1}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                        <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {(currentImageIndex[story.id] || 0) + 1} / {story.storyDTO.medias.images.length}
                        </div>

                        {story.storyDTO.medias.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => prevImage(story.id, story.storyDTO.medias.images.length, e)}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={(e) => nextImage(story.id, story.storyDTO.medias.images.length, e)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
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
                                  ? 'bg-blue-500 w-6'
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="px-6 pb-6">
                <div className="flex items-center justify-center space-x-6 bg-gray-50 rounded-lg py-3 border border-gray-200">
                  <button
                    onClick={(e) => handleLike(story, e)}
                    disabled={loadingStories.has(story.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                      story.isLikedByMe
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-300'
                    }`}
                    aria-label={story.isLikedByMe ? `Remove like (${story.likes} likes)` : `Like story (${story.likes} likes)`}
                  >
                    <div className="relative">
                      <Heart 
                        size={18} 
                        className={`transition-all duration-300 ${
                          story.isLikedByMe ? 'fill-current' : 'hover:scale-110'
                        }`}
                      />
                      {loadingStories.has(story.id) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${story.isLikedByMe ? 'text-white' : 'text-gray-700'}`}>
                      {story.likes}
                    </span>
                  </button>

                  <button
                    onClick={(e) => handleDislike(story, e)}
                    disabled={loadingStories.has(story.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                      story.isDislikedByMe
                        ? 'bg-red-500 text-white border-red-500'
                        : 'text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-red-300'
                    }`}
                    aria-label={story.isDislikedByMe ? `Remove dislike (${story.dislikes} dislikes)` : `Dislike story (${story.dislikes} dislikes)`}
                  >
                    <div className="relative">
                      <ThumbsDown 
                        size={18} 
                        className={`transition-all duration-300 ${
                          story.isDislikedByMe ? 'fill-current' : 'hover:scale-110'
                        }`}
                      />
                      {loadingStories.has(story.id) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${story.isDislikedByMe ? 'text-white' : 'text-gray-700'}`}>
                      {story.dislikes}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stories.length > 0 && <PaginationControls />}
      </div>
    </div>
  );
}

export default PublicFeed;