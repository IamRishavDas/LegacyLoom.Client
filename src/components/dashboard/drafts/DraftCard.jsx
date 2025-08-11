import { Clock } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setIsVisible, resetStoryCardState } from '../../../store/storyCardSlice';
import { renderPreview } from '../../../utils/Utils';

function DraftCard(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isVisible } = useSelector((state) => state.storyCard);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const handleDraftClick = (draft) => {
    navigate(`/drafts/${draft.id}`, { state: { fromStoryCard: true } });
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
          <p className="text-gray-600 text-center">No drafts here to show...</p>
        ) : (
          <div className="space-y-8">
            {props.data.map((draft, index) => (
              <div
                key={draft.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden border border-gray-200 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <Clock size={14} />
                        <span>{formatDate(draft.lastModified)}</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-serif font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200">
                    {draft.title}
                  </h2>

                  <div className="text-gray-600 leading-relaxed mb-4 font-light line-clamp-3">
                    <div
                      className="text-gray-700 leading-relaxed text-lg font-light"
                      dangerouslySetInnerHTML={{
                        __html: renderPreview(draft.content + "   ...  "),
                      }}
                    />
                  </div>

                  <div
                    onClick={() => handleDraftClick(draft)}
                    className="w-fit text-blue-600 text-sm font-medium flex items-center space-x-1 cursor-pointer hover:underline"
                  >
                    <span>Read full draft</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DraftCard;