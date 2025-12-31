import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HappyNewYearText from './HappyNewYearText';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = ({ onPinEnd }) => {
  const heroRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    const nameEl = nameRef.current;

    if (!el) return;

    // Pin the hero for exactly one viewport scroll and animate fade/scale with scrub
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=100%', // pin for one full viewport height
        scrub: true,
        pin: true,
        pinSpacing: true,
        onLeave: () => {
          // notify parent when hero is left (so messages can be considered active)
          onPinEnd && onPinEnd();
        }
      }
    });

    // Subtle initial entrance for the name
    gsap.fromTo(nameEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });

    // Fade + scale down the hero content as the user scrolls through the pinned area
    tl.fromTo(el, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration: 1, ease: 'none' });

    return () => {
      const triggers = ScrollTrigger.getAll();
      triggers.forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={heroRef} className="w-full min-h-screen flex items-center justify-center z-40" style={{ background: 'linear-gradient(135deg, hsl(240 12% 6%) 0%, hsl(280 35% 20%) 50%, hsl(240 10% 8%) 100%)' }}>
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <div className="pointer-events-none">
          <HappyNewYearText />
        </div>

        <p
          ref={nameRef}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: 'hsl(0 0% 98%)',
            textShadow: '0 0 10px rgba(255,255,255,0.03)'
          }}
        >
          Dear Manisha ✨
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
