import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, FileText } from 'lucide-react';

const Editor = () => {
  const [value, setValue] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Simple rich text editor implementation (since ReactQuill isn't available)
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const insertFormatting = (tag) => {
    const textarea = document.getElementById('editor-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    switch(tag) {
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
    setValue(newValue);
  };

  const renderPreview = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-serif font-bold text-stone-800 mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-serif font-semibold text-stone-800 mb-3">$1</h2>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-stone-300 pl-4 italic text-stone-600 my-4">$1</blockquote>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden">
      
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
        
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-stone-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-stone-100" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Craft Your Story
            </h1>
          </div>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Let your memories flow onto the page, where every word becomes part of your legacy
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-stone-400 to-slate-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Editor Container */}
        <div className={`transition-all duration-1000 ease-out delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden">
            
            {/* Toolbar */}
            <div className="border-b border-stone-200/50 bg-stone-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => insertFormatting('header')}
                    className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 font-semibold text-sm"
                  >
                    H1
                  </button>
                  <button
                    onClick={() => insertFormatting('bold')}
                    className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 font-bold text-sm"
                  >
                    B
                  </button>
                  <button
                    onClick={() => insertFormatting('italic')}
                    className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 italic text-sm"
                  >
                    I
                  </button>
                  <button
                    onClick={() => insertFormatting('quote')}
                    className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all duration-200 text-sm"
                  >
                    " "
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg">
                    <Save size={16} />
                    <span className="hidden sm:inline">Save Story</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor and Preview Layout */}
            <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} transition-all duration-300`}>
              
              {/* Editor */}
              <div className="p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Give your story a beautiful title..."
                    className="w-full text-2xl font-serif font-bold text-stone-800 placeholder-stone-400 bg-transparent border-none outline-none focus:ring-0"
                  />
                </div>
                <textarea
                  id="editor-textarea"
                  value={value}
                  onChange={handleChange}
                  placeholder="Once upon a time...

Begin weaving your story here. Share your memories, dreams, and moments that matter. Every word adds to the tapestry of your legacy.

*Use formatting:*
**bold text**
*italic text*  
# Headings
> Quotes"
                  className="w-full h-96 md:h-[500px] text-stone-700 placeholder-stone-400 bg-transparent border-none outline-none resize-none focus:ring-0 leading-relaxed text-base"
                  style={{ fontFamily: 'inherit' }}
                />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border-l border-stone-200/50 bg-stone-50/30">
                  <div className="p-6">
                    <h3 className="text-lg font-serif font-semibold text-stone-800 mb-4 flex items-center space-x-2">
                      <Eye size={20} />
                      <span>Live Preview</span>
                    </h3>
                    <div 
                      className="prose prose-stone max-w-none text-stone-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderPreview(value) || '<p class="text-stone-400 italic">Your story will appear here as you write...</p>' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200/50 bg-stone-50/50 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-stone-500">
                  <span className="font-medium">{value.length}</span> characters • Last saved: Never
                </div>
                <div className="flex items-center space-x-4 text-sm text-stone-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Auto-saving...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Writing Tips */}
        <div className={`mt-8 transition-all duration-1000 ease-out delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-stone-200/50">
            <h3 className="font-serif font-semibold text-stone-800 mb-3">Writing Tips for Your Legacy</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-600">
              <div>
                <strong className="text-stone-700">Be Authentic:</strong> Write in your own voice, let your personality shine through every word.
              </div>
              <div>
                <strong className="text-stone-700">Include Details:</strong> Small moments and sensory details make stories come alive.
              </div>
              <div>
                <strong className="text-stone-700">Write for Tomorrow:</strong> Imagine someone reading this years from now - what would they want to know?
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;