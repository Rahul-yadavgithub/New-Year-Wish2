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

// --- Sub-Component: The Cinematic Pipe (parent-controlled) ---
const DataPipe = React.forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const glow = glowRef.current;

    if (!path) return;

    // Set initial state (stroke length etc.) — parent will drive the animation
    const pathLength = path.getTotalLength();
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    gsap.set(glow, { opacity: 0, y: 0 });

    return () => {
      // nothing else here — parent timeline will be responsible for ScrollTrigger
    };
  }, []);

  // Expose refs and useful values to the parent via imperative handle
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    path: pathRef.current,
    glow: glowRef.current,
    getPathLength: () => pathRef.current ? pathRef.current.getTotalLength() : 0
  }), []);

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
});

DataPipe.displayName = 'DataPipe';

// --- Sub-Component: The Message Card ---
const MessageCard = ({ data, index, forwardedRef }) => {
  // The parent will control the scroll-triggered timeline for sequencing (no own ScrollTrigger)
  return (
    <div className="flex justify-center w-full px-6 relative z-10">
      <div
        ref={forwardedRef}
        className="glass max-w-3xl w-full p-8 md:p-12 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          opacity: 0,
          transform: 'translateY(50px) scale(0.95)',
          filter: 'blur(10px)'
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
  const groupRefs = useRef([]);
  const messageRefs = useRef([]);
  const pipeRefs = useRef([]);

  useEffect(() => {
    // Build a grouped timeline per message + pipe pair so the message animate first
    // and the pipe fill starts only when the message's reveal is complete.
    const created = [];

    messages.forEach((_, index) => {
      const groupEl = groupRefs.current[index];
      const msgEl = messageRefs.current[index];
      const pipeRef = pipeRefs.current[index]; // pipe after this message

      if (!groupEl || !msgEl) return;

      // Determine an appropriate scroll length: one and a quarter viewport height
      const scrollLength = Math.max(window.innerHeight * 1.25, 800);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: groupEl,
          start: 'top 85%',
          end: `+=${Math.round(scrollLength)}`,
          scrub: true,
          markers: false
        }
      });

      // 1) Message reveal portion (first ~40% of timeline)
      tl.fromTo(msgEl, 
        { opacity: 0, y: 50, scale: 0.95, filter: 'blur(10px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 0.6 }
      );

      // 2) Pipe portion (starts after message has revealed)
      if (pipeRef && pipeRef.path) {
        const pathEl = pipeRef.path;
        const glowEl = pipeRef.glow;
        const pathLength = pipeRef.getPathLength();

        // Ensure initial strokeDashoffset is set (redundant-safe)
        gsap.set(pathEl, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.set(glowEl, { opacity: 0, y: 0 });

        // Add a slight gap and then animate pipe fill over the rest of the timeline
        tl.to(pathEl, { strokeDashoffset: 0, ease: 'none', duration: 1 }, '+=0.1');
        tl.to(glowEl, { opacity: 1, y: 160, ease: 'none', duration: 1 }, '<');
      }

      created.push(tl);
    });

    // Final conclusion animation (separate timeline)
    if (finalRef.current) {
      const finalTl = gsap.timeline({
        scrollTrigger: {
          trigger: finalRef.current,
          start: 'top 80%',
          end: 'bottom 80%',
          scrub: 1.5,
          markers: false
        }
      });

      finalTl.fromTo(finalRef.current, { opacity: 0, scale: 0.8, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'circ.out' });
      created.push(finalTl);
    }

    // Cleanup
    return () => created.forEach(tl => tl.kill()) || ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-hidden">
      {/* Cinematic Background Gradient (Optional) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <div ref={el => groupRefs.current[index] = el} className="w-full flex flex-col items-center">
              {/* The Message Box */}
              <MessageCard data={message} index={index} forwardedRef={el => messageRefs.current[index] = el} />

              {/* Render Pipe ONLY if it's not the last item */}
              {index < messages.length - 1 && (
                <DataPipe ref={el => pipeRefs.current[index] = el} />
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Final Pipe to Conclusion */}
        <DataPipe ref={el => pipeRefs.current[messages.length - 1] = el} />

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