import { Heart, MessageCircle, Share2, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from 'react';


function StoryCard() {

    const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 200);
            return () => clearTimeout(timer);
        }, []);
    

  const stories = [
    {
      id: 1,
      author: {
        name: "Eleanor Mills",
        avatar: "bg-gradient-to-br from-rose-300 to-pink-400",
        initials: "EM",
      },
      title: "The Garden Where Memories Bloom",
      content:
        "Today I walked through grandmother's garden, now mine to tend. The roses she planted forty years ago still bloom each spring, carrying whispers of her gentle hands and patient heart. Each petal holds a story, each thorn a lesson learned.",
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
      location: "Grandmother's Garden, Vermont",
      timeAgo: "2 hours ago",
      likes: 12,
      comments: 3,
      tags: ["memory", "family", "garden"],
    },
    {
      id: 2,
      author: {
        name: "Marcus Chen",
        avatar: "bg-gradient-to-br from-blue-300 to-indigo-400",
        initials: "MC",
      },
      title: "Letters from the Attic",
      content:
        "Found a box of letters today while cleaning the attic. Dad's handwriting, faded but still full of love. Each envelope a time capsule, each word a bridge between then and now. Some stories wait patiently to be rediscovered.",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
      location: "Family Home, Oregon",
      timeAgo: "5 hours ago",
      likes: 8,
      comments: 5,
      tags: ["letters", "discovery", "heritage"],
    },
    {
      id: 3,
      author: {
        name: "Sophia Rivera",
        avatar: "bg-gradient-to-br from-emerald-300 to-green-400",
        initials: "SR",
      },
      title: "The Recipe Book's Secret",
      content:
        "Making abuela's tamales for the first time without her guidance. Her recipe book, stained with decades of love, holds more than ingredients. Between the lines, I find her voice whispering encouragement, her hands guiding mine.",
      image:
        "https://ual-media-res.cloudinary.com/image/fetch/https://www.arts.ac.uk/__data/assets/image/0019/119008/3_Elephants-Secret-Kitchen_Louis-Porter_web.jpg",
      location: "Kitchen Chronicles, Texas",
      timeAgo: "1 day ago",
      likes: 24,
      comments: 8,
      tags: ["cooking", "tradition", "family"],
    },
    {
      id: 4,
      author: {
        name: "James Hartford",
        avatar: "bg-gradient-to-br from-amber-300 to-orange-400",
        initials: "JH",
      },
      title: "The Workshop's Last Song",
      content:
        "Grandfather's tools still hang in perfect order, each one worn smooth by decades of creation. Today I picked up his favorite chisel, and for a moment, I could hear the workshop's gentle song of wood shavings and quiet concentration.",
      image:
        "https://images.unsplash.com/photo-1551868561-f2cdee310ecf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      location: "Grandfather's Workshop, Maine",
      timeAgo: "2 days ago",
      likes: 15,
      comments: 4,
      tags: ["craft", "memory", "legacy"],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
      {/* Header */}
      <div
        className={`text-center mb-12 transition-all duration-1000 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
          Stories from the Heart
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Where memories find their voice and moments become eternal
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-stone-400 to-slate-400 mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Stories Grid */}
      <div className="space-y-8">
        {stories.map((story, index) => (
          <div
            key={story.id}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-stone-200/50 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            {/* Story Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 ${story.author.avatar} rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}
                  >
                    {story.author.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">
                      {story.author.name}
                    </h3>
                    <div className="flex items-center text-sm text-stone-500 space-x-2">
                      <Clock size={14} />
                      <span>{story.timeAgo}</span>
                      {story.location && (
                        <>
                          <span>•</span>
                          <MapPin size={14} />
                          <span>{story.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Title */}
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-3">
                {story.title}
              </h2>

              {/* Story Content */}
              <p className="text-stone-600 leading-relaxed mb-4 font-light">
                {story.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {story.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Story Image */}
            <div className="px-6 pb-4">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>

            {/* Story Actions */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-center justify-between border-t border-stone-200/50 pt-4">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-stone-600 hover:text-rose-600 transition-colors duration-200">
                    <Heart size={20} />
                    <span>{story.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-stone-600 hover:text-blue-600 transition-colors duration-200">
                    <MessageCircle size={20} />
                    <span>{story.comments}</span>
                  </button>
                </div>
                <button className="flex items-center space-x-2 text-stone-600 hover:text-green-600 transition-colors duration-200">
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <button className="px-8 py-3 bg-gradient-to-r from-stone-600 to-slate-600 text-white font-medium rounded-full hover:from-stone-700 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          Discover More Stories
        </button>
      </div>
    </div>
  );
}

export default StoryCard;
