import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetPublicTimelineById } from "../../../apis/apicalls/apicalls";
import LoadingOverlay from "../../loading-overlay/LoadingOverlay";
import { Clock, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import ImageModal from "../../modals/ImageModal";
import { escapeJsonString, renderPreview } from "../../../utils/Utils";

export default function PublicTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // New state for download button
  const [story, setStory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
  };

  const handleDownloadVoiceover = async () => {
    if (!story?.storyDTO?.title || !story?.storyDTO?.content) {
      toast.error("Story title or content is missing");
      return;
    }

    setIsDownloading(true); // Set download button loading state
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      setIsDownloading(false);
      navigate("/user-login");
      toast.warn("Login to download voiceover");
      return;
    }

    try {
      const response = await fetch("https://legacyloomaispring-hrfzh2a4eeb3fsdm.canadacentral-01.azurewebsites.net/api/tts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          title: escapeJsonString(story.storyDTO.title),
          content: escapeJsonString(story.storyDTO.content),
        }),
      });

      if (response.status === 429) {
        toast.warn("Too many requests. Please try again later.");
        setIsDownloading(false);
        return;
      }

      if (response.status === 401) {
        toast.warn("Login to download voiceover");
        navigate("/user-login");
        setIsDownloading(false);
        return;
      }

      if (response.status === 400) {
        toast.error("Invalid story data. Please check title and content.");
        setIsDownloading(false);
        return;
      }

      if (response.status === 503) {
        toast.error("Text-to-speech service unavailable. Try again later.");
        setIsDownloading(false);
        return;
      }

      if (!response.ok) {
        toast.error("Failed to generate voiceover");
        setIsDownloading(false);
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filename = disposition
        ? disposition.match(/filename="(.+)"/)?.[1] || "narration.wav"
        : `${escapeJsonString(story.storyDTO.title).replace(/[^a-zA-Z0-9]/g, "_")}_narration.wav`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Voiceover downloaded successfully");
    } catch (error) {
      console.error("Error generating voiceover:", error);
      toast.error("Network error: Please check your connection or try again later");
    } finally {
      setIsDownloading(false); // Reset download button loading state
    }
  };

  useEffect(() => {
    const getData = async () => {
      if (isLoading) return;
      const authToken = localStorage.getItem("token");
      
      setIsLoading(true);
      
      if (authToken === null) {
        setIsLoading(false);
        navigate("/user-login");
        toast.warn("Login to access this page");
        return;
      }

      try {
        const response = await GetPublicTimelineById(authToken, id);

        if (response.status === 429) {
          toast.warn("Too many requests are made");
          return;
        }

        if (response.status === 401) {
          setIsLoading(false);
          toast.warn("Login to access this page");
          navigate("/user-login");
          return;
        }
        const data = await response.json();
        if (data.success) {
          setStory(data.data);
        } else {
          toast.error(data.errorMessage || "Failed to load story");
        }
      } catch (error) {
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
            style={{ cursor: "pointer" }}
            onClick={() => window.history.back()}
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
          {/* Back Button and Download Button */}
          <div className="mb-8 flex justify-between items-center">
            <button
              style={{ cursor: "pointer" }}
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Stories</span>
            </button>
            <button
              style={{ cursor: isDownloading ? "not-allowed" : "pointer" }}
              onClick={handleDownloadVoiceover}
              disabled={isDownloading}
              className={`flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors duration-200 bg-white/90 rounded-lg px-4 py-2 shadow-md ${
                isDownloading ? "opacity-50" : ""
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Voiceover</span>
                </>
              )}
            </button>
          </div>

          {/* Story Detail */}
          <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-stone-200/50">
            <div className="p-8 pb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <div className="flex items-center text-stone-500 space-x-3">
                    <Clock size={16} />
                    <span>{formatDate(story.createdAt)}</span>
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
                  <div 
                    className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer group"
                    onClick={() => openImageModal(0)}
                  >
                    <img
                      src={story.storyDTO.medias.images[0].data}
                      alt={story.storyDTO.title}
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {story.storyDTO.medias.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer group"
                        onClick={() => openImageModal(index)}
                      >
                        <img
                          src={image.data}
                          alt={`${story.storyDTO.title} - Image ${index + 1}`}
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:from-black/20 transition-all duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        {story.storyDTO.medias.images.length > 1 && (
                          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {index + 1}/{story.storyDTO.medias.images.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="px-8 pb-8">
              <div className="prose prose-lg prose-stone max-w-none">
                <div 
                  className="text-stone-700 leading-relaxed text-lg font-light"
                  dangerouslySetInnerHTML={{ 
                    __html: renderPreview(story.storyDTO.content) 
                  }}
                />
              </div>
            </div>
          </article>

          {/* Image Modal */}
          <ImageModal
            isOpen={isModalOpen}
            images={story?.storyDTO?.medias?.images || []}
            initialIndex={selectedImageIndex}
            onClose={closeImageModal}
          />
        </div>
      </div>
    </section>
  );
}