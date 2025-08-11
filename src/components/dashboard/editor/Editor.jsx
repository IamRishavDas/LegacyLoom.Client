import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Image, Upload, X, Save } from 'lucide-react';
import { toast } from "react-toastify";
import { CreateTimeline, CreateDraft } from "../../../apis/apicalls/apicalls";
import LoadingOverlay from "../../loading-overlay/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { renderPreview } from "../../../utils/Utils";
import DraftWarningModal from "../../modals/DraftWarningModal";

const Editor = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [images, setImages] = useState({}); // Store images with unique IDs
  const [imageFiles, setImageFiles] = useState([]); // Store actual File objects for API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      toast.warn("Login to access this page");
      navigate("/user-login");
      return;
    }
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length > 2000) {
      toast.warn("Content cannot exceed 2000 characters");
      setValue(newValue.slice(0, 2000));
    } else {
      setValue(newValue);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    if (newTitle.length > 50) {
      toast.warn("Title cannot exceed 50 characters");
      setTitle(newTitle.slice(0, 50));
    } else {
      setTitle(newTitle);
    }
  };

  const generateImageId = () => {
    return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageCount = Object.keys(images).length;

    if (imageCount + files.length > 4) {
      toast.warn("You can upload a maximum of 4 images");
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const imageId = generateImageId();

        reader.onload = (event) => {
          const imageData = event.target.result;

          // Store image data for preview
          setImages(prev => ({
            ...prev,
            [imageId]: {
              name: file.name,
              data: imageData,
              size: file.size
            }
          }));

          // Store actual file for API submission
          setImageFiles(prev => [...prev, { id: imageId, file: file }]);
        };

        reader.readAsDataURL(file);
      }
    });

    // Clear the input
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    // Remove from images state
    setImages(prev => {
      const newImages = { ...prev };
      delete newImages[imageId];

      // Update sessionStorage
      if (Object.keys(newImages).length === 0) {
        sessionStorage.removeItem('story-editor-images');
      } else {
        sessionStorage.setItem('story-editor-images', JSON.stringify(newImages));
      }

      return newImages;
    });

    // Remove from imageFiles state
    setImageFiles(prev => prev.filter(imageFile => imageFile.id !== imageId));
  };

  const insertFormatting = (tag) => {
    const textarea = document.getElementById('editor-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    switch (tag) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'header':
        formattedText = `# ${selectedText || 'Heading'}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'Quote'}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    if (newValue.length <= 2000) {
      setValue(newValue);
    } else {
      toast.warn("Content cannot exceed 2000 characters");
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!title || title.length < 15 || title.length > 50) {
      errors.push("Title must be between 15 and 50 characters");
    }

    if (!value || value.length < 100 || value.length > 2000) {
      errors.push("Content must be between 100 and 2000 characters");
    }

    const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) {
      errors.push("Content must have at least 10 words");
    }

    const imageCount = Object.keys(images).length;
    if (imageCount > 4) {
      errors.push("Maximum of 4 images allowed");
    }

    return errors;
  };

  const validateDraft = () => {
    const errors = [];

    if (title.length > 50) {
      errors.push("Title cannot exceed 50 characters");
    }

    if (value.length > 2000) {
      errors.push("Content cannot exceed 2000 characters");
    }

    return errors;
  };

  const saveDraft = async () => {
    if (isSavingDraft) return;

    const validationErrors = validateDraft();
    if (validationErrors.length > 0) {
      for (const err of validationErrors) {
        toast.error(err);
      }
      return;
    }

    setIsSavingDraft(true);

    try {
      const formData = new FormData();
      if (title) formData.append('Title', title);
      if (value) formData.append('Content', value);

      const authToken = localStorage.getItem("token");
      const response = await CreateDraft(formData, authToken);

      if (response.status === 401) {
        setIsSavingDraft(false);
        navigate("/user-login");
        return;
      }

      if (response.status === 429) {
        setIsSavingDraft(false);
        toast.warn("Too many requests are made");
        return;
      }

      if (response.status === 403) {
        setIsSavingDraft(false);
        toast.warn("You are unauthorized to perform this operation");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Draft saved successfully");
        navigate("/drafts");
        window.location.reload();
      } else {
        toast.warn(data.errorMessage || "Failed to save draft");
      }
    } catch (error) {
      toast.error("Network error: Please try again later");
    } finally {
      setIsSavingDraft(false);
      setIsDraftModalOpen(false);
    }
  };

  const handleSaveDraftClick = () => {
    const imageCount = Object.keys(images).length;
    if (imageCount > 0) {
      setIsDraftModalOpen(true);
    } else {
      saveDraft();
    }
  };

  const submitStory = async () => {
    if (isSubmitting) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      for (const err of validationErrors) {
        toast.error(err);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;

      formData.append('Story.Title', title);
      formData.append('Story.Content', value);
      formData.append('Story.WordCount', wordCount.toString());

      imageFiles.forEach((imageFile, index) => {
        formData.append('Files', imageFile.file);
      });

      const authToken = localStorage.getItem("token");
      const response = await CreateTimeline(formData, authToken);

      if (response.status === 401) {
        setIsSubmitting(false);
        navigate("/user-login");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Story uploaded successfully");
        navigate("/my-timelines");
        window.location.reload();
      } else {
        toast.warn(data.errorMessage);
      }
    } catch (error) {
      toast.error("Network error: Please check your network connection or try again later");
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;
  const imageCount = Object.keys(images).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
          
          <div className={`transition-all duration-1000 ease-out delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden">
              
              <div className="border-b border-stone-200/50 bg-stone-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => insertFormatting('header')}
                      className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 font-semibold text-sm cursor-pointer"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => insertFormatting('bold')}
                      className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 font-bold text-sm cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      onClick={() => insertFormatting('italic')}
                      className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 italic text-sm cursor-pointer"
                    >
                      I
                    </button>
                    <button
                      onClick={() => insertFormatting('quote')}
                      className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 text-sm cursor-pointer"
                    >
                      " "
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageCount >= 4}
                      className={`flex items-center space-x-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 transition-all duration-200 text-sm cursor-pointer ${imageCount >= 4 ? 'opacity-50 cursor-not-allowed bg-stone-200' : 'hover:bg-stone-100 hover:text-stone-900'}`}
                    >
                      <Image size={14} />
                      <span>Image</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer"
                    >
                      {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span className="hidden sm:inline ml-2">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                    </button>

                    <button 
                      onClick={handleSaveDraftClick}
                      disabled={isSavingDraft}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg cursor-pointer"
                    >
                      <Save size={16} />
                      <span className="hidden sm:inline ml-2">{isSavingDraft ? 'Saving...' : 'Save as Draft'}</span>
                    </button>

                    <button 
                      onClick={submitStory}
                      disabled={isSubmitting}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 disabled:from-stone-400 disabled:to-slate-400 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg cursor-pointer"
                    >
                      <Upload size={16} />
                      <span className="hidden sm:inline ml-2">{isSubmitting ? 'Submitting...' : 'Submit Story'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} transition-all duration-300`}>
                
                <div className="p-6">
                  <div className="mb-4">
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Story title ..."
                      maxLength={50}
                      className="w-full text-2xl font-serif font-bold text-stone-800 placeholder-stone-400 bg-transparent border-none outline-none focus:ring-0"
                    />
                    <div className="text-xs text-stone-500 mt-1">
                      {title.length}/50 characters
                    </div>
                  </div>
                  <textarea
                    id="editor-textarea"
                    value={value}
                    onChange={handleChange}
                    placeholder="Once upon a time...

Begin weaving your story here. Share your memories, dreams, and moments that matter. Every word adds to the tapestry of your legacy.

Minimum 100 characters and 10 words required."
                    maxLength={2000}
                    className="w-full h-96 md:h-[500px] text-stone-700 placeholder-stone-400 bg-transparent border-none outline-none resize-none focus:ring-0 leading-relaxed text-base"
                    style={{ fontFamily: 'inherit' }}
                  />

                  {imageCount > 0 && (
                    <div className="mt-6 pt-6 border-t border-stone-200/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <Image size={18} className="text-stone-600" />
                        <h4 className="font-serif font-semibold text-stone-800">Attached Images ({imageCount}/4)</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Object.entries(images).map(([imageId, imageData]) => (
                          <div key={imageId} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-stone-100 border-2 border-stone-200/50 shadow-sm">
                              <img
                                src={imageData.data}
                                alt={imageData.name}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                            </div>
                            <button
                              onClick={() => removeImage(imageId)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <X size={12} />
                            </button>
                            <p className="text-xs text-stone-500 mt-2 truncate text-center" title={imageData.name}>
                              {imageData.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {showPreview && (
                  <div className="border-l border-stone-200/50 bg-stone-50/30">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold text-stone-800 mb-4 flex items-center space-x-2">
                        <Eye size={20} />
                        <span>Live Preview</span>
                      </h3>
                      <div className="mb-4">
                        {title && (
                          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-6">{title}</h1>
                        )}
                      </div>
                      <div 
                        className="prose prose-stone max-w-none text-stone-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: renderPreview(value) || '<p class="text-stone-400 italic">Your story will appear here as you write...</p>' 
                        }}
                      />
                      
                      {imageCount > 0 && (
                        <div className="mt-8 pt-6 border-t border-stone-300/50">
                          <h4 className="font-serif font-semibold text-stone-800 mb-4 flex items-center space-x-2">
                            <Image size={18} />
                            <span>Images in this story</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(images).map(([imageId, imageData]) => (
                              <div key={imageId} className="rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={imageData.data}
                                  alt={imageData.name}
                                  className="w-full aspect-video object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-200/50 bg-stone-50/50 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-stone-500">
                    <span className="font-medium">{value.length}/2000</span> characters • 
                    <span className="font-medium">{wordCount}</span> words • 
                    <span className="font-medium">{imageCount}/4</span> images
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-stone-500">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${validateForm().length === 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                      <span>{validateForm().length === 0 ? 'Ready to submit' : 'Validation required'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-8 transition-all duration-1000 ease-out delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-stone-200/50">
              <h3 className="font-serif font-semibold text-stone-800 mb-3">Writing Tips for Your Legacy</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-600">
                <div>
                  <strong className="text-stone-700">Be Authentic:</strong> Write in your own voice, let your personality shine through every word.
                </div>
                <div>
                  <strong className="text-stone-700">Include Images:</strong> Add up to 4 photos to bring your memories to life and create visual storytelling.
                </div>
                <div>
                  <strong className="text-stone-700">Requirements:</strong> Title: 15-50 chars, Content: 100-2000 chars, min 10 words.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay
        isVisible={isSubmitting || isSavingDraft}
        message={isSavingDraft ? "Saving draft" : "Uploading timeline"}
        submessage={isSavingDraft ? "Please wait while we save your draft" : "Please wait while we upload your timeline"}
        variant="slate"
        size="medium"
        showDots={true}
      />

      <DraftWarningModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        onConfirm={saveDraft}
        isLoading={isSavingDraft}
        imageCount={imageCount}
      />
    </>
  );
};

export default Editor;