import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const HappyNewYearText = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');
    const tl = gsap.timeline({ delay: 1.8 });

    chars.forEach((char, index) => {
      tl.from(
        char,
        {
          opacity: 0,
          y: -60,
          scale: 0.4,
          rotation: -15,
          duration: 0.18,
          ease: 'back.out(2)',
          filter: 'blur(12px)',
        },
        index * 0.065
      );

      tl.to(
        char,
        {
          color: 'hsl(43 85% 65%)',
          duration: 0.35,
          ease: 'power1.inOut'
        },
        index * 0.065 + 0.08
      );
    });

    // Add pulsing glow effect
    tl.to(
      containerRef.current,
      {
        textShadow: '0 0 30px hsl(43 85% 65% / 0.8), 0 0 60px hsl(280 35% 48% / 0.4)',
        duration: 0.8,
        ease: 'power2.inOut'
      },
      0.8
    );

    tl.to(
      containerRef.current,
      {
        textShadow: '0 0 40px hsl(43 85% 65% / 1), 0 0 80px hsl(280 35% 48% / 0.6), 0 0 120px hsl(340 38% 72% / 0.3)',
        duration: 1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 2
      },
      1.2
    );

    // Fade out before name appears
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.1,
        duration: 0.8,
        ease: 'power2.in'
      },
      3
    );
  }, []);

  const text = 'HAPPY NEW YEAR 2026';

  return (
    <h1
      ref={containerRef}
      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center px-4"
      style={{
        fontFamily: "'Playfair Display', serif",
        color: 'hsl(0 0% 98%)',
        letterSpacing: '0.05em'
      }}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="char inline-block"
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};

export default HappyNewYearText;