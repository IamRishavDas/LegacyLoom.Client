import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetMyTimelineById } from "../../../apis/apicalls/apicalls";
import LoadingOverlay from "../../loading-overlay/LoadingOverlay";
import { Clock, Eye } from "lucide-react";
import { toast } from "react-toastify";

export default function MyTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  useEffect(() => {
    const getData = async () => {
      if (isLoading) return;
      const authToken = localStorage.getItem("token");
      setIsLoading(true);
      try {
        const response = await GetMyTimelineById(authToken, id);
        if (response.status === 401) {
          setIsLoading(false);
          navigate("/user-login");
          toast.info("Please log in again");
          return;
        }
        const data = await response.json();
        if (data.success) {
          setStory(data.data);
        } else {
          toast.error(data.errorMessage || "Failed to load story");
        }
      } catch (error) {
        console.error("Error fetching timeline:", error);
        toast.error("Network error: Please check your network connection or try again later");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <LoadingOverlay
        isVisible={isLoading}
        message="Loading timeline"
        submessage="Please wait while we load your timeline"
        variant="slate"
        size="medium"
        showDots={true}
      />
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <p className="text-stone-600 text-center">Failed to load story. Please try again.</p>
          <button
            onClick={() => navigate("/my-timelines", { state: { fromBackNavigation: true } })}
            className="mt-4 flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Stories</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Back Button */}
          <button
            onClick={() => navigate("/my-timelines", { state: { fromBackNavigation: true } })}
            className="mb-8 flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Stories</span>
          </button>

          {/* Story Detail */}
          <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-stone-200/50">
            <div className="p-8 pb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <div className="flex items-center text-stone-500 space-x-3">
                    <Clock size={16} />
                    <span>{formatDate(story.createdAt)}</span>
                    <span>•</span>
                    <Eye size={16} />
                    <span>{story.visibility.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
                {story.storyDTO.title}
              </h1>
            </div>

            {story.storyDTO.medias?.images?.length > 0 && (
              <div className="px-8 pb-6">
                {story.storyDTO.medias.images.length === 1 ? (
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={story.storyDTO.medias.images[0].data}
                      alt={story.storyDTO.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {story.storyDTO.medias.images.map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl shadow-lg">
                        <img
                          src={image.data}
                          alt={`${story.storyDTO.title} - Image ${index + 1}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="px-8 pb-8">
              <div className="prose prose-lg prose-stone max-w-none">
                <p className="text-stone-700 leading-relaxed text-lg font-light">
                  {story.storyDTO.content}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}