"use client"
import Image from "next/image";
import HeroSection from "./components/HeroSection";
import ImageInput from "./components/ImageInput";
import Footer from "./components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    AOS.init();
  }, []);
  return (
    <main id="top-0" className="flex min-h-screen flex-col bg-[#FFFAEF]">
      <div className="container mt-20 mx-auto py-4">
        <HeroSection />
        <ImageInput />
      </div>
      <Footer />
    </main>
  );
}
