import { useState, useEffect } from 'react';
import { Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { renderPreview } from '../../../utils/Utils';
import { useNavigate } from 'react-router-dom';

function PublicFeed(prop) {

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

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
    navigate(`/dashboard/${story.id}`);
  };

  const nextImage = (storyId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [storyId]: ((prev[storyId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (storyId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [storyId]: ((prev[storyId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const goToImage = (storyId, index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [storyId]: index
    }));  
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-slate-100">
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
          {prop.apiData.data.map((story, index) => (
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
                        {/* <span>•</span>
                        <Eye size={14} />
                        <span>public</span> */}
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
                      __html: renderPreview(story.storyDTO.content) 
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
      </div>
    </div>
  );
}

export default PublicFeed;