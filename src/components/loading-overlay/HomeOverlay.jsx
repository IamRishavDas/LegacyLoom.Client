
export default function HomeOverlay({
  isVisible = false,
  message = "Loading...",
  submessage = null,
  variant = "blue", // blue, gray, dark
  size = "medium", // small, medium, large
  showSpinner = true,
  showDots = true,
  customIcon = null,
  onCancel = null,
  cancelText = "Cancel",
}) {
  if (!isVisible) return null;

    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Animated Legacy Loom text */}
        <div className="mb-6 flex justify-center items-center">
          <div className="flex text-4xl font-bold text-gray-800">
            Legacy Loom
          </div>
        </div>

        {/* Simple loading dots */}
        <div className="flex justify-center mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" style={{ animationDelay: '0.4s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" style={{ animationDelay: '0.6s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="text-lg font-medium text-gray-800 mb-1">{message}</div>
        {submessage && <div className="text-sm text-gray-600">{submessage}</div>}
      </div>
    </div>
  );
}