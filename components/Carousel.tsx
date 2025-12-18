'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
  '/carrousel/luquitas.png',
  '/carrousel/tincho.png',
  '/carrousel/casa-pdp.png',
  '/carrousel/fogon.png',
  '/carrousel/pibes.png',
  '/carrousel/amanacer.png',
  '/carrousel/nonstop.png',
  '/carrousel/alcoholes.png'
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    
    // Auto-advance every 10 seconds
    const interval = setInterval(() => {
      handleNext();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? CAROUSEL_IMAGES.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl group">
      {/* Image Container */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-400 via-blue-500 to-orange-500">
        <Image
          src={CAROUSEL_IMAGES[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          unoptimized
          priority
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Previous Button */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        aria-label="Anterior"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        aria-label="Siguiente"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-8 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
            } rounded-full`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-[10000ms] ease-linear"
          style={{
            width: isTransitioning ? '0%' : '100%',
          }}
          key={currentIndex}
        />
      </div>
    </div>
  );
}

