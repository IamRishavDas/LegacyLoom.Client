import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../loading-overlay/LoadingOverlay";
import { Clock, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";
import { renderPreview } from "../../../utils/Utils";
import { DeleteDraft, GetMyDraftById } from "../../../apis/apicalls/apicalls";

export default function Draft() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const deleteDraft = async () => {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      toast.warn("Login to perform this action");
      navigate("/user-login");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await DeleteDraft(authToken, id);

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
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        navigate("/drafts");
        toast.success("Draft deleted successfully");
        window.location.reload();
      } else {
        toast.error(data.errorMessage || "Failed to delete draft");
      }
    } catch (error) {
      toast.error("Network error: Please try again later");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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
        const response = await GetMyDraftById(authToken, id);

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
          setDraft(data.data);
        } else {
          toast.error(data.errorMessage || "Failed to load draft");
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
        message="Loading draft"
        submessage="Please wait while we load your draft"
        variant="slate"
        size="medium"
        showDots={true}
      />
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-stone-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <p className="text-stone-600 text-center">Failed to load draft. Please try again.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Drafts</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-stone-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Header with Back Button and Delete Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/drafts", { state: { fromBackNavigation: true } })}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Drafts</span>
            </button>

            <button
              style={{ cursor: "pointer" }}
              onClick={openDeleteModal}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <Trash2 size={16} />
              <span>Delete Draft</span>
            </button>
          </div>

          {/* Draft Detail */}
          <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-stone-200/50">
            <div className="p-8 pb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <div className="flex items-center text-stone-500 space-x-3">
                    <Clock size={16} />
                    <span>{formatDate(draft.createdAt)}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
                {draft.title}
              </h1>
            </div>

            <div className="px-8 pb-8">
              <div className="prose prose-lg prose-stone max-w-none">
                <div
                  className="text-stone-700 leading-relaxed text-lg font-light"
                  dangerouslySetInnerHTML={{
                    __html: renderPreview(draft.content)
                  }}
                />
              </div>
            </div>
          </article>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={deleteDraft}
            isLoading={isDeleting}
            storyTitle={draft.title || "this draft"}
          />
        </div>
      </div>
    </section>
  );
}