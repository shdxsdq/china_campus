"use client";

import { useEffect, useState } from "react";

import type { HeroSlide } from "@/lib/types";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero" aria-label="校园主视觉">
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`slide${index === activeIndex ? " active" : ""}`}
            style={{
              backgroundImage: `linear-gradient(120deg, rgba(3, 40, 86, 0.76), rgba(16, 99, 124, 0.32)), url('${slide.imageUrl}')`,
            }}
          >
            <div className="container slide-content">
              <span>{slide.kicker}</span>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-dots" aria-label="轮播切换">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`dot${index === activeIndex ? " active" : ""}`}
            type="button"
            aria-label={`查看第 ${index + 1} 张轮播`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
