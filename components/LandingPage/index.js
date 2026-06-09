"use client";
import React, { Suspense } from "react";
import VideoCarousel from "../VideoCarousel";

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen w-full flex flex-col">
      
      <main className="flex-grow w-full flex flex-col items-center justify-center">
        <Suspense fallback={
          <div className="flex justify-center items-center py-32 text-zinc-400 font-medium animate-pulse">
            Loading Application...
          </div>
        }>
          <VideoCarousel />
        </Suspense>

      </main>

    </div>
  );
};

export default LandingPage;