"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import CommentPanel from "../CommentPanel";

// Inner Video Player Component
const VideoPlayer = ({ video, isActive, isCommentsOpen, setIsCommentsOpen, isShareOpen, setIsShareOpen }) => {
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
    const videoElem = videoRef.current;
    if (!videoElem) return;

    // Handles the slider out of view (swiping left/right)
    if (isActive) {
      videoElem.play().catch(e => console.log("Autoplay prevented:", e));
    } else {
      videoElem.pause();
      videoElem.currentTime = 0;
    }

    // Handles browser out of view (switching tabs/minimizing window)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause(); // Pause when user leaves the tab
      } else if (isActive) {
        videoElem.play().catch(e => console.log("Autoplay prevented:", e));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  const togglePlay = (e) => {
    e.stopPropagation(); 
    setIsShareOpen(false);
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
  
  const getShareUrl = (platform) => {
    if (typeof window === 'undefined') return '#'; 
    
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const uniqueShareUrl = encodeURIComponent(`${baseUrl}?v=${video.id}`);
    const shareText = encodeURIComponent(`Check out this video: ${video.title} `);
    if (platform === "whatsapp") {
      return `https://api.whatsapp.com/send?text=${shareText}${uniqueShareUrl}`;
    } else if (platform === "twitter") {
      return `https://twitter.com/intent/tweet?text=${shareText}&url=${uniqueShareUrl}`;
    }
    return '#';
  };
  const trackShareClick = (platform) => {
    setShares(prev => prev + 1);
    triggerBackendInteraction('share', platform);
    setIsShareOpen(false);
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
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsCommentsOpen(true); 
                setIsShareOpen(false); 
              }} 
              className="hidden md:flex items-center gap-2 p-2 px-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-xs font-semibold">{video.comments || 0}</span>
            </button>

            <div className="relative">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsShareOpen(!isShareOpen); 
                  setIsCommentsOpen(false); 
                }} 
                className={`flex items-center gap-2 p-2 px-3 rounded-full backdrop-blur-md transition-all ${isShareOpen ? 'bg-white/30 scale-105' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <Share2 size={18} />
                <span className="hidden md:inline text-xs font-semibold">{shares}</span>
              </button>

              <AnimatePresence>
                {isShareOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute bottom-full right-0 mb-3 flex flex-col p-1.5 min-w-[160px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 origin-bottom-right"
                  >
                    <a 
                      href={getShareUrl('whatsapp')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        trackShareClick('whatsapp'); 
                      }} 
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-xl transition-colors text-white group cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="text-sm font-medium">WhatsApp</span>
                    </a>
                    <a 
                      href={getShareUrl('twitter')}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        trackShareClick('twitter'); 
                      }} 
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-xl transition-colors text-white group cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.126H5.078z"/>
                      </svg>
                      <span className="text-sm font-medium">X (Twitter)</span>
                    </a>

                    <div className="w-full h-px bg-white/10 my-1"></div>

                    <button 
                      onClick={(e) => { 
                        handleShare(e); 
                        setIsShareOpen(false); 
                      }} 
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-xl transition-colors text-gray-300 hover:text-white"
                    >
                      <Share2 size={16} />
                      <span className="text-sm font-medium">More Options</span>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Inner Slider Modal Component
export default function VideoModal({ isOpen, onClose, videos, activeIndex, setActiveIndex }) {

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false); // Lifted state

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % videos.length);
    setIsCommentsOpen(false);
    setIsShareOpen(false); // Close panel on swipe
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + videos.length) % videos.length);
    setIsCommentsOpen(false);
    setIsShareOpen(false); // Close panel on swipe
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
                setIsShareOpen(false);
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
                  drag={isActive && !isCommentsOpen && !isShareOpen ? "x" : false} 
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
                    isShareOpen={isActive && isShareOpen}
                    setIsShareOpen={setIsShareOpen}
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