"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import VideoModal from "../VideoModal";
import {useSearchParams} from "next/navigation";
//Optimized Video Card
const HoverVideoCard = ({ video, onClick }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsMounted(true);
          } else {
            setIsMounted(false);
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 800px", 
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.disconnect();
    };
  }, []);

  const handleMouseEnter = () => {
    if (videoRef.current && isMounted) {
      videoRef.current.play().catch(e => console.log("Hover play prevented:", e));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isMounted) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 3) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-[300px] sm:w-[380px] md:w-[450px] lg:w-[500px] aspect-video bg-zinc-200 rounded-[1.5rem] overflow-hidden cursor-pointer snap-center md:snap-start group shadow-md hover:shadow-xl transition-all duration-500 border border-black/5"
    >
      {isMounted ? (
        <video
          ref={videoRef}
          src={`${video.videoUrl}#t=0.001`}
          preload="metadata"
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105"
        />
      ) : (
        //Skeleton for unloaded videos
        <div className="w-full h-full bg-zinc-200 animate-pulse" />
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-100 transition-opacity duration-500 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-full text-zinc-900 shadow-xl transform hover:scale-110 transition-transform duration-500">
          <Play fill="currentColor" size={20} className="ml-0.5" />
        </div>
      </div>
    </motion.div>
  );
};


export default function VideoCarousel() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Slider Controls & State
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const searchParams = useSearchParams();
  const sharedVideoId = searchParams.get("v");
// Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setVideos(data);
        // If there's a shared video ID in the URL, find its index and open the modal
        if(sharedVideoId) {
          const targetIndex = data.findIndex(v => v.id === sharedVideoId);
          if (targetIndex !== -1) {
            setActiveIndex(targetIndex);
            setIsModalOpen(true);
          }
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [sharedVideoId]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen]);

  
  const checkScrollState = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(Math.ceil(scrollLeft) > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        checkScrollState();
      }, 100);

    window.addEventListener("resize", checkScrollState);
    return () => {
      window.removeEventListener("resize", checkScrollState);
      clearTimeout(timeoutId);
    };
  }, [videos]);

  const openVideo = (index) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const scrollLeftAmount = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -450, behavior: "smooth" });
    }
  };

  const scrollRightAmount = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 450, behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-zinc-50 py-24 overflow-hidden" id="video-feed">
      <div className="w-full max-w-[1600px] mx-auto relative z-10">
        
        
        <div className="flex flex-col items-center justify-center text-center mb-14 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-zinc-900 tracking-tight">
            Video Carousel (Mock Data)
          </h2>
          <div className="w-12 h-1 bg-zinc-900 mt-6 rounded-full opacity-80" />
        </div>

        
        {isLoading ? (
          <div className="flex justify-center items-center py-32 text-zinc-400 font-medium tracking-wide animate-pulse uppercase text-sm">
            Loading Cat Videos...
          </div>
        ) : (
          <div className="relative group px-0 md:px-16">
            
            <button 
              onClick={scrollLeftAmount}
              className={`flex absolute left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[100] items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ${
                canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronLeft size={28} strokeWidth={2} className="mr-0.5 md:mr-1 w-5 h-5 md:w-7 md:h-7" />
            </button>

            <div 
              ref={sliderRef}
              onScroll={checkScrollState}
              className="flex overflow-x-auto gap-6 pb-10 pt-4 snap-x snap-mandatory px-[calc(50%-150px)] sm:px-[calc(50%-190px)] md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {videos.map((video, index) => (
                <HoverVideoCard 
                  key={video.id} 
                  video={video} 
                  onClick={() => openVideo(index)} 
                />
              ))}
              <div className="hidden md:block w-4 flex-shrink-0" aria-hidden="true" />
            </div>

            <button 
              onClick={scrollRightAmount}
              className={`flex absolute right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[100] items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ${
                canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronRight size={28} strokeWidth={2} className="ml-0.5 md:ml-1 w-5 h-5 md:w-7 md:h-7" />
            </button>
            
          </div>
        )}
      </div>

      <VideoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        videos={videos} 
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </section>
  );
}