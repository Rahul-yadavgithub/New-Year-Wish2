import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FirecrackerParticles from './FirecrackerParticles';
import AudioEngine from './AudioEngine';
import HappyNewYearText from './HappyNewYearText';
import MessageSequence from './MessageSequence';

gsap.registerPlugin(ScrollTrigger);

export const CelebrationExperience = () => {
  const audioEngineRef = useRef(null);
  const particleSystemRef = useRef(null);
  const burstGlowRef = useRef(null);
  const nameRef = useRef(null);
  const finalMessageRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Initialize audio engine
    audioEngineRef.current = new AudioEngine();

    // Resume audio context on first user interaction
    const handleFirstInteraction = () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.resumeContext();
      }
    };
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    // Start the master timeline
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      buildMasterTimeline();
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const buildMasterTimeline = () => {
    const master = gsap.timeline({
      onComplete: () => {
        // Mark experience as viewed
        const timestamp = new Date().toISOString();
        localStorage.setItem('newYear2026_celebration_viewed', 'true');
        localStorage.setItem('newYear2026_visit_timestamp', timestamp);
        console.log('Experience completed and marked as visited.');
      }
    });

    // [0s - 0.5s] Black screen silence with subtle anticipation
    master.set('body', { backgroundColor: 'hsl(240 12% 6%)' }, 0);
    
    // [0.5s] Firecracker burst
    master.call(() => {
      if (audioEngineRef.current) {
        audioEngineRef.current.playBurst();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.burst();
      }
    }, null, 0.5);

    // Light flash effect
    if (burstGlowRef.current) {
      master.to(burstGlowRef.current, { 
        opacity: 1, 
        scale: 1.5,
        duration: 0.4, 
        ease: 'power2.out' 
      }, 0.5);
      master.to(burstGlowRef.current, { 
        opacity: 0, 
        scale: 2,
        duration: 1, 
        ease: 'quad.inOut' 
      }, 0.55);
    }

    // [1.8s] "HAPPY NEW YEAR" text reveal handled by HappyNewYearText component
    
    // [3.5s] "Dear Manisha" reveal
    if (nameRef.current) {
      master.from(nameRef.current, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power2.out'
      }, 3.5);

      master.to(nameRef.current, {
        color: 'hsl(43 74% 49%)',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
        duration: 0.8,
        ease: 'power1.inOut'
      }, 3.7);

      master.to(nameRef.current, {
        scale: 1.08,
        duration: 0.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      }, 4.2);
    }

    // [6s] Fade out name and enable scroll
    if (nameRef.current) {
      master.to(nameRef.current, {
        opacity: 0,
        y: -30,
        duration: 1.2,
        ease: 'power2.in'
      }, 6);
    }

    // [7s] Initialize scroll animations for messages
    master.call(() => {
      ScrollTrigger.refresh();
    }, null, 7);

    // Final message appears after scrolling through all messages
    // This is handled by scroll triggers in MessageSequence
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden" style={{
      background: 'linear-gradient(135deg, hsl(240 12% 6%) 0%, hsl(280 35% 20%) 50%, hsl(240 10% 8%) 100%)'
    }}>
      {/* Three.js Particle Canvas */}
      <FirecrackerParticles ref={particleSystemRef} />

      {/* Burst Glow Effect */}
      <div
        ref={burstGlowRef}
        className="fixed top-1/2 left-1/2 w-64 h-64 pointer-events-none z-50"
        style={{
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,215,0,0.9), transparent)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0
        }}
      />

      {/* Happy New Year Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
        <HappyNewYearText />
      </div>

      {/* Dear Manisha Name */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
        <p
          ref={nameRef}
          className="text-3xl md:text-5xl font-light tracking-wider"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: 'hsl(0 0% 98%)'
          }}
        >
          Dear Manisha ✨
        </p>
      </div>

      {/* Scrollable Message Sequence */}
      <MessageSequence />
    </div>
  );
};

export default CelebrationExperience;