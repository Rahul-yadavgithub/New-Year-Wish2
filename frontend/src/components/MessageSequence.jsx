import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const messages = [
  {
    id: 1,
    text: "I’m truly sorry—I know I often make mistakes. I sincerely ask you to forgive me for my faults. I pray to God that you achieve great success in life. You are genuinely a wonderful person, and I miss you deeply",
    icon: "✨"
  },
  {
    id: 2,
    text: "Every moment we've shared, every conversation, every laugh – they're treasures I hold close to my heart.",
    icon: "💫"
  },
  {
    id: 3,
    text: "I don’t have a gift to give you, but I made this especially for you—so that, at least one last time, I could see a smile on your face. I truly always wanted you to be happy, but I never understood that all I needed to do was cherish a simple friendship. Even that, I couldn’t manage. So please accept this as my first and also my last gift to you.",
    icon: "🌟"
  },
  {
    id: 4,
    text: "Thank you, Manisha, for being a beautiful part of my journey. Goodbye, and Happy New Year—may 2026 bring you a new life filled with happiness, growth, and endless possibilities.",
    icon: "💖"
  }
];

// --- Sub-Component: The Cinematic Pipe ---
const DataPipe = () => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    const glow = glowRef.current;

    // Set initial state
    const pathLength = path.getTotalLength();
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    gsap.set(glow, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 75%", // Start filling when pipe enters bottom 1/4 of screen
        end: "bottom 55%", // Finish filling when pipe is center-screen
        scrub: 1, // Smooth scrubbing linked to scroll
      }
    });

    // 1. Fade in the glow particle
    tl.to(glow, { opacity: 1, duration: 0.1 })
      // 2. Animate the line filling up and the particle moving down together
      .to([path, glow], {
        strokeDashoffset: 0, // Fills the line
        motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5]
        },
        duration: 2,
        ease: "none" // Linear because scroll scrubbing handles the easing
      })
      // 3. Move the glow particle down (alternative to motionPath plugin if not installed)
      .to(glow, {
          y: 160, // Matches the SVG height roughly
          ease: "none",
          duration: 2
      }, "<");

    return () => {
      // Cleanup happens automatically via ScrollTrigger but good practice
    };
  }, []);

  return (
    <div ref={containerRef} className="h-40 w-full flex justify-center items-center relative overflow-visible my-2">
      <svg width="60" height="160" viewBox="0 0 60 160" fill="none" className="overflow-visible">
        <defs>
          <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />  {/* Cyan */}
            <stop offset="50%" stopColor="#8b5cf6" />  {/* Violet */}
            <stop offset="100%" stopColor="#f59e0b" /> {/* Soft Gold */}
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Track (faint background pipe) */}
        <path 
          d="M30 0 V160" 
          stroke="white" 
          strokeOpacity="0.1" 
          strokeWidth="2" 
        />

        {/* The Flow (Animated Gradient Fill) */}
        <path
          ref={pathRef}
          d="M30 0 V160"
          stroke="url(#premiumGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ filter: "url(#glow)" }}
        />
        
        {/* The Leading Particle (Glowing Head) */}
        <circle 
          ref={glowRef}
          cx="30" 
          cy="0" 
          r="6" 
          fill="#fff"
          style={{ 
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
            mixBlendMode: "overlay" 
          }}
        />
      </svg>
    </div>
  );
};

// --- Sub-Component: The Message Card ---
const MessageCard = ({ data, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    
    gsap.fromTo(el, 
      { 
        opacity: 0, 
        y: 50,
        scale: 0.95,
        filter: "blur(10px)"
      },
      {
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Triggers right after the pipe connects
          end: "top 40%",
          scrub: 1,
          toggleActions: "play reverse play reverse"
        },
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.out"
      }
    );
  }, []);

  return (
    <div className="flex justify-center w-full px-6 relative z-10">
      <div
        ref={cardRef}
        className="glass max-w-3xl w-full p-8 md:p-12 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="text-center">
          <div className="text-6xl md:text-7xl mb-6 opacity-90 drop-shadow-2xl animate-pulse">
            {data.icon}
          </div>
          <p
            className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-light text-slate-100"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {data.text}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Sequence Component ---
export const MessageSequence = () => {
  const finalRef = useRef(null);

  useEffect(() => {
    // Final text animation
    if (finalRef.current) {
      gsap.fromTo(finalRef.current,
        { opacity: 0, scale: 0.8, filter: "blur(20px)" },
        {
          scrollTrigger: {
            trigger: finalRef.current,
            start: "top 80%",
            end: "bottom 80%",
            scrub: 1.5
          },
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          ease: "circ.out"
        }
      );
    }
    
    // Cleanup
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-hidden">
      {/* Cinematic Background Gradient (Optional) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-[50vh] pb-[50vh] flex flex-col items-center">
        
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            {/* The Message Box */}
            <MessageCard data={message} index={index} />

            {/* Render Pipe ONLY if it's not the last item */}
            {index < messages.length - 1 && (
              <DataPipe />
            )}
          </React.Fragment>
        ))}

        {/* Final Pipe to Conclusion */}
        <DataPipe />

        {/* Final Conclusion */}
        <div ref={finalRef} className="mt-10 px-6 text-center max-w-4xl relative z-10">
          <div className="text-7xl md:text-8xl mb-6">💫</div>
          <h2
            className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-violet-200 to-amber-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Happy New Year 2026
          </h2>
          <p
            className="text-2xl md:text-3xl text-slate-300 font-serif"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            May this year bring you endless joy, boundless success,
            and all the love your heart can hold.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageSequence;