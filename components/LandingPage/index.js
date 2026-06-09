"use client";

import React from "react";
import VideoCarousel from "../VideoCarousel"; 
const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen w-full flex flex-col">
      <main className="w-full items-center justify-center">
        <VideoCarousel />
      </main>
    </div>
  );
};

export default LandingPage;