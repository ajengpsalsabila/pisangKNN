"use client";
import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const HeroSection = () => {
  return (
    <section id="home">
      <div className="flex justify-center items-end">
        <h1 className="inline-flex text-center text-3xl md:text-5xl lg:text-7xl text-transparent bg-clip-text text-[#214870] font-black">
          BANANA RIPENESS CHECK
        </h1>
        <MagnifyingGlassIcon className="h-8 w-8" />
      </div>
      
    </section>
    
  );
};

export default HeroSection;
