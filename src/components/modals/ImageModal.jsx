import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

const ImageModal = ({ isOpen, images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLoading(true);
      setIsZoomed(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLoading(true);
      setIsZoomed(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

const downloadImage = async () => {
    try {
        const imageUrl = images[currentIndex].data;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `image-${currentIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    } catch (error) {
        // console.error('Failed to download image:', error);
    }
};

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm hover:scale-110"
        >
          <X size={24} />
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2">
          <button
            onClick={toggleZoom}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm hover:scale-110"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={downloadImage}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm hover:scale-110"
            title="Download Image"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Previous Button */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Image Container */}
        <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Main Image */}
          <img
            src={currentImage.data}
            alt={`Image ${currentIndex + 1}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`
              max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-500 ease-out
              ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in hover:scale-105'}
            `}
            onClick={toggleZoom}
          />
        </div>

        {/* Image Thumbnails for Multiple Images */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex justify-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full p-2 max-w-[80vw] overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsLoading(true);
                    setIsZoomed(false);
                  }}
                  className={`
                    relative w-10 h-10 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0
                    ${index === currentIndex 
                      ? 'ring-0 ring-white ring-offset-2 ring-offset-black/50 scale-110' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  <img
                    src={image.data}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Hint */}
        {/* {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 text-white/70 text-sm text-center px-4">
            <div className="hidden sm:block">Use arrow keys or click arrows to navigate</div>
            <div className="sm:hidden">Swipe or tap arrows to navigate</div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ImageModal;