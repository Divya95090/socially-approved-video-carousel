"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import CommentPanel from "../CommentPanel";

// Inner Video Player Component
const VideoPlayer = ({ video, isActive, isCommentsOpen, setIsCommentsOpen }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [likes, setLikes] = useState(video.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [shares, setShares] = useState(video.shares || 0);

  // Helper function to dynamically route requests to the correct distinct APIs
  const triggerBackendInteraction = async (action, platform = null) => {
    try {
      // exact endpoint based on the action
      const endpoint = action === 'like' ? '/api/like' : '/api/share';

      const payload = action === 'like' 
        ? { videoId: video.id } 
        : { videoId: video.id, platform: platform };

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error(`Failed to record ${action}:`, error);
    }
  };

useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handles the slider out of view (swiping left/right)
    if (isActive) {
      video.play().catch(e => console.log("Autoplay prevented:", e));
    } else {
      video.pause();
      video.currentTime = 0;
    }

    // Handles browser out of view (switching tabs/minimizing window)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause(); // Pause when user leaves the tab
      } else if (isActive) {
        video.play().catch(e => console.log("Autoplay prevented:", e)); // Resume when the user come back
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  const togglePlay = (e) => {
    e.stopPropagation(); 
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };
  // Updates progress bar as the video plays
  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration) setProgress((current / duration) * 100);
  };

  //function to handle likes
  const handleLike = (e) => {
    e.stopPropagation();
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    triggerBackendInteraction('like');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const uniqueShareUrl = `${baseUrl}?v=${video.id}`;

      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: `Check out this video: ${video.title}`,
          url: uniqueShareUrl,
        });
        setShares(prev => prev + 1);
        triggerBackendInteraction('share', 'native_api');
      } else {
        await navigator.clipboard.writeText(uniqueShareUrl);
        alert("Link copied to clipboard!");
        setShares(prev => prev + 1);
        triggerBackendInteraction('share', 'clipboard');
      }
    } catch (err) {
      console.log("Share cancelled or failed", err);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-2xl group border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {isLoading && isActive && (
        <div className="absolute z-10 text-white animate-spin">
          <Loader2 size={40} strokeWidth={2} />
        </div>
      )}
      
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
      />

      <div 
        onClick={togglePlay}
        className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors cursor-pointer"
      />
      {/* Comment Modal */}
      <CommentPanel 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        videoId={video.id} 
      />

      <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end z-20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="w-full h-[4px] bg-gray-600 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-75" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className="flex justify-between items-end">
          <div className="flex gap-4 items-center text-white w-2/3">
            <button onClick={togglePlay} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors flex-shrink-0">
              {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            </button>
            <button 
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors flex-shrink-0">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <div className="ml-2 truncate">
              <h2 className="text-sm md:text-base font-bold mb-0.5 truncate">{video.title}</h2>
              <p className="text-xs text-gray-300 truncate">{video.description}</p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-4 text-white">
            <button 
              onClick={handleLike} 
              className="flex items-center gap-2 p-2 px-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <Heart size={18} fill={hasLiked ? "#ef4444" : "none"} color={hasLiked ? "#ef4444" : "white"} />
              <span className="text-xs font-semibold">{likes}</span>
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); }} 
              className="hidden md:flex items-center gap-2 p-2 px-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-xs font-semibold">{video.comments || 0}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-2 p-2 px-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors">
              <Share2 size={18} />
              <span className="hidden md:inline text-xs font-semibold">{shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

//Inner Slider Modal Component
export default function VideoModal({ isOpen, onClose, videos, activeIndex, setActiveIndex }) {

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % videos.length);
    setIsCommentsOpen(false);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + videos.length) % videos.length);
    setIsCommentsOpen(false);
  };

  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50) handleNext();
    else if (swipe > 50) handlePrev();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full p-4 lg:p-6 flex justify-between items-center z-50">
            <span className="text-white text-sm font-medium tracking-widest bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
              {String(activeIndex + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}
            </span>
            <button 
              onClick={() => {
                setIsCommentsOpen(false);
                onClose();
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute inset-y-0 left-4 right-4 flex justify-between items-center z-40 pointer-events-none">
            <button onClick={handlePrev} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all hover:scale-110 active:scale-95">
              <ChevronLeft size={32} />
            </button>
            <button onClick={handleNext} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all hover:scale-110 active:scale-95">
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            {videos.map((video, idx) => {
              let relativeIndex = idx - activeIndex;
              if (relativeIndex === videos.length - 1) relativeIndex = -1; 
              if (relativeIndex === -(videos.length - 1)) relativeIndex = 1; 

              if (Math.abs(relativeIndex) > 1) return null;

              const isActive = relativeIndex === 0;

              return (
                <motion.div 
                  key={video.id}
                  initial={false}
                  animate={{ 
                    x: `${relativeIndex * 85}%`,
                    scale: isActive ? 1 : 0.8,
                    opacity: isActive ? 1 : 0.4
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag={isActive && !isCommentsOpen ? "x" : false} // Disables drag if typing comment
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragEnd={isActive ? handleDragEnd : undefined}
                  className={`absolute w-[80vw] md:w-[65vw] lg:w-[800px] aspect-video ${isActive ? "cursor-grab active:cursor-grabbing z-30" : "z-20 pointer-events-none"}`}
                >
                  <VideoPlayer 
                    video={video} 
                    isActive={isActive} 
                    isCommentsOpen={isActive && isCommentsOpen} 
                    setIsCommentsOpen={setIsCommentsOpen} 
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}