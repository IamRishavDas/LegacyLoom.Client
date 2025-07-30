import { Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setIsVisible, setCurrentImageIndex, resetStoryCardState } from '../../store/storyCardSlice';

function StoryCard(props) {
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
          dispatch(resetStoryCardState()); // Resets isVisible, currentImageIndex, and timelines
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getAuthorInitials = (userId) => {
    const hash = userId.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars[Math.abs(hash) % 26] + chars[Math.abs(hash >> 8) % 26];
  };

  const getAuthorName = (userId) => {
    const names = ['Elena Rodriguez', 'Marcus Thompson', 'Sophia Chen', 'James Wilson', 'Maya Patel'];
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return names[hash % names.length];
  };

  const getRandomLikes = () => Math.floor(Math.random() * 50) + 5;
  const getRandomComments = () => Math.floor(Math.random() * 15) + 1;

  const handleStoryClick = (story) => {
    navigate(`/my-timelines/${story.id}`, { state: { fromStoryCard: true } });
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
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-slate-100">
      <div
        className="fixed top-0 left-0 right-0 h-16 flex items-center justify-center bg-amber-100 transition-transform duration-300"
        style={{ transform: `translateY(${pullState === 'pulling' ? pullDistance : 0}px)` }}
      >
        {pullState === 'refreshing' ? (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
        ) : (
          <span className="text-stone-600">Pull to refresh</span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div
          className={`text-center mb-12 transition-all duration-1000 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
            {props.title || 'Legacy Stories'}
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {props.secondaryTitle || 'Discover meaningful stories that connect generations and preserve memories'}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-8">
          {props.data.map((story, index) => (
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
                        <span>{formatDate(story.createdAt)}</span>
                        <span>•</span>
                        <Eye size={14} />
                        <span>{story.visibility.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-3 hover:text-amber-700 transition-colors duration-200">
                  {story.storyDTO.title}
                </h2>

                <p className="text-stone-600 leading-relaxed mb-4 font-light line-clamp-3">
                  {story.storyDTO.content + ' ...'}
                </p>

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

        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-full hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            Discover More Stories
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryCard;