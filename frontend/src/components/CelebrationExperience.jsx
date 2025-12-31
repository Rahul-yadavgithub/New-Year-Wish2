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
  const heroRef = useRef(null);
  const hasStartedRef = useRef(false);
  const audioReadyRef = useRef(false);

  useEffect(() => {
    // Initialize audio engine
    audioEngineRef.current = new AudioEngine();

    // Resume audio context on first user interaction
    const handleFirstInteraction = async () => {
      if (audioEngineRef.current) {
        const success = await audioEngineRef.current.resumeContext();
        if (success) {
          audioReadyRef.current = true;
          console.log('✅ Audio ready - firecracker burst enabled');
        }
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
      audioEngineRef.current?.stopAll();
      // Restore scrolling if component unmounts
      try { document.body.style.overflow = ''; } catch (e) {}
      if (heroRef.current) {
        heroRef.current.style.display = '';
        heroRef.current.style.opacity = '';
      }
    };
  }, []);

  const buildMasterTimeline = () => {
    // Prevent user scrolling during the intro to avoid message overlap
    try { document.body.style.overflow = 'hidden'; } catch (e) {}

    const master = gsap.timeline({
      onComplete: () => {
        // Mark experience as viewed
        const timestamp = new Date().toISOString();
        localStorage.setItem('newYear2026_celebration_viewed', 'true');
        localStorage.setItem('newYear2026_visit_timestamp', timestamp);
        console.log('✨ Experience completed and marked as visited.');
        
        // Fade out all audio
        audioEngineRef.current?.stopAll();

        // Restore scrolling
        try { document.body.style.overflow = ''; } catch (e) {}

        // Hide the hero container with a fade so the messages become fully visible and accessible
        if (heroRef.current) {
          gsap.to(heroRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => { try { heroRef.current.style.display = 'none'; } catch (e) {} }
          });
        }
      }
    });

    // [0s - 0.3s] Black screen silence (user gesture buffer)
    master.set('body', { backgroundColor: 'hsl(240 12% 6%)' }, 0);
    
    // [0.5s] 🔥 FIRECRACKER BURST (only if audio ready)
    master.call(() => {
      if (audioReadyRef.current && audioEngineRef.current) {
        audioEngineRef.current.playBurst(); // 💥 EXPLOSION!
        console.log('💥 Firecracker burst played');
      } else {
        console.log('🔇 Audio not ready - skipping burst');
      }
      
      if (particleSystemRef.current) {
        particleSystemRef.current.burst();
      }
    }, null, 0.5);

    // 💥 Light flash effect (sync with audio)
    if (burstGlowRef.current) {
      master.to(burstGlowRef.current, { 
        opacity: 1, 
        scale: 1.5,
        duration: 0.4, 
        ease: 'power2.out' 
      }, 0.5);
      master.to(burstGlowRef.current, { 
        opacity: 0, 
        scale: 2.5,
        duration: 1.2, 
        ease: 'power2.inOut' 
      }, 0.55);
    }

    // [1.8s] 🎵 HAPPY NEW YEAR text reveal + BACKGROUND MUSIC
    master.call(() => {
      if (audioReadyRef.current && audioEngineRef.current) {
        audioEngineRef.current.playBackgroundMusic(); // 🎶 Gentle music
        console.log('🎵 Background music started');
      }
    }, null, 1.8);

    // [3.5s] "Dear Manisha" reveal (cinematic from below)
    if (nameRef.current) {
      master.fromTo(
        nameRef.current,
        { opacity: 0, y: 40, scale: 0.98, filter: 'blur(8px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
        3.5
      );

      master.to(nameRef.current, {
        color: 'hsl(43 74% 49%)',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
        duration: 0.8,
        ease: 'power1.inOut'
      }, 3.8);

      master.to(nameRef.current, {
        scale: 1.06,
        duration: 0.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      }, 4.3);
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
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden" style={{
      background: 'linear-gradient(135deg, hsl(240 12% 6%) 0%, hsl(280 35% 20%) 50%, hsl(240 10% 8%) 100%)'
    }}>
      {/* 🎵 Audio status indicator (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 text-xs bg-black/50 text-white px-2 py-1 rounded opacity-75">
          Audio: {audioReadyRef.current ? '✅ READY' : '⏳ waiting...'}
        </div>
      )}

      {/* Three.js Particle Canvas */}
      <FirecrackerParticles ref={particleSystemRef} />

      {/* Burst Glow Effect */}
      <div
        ref={burstGlowRef}
        className="fixed top-1/2 left-1/2 w-64 h-64 md:w-96 md:h-96 pointer-events-none z-50"
        style={{
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle closest-side, ' +
            'rgba(255,215,0,0.95) 0%, ' +
            'rgba(255,105,180,0.8) 25%, ' +
            'rgba(138,43,226,0.6) 50%, ' +
            'transparent 75%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0
        }}
      />

      {/* Happy New Year + Dear Manisha (stacked) */}
      <div ref={heroRef} className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
        <div className="flex flex-col items-center gap-6">
          <HappyNewYearText />

          <p
            ref={nameRef}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-center px-4 opacity-0"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'hsl(0 0% 98%)'
            }}
          >
            Dear Manisha ✨
          </p>
        </div>
      </div>

      {/* Scrollable Message Sequence */}
      <MessageSequence />
    </div>
  );
};

export default CelebrationExperience;
