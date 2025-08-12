import { Clock, Eye, ChevronLeft, ChevronRight, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setIsVisible, setCurrentImageIndex, resetStoryCardState } from '../../store/storyCardSlice';
import { renderPreview } from '../../utils/Utils';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import { DeleteMyTimeline } from '../../apis/apicalls/apicalls';

function StoryCard(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isVisible, currentImageIndex } = useSelector((state) => state.storyCard);
  const [pullState, setPullState] = useState('idle'); // idle, pulling, refreshing
  const [pullDistance, setPullDistance] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState(null); // Track which dropdown is open
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null); // Track story for deletion
  const touchStartY = useRef(null);
  const containerRef = useRef(null);
  const dropdownRefs = useRef({}); // Store refs for each dropdown

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
    if (!container) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
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
          if (props.refetch) props.refetch();
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId) {
        const dropdown = dropdownRefs.current[openDropdownId];
        if (dropdown && !dropdown.contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openDropdownId]);

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
    navigate(`/my-timelines/${story.id}`, { state: { fromStoryCard: true } });
  };

  const toggleDropdown = (storyId, event) => {
    event.stopPropagation(); // Prevent triggering any parent click handlers
    setOpenDropdownId(openDropdownId === storyId ? null : storyId);
  };

  // const handleEdit = async (story, event) => {
  //   event.stopPropagation();
  //   setOpenDropdownId(null);

  //   const authToken = localStorage.getItem("token");
  //   if (!authToken) {
  //     toast.warn("Login to perform this action");
  //     navigate("/user-login");
  //     return;
  //   }

  //   try {
  //     const response = await GetMyTimelineById(authToken, story.id);
  //     if (response.status === 401) {
  //       toast.warn("Login to perform this action");
  //       navigate("/user-login");
  //       return;
  //     }

  //     if (response.status === 429) {
  //       toast.warn("Too many requests are made");
  //       return;
  //     }

  //     if (response.status === 403) {
  //       toast.warn("You are unauthorized to perform this operation");
  //       return;
  //     }

  //     const data = await response.json();
  //     if (data.success) {
  //       navigate('/timeline-editor', { state: { story: data.data.storyDTO } });
  //     } else {
  //       toast.error(data.errorMessage || "Failed to load story");
  //     }
  //   } catch (error) {
  //     toast.error("Network error: Please try again later");
  //   }
  // };

  const handleDelete = (story, event) => {
    event.stopPropagation();
    setSelectedStory(story);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const deleteStory = async () => {
    if (!selectedStory) return;

    const authToken = localStorage.getItem("token");

    if (!authToken) {
      toast.warn("Login to perform this action");
      navigate("/user-login");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await DeleteMyTimeline(authToken, selectedStory.id);

      if (response.status === 429) {
        toast.warn("Too many requests are made");
        return;
      }

      if (response.status === 403) {
        toast.warn("You are unauthorized to perform this operation");
        return;
      }

      if (response.status === 401) {
        toast.warn("Login to perform this action");
        navigate("/user-login");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Story deleted successfully");
        if (props.refetch) props.refetch();
        navigate("/my-timelines");
      } else {
        toast.error(data.errorMessage || "Failed to delete story");
      }
    } catch (error) {
      toast.error("Network error: Please try again later");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedStory(null);
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
        {props.data.length === 0 ? (
          <p className="text-gray-600 text-center">No stories here to show...</p>
        ) : (
          <div className="space-y-8">
            {props.data.map((story, index) => (
              <div
                key={story.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden border border-gray-200 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="p-6 pb-4 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <Clock size={14} />
                        <span>{formatDate(story.lastModified)}</span>
                        <span>•</span>
                        <Eye size={14} />
                        <span>{story.visibility.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(story.id, e)}
                        className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer"
                        aria-label="Story options"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {openDropdownId === story.id && (
                        <div
                          ref={(el) => (dropdownRefs.current[story.id] = el)}
                          className="absolute right-0 top-10 z-30 w-48 bg-white border border-stone-200 shadow-lg rounded-lg overflow-hidden"
                        >
                          {/* <button
                            onClick={(e) => handleEdit(story, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors duration-200 focus:outline-none focus:bg-stone-100 cursor-pointer"
                          >
                            <Edit2 size={16} className="mr-2 text-stone-600" />
                            Edit Story
                          </button> */}
                          <button
                            onClick={(e) => handleDelete(story, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors duration-200 focus:outline-none focus:bg-stone-100 cursor-pointer"
                          >
                            <Trash2 size={16} className="mr-2 text-red-600" />
                            Delete Story
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-serif font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200">
                    {story.storyDTO.title}
                  </h2>

                  <div className="text-gray-600 leading-relaxed mb-4 font-light line-clamp-3">
                    <div
                      className="text-gray-700 leading-relaxed text-lg font-light"
                      dangerouslySetInnerHTML={{
                        __html: renderPreview(story.storyDTO.content + "   ...  "),
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
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStory(null);
        }}
        onConfirm={deleteStory}
        isLoading={isDeleting}
        storyTitle={selectedStory?.storyDTO?.title || "this story"}
      />
    </div>
  );
}

export default StoryCard;