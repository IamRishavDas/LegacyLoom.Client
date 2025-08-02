export const renderPreview = (text) => {
    let rendered = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-serif font-bold text-stone-800 mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-serif font-semibold text-stone-800 mb-3">$1</h2>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-stone-300 pl-4 italic text-stone-600 my-4">$1</blockquote>');

    return rendered.replace(/\n/g, '<br>');
  };