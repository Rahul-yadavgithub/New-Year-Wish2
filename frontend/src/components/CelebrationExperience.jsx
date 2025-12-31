import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FirecrackerParticles from './FirecrackerParticles';
import AudioEngine from './AudioEngine';
import PageWrapper from './PageWrapper';

gsap.registerPlugin(ScrollTrigger);

export const CelebrationExperience = () => {
  const audioEngineRef = useRef(null);
  const particleSystemRef = useRef(null);
  const burstGlowRef = useRef(null);
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

          // Play an initial burst & particle when the user interacts
          try {
            audioEngineRef.current.playBurst();
          } catch (e) {}
          try { particleSystemRef.current?.burst(); } catch (e) {}

          // Start background music shortly after (gentle entrance)
          setTimeout(() => {
            try { audioEngineRef.current.playBackgroundMusic(); } catch (e) {}
          }, 1200);
        }
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    // removed the fixed intro master timeline in favor of scroll-driven hero & message flow

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      audioEngineRef.current?.stopAll();
    };
  }, []);




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

      {/* Page layout: hero (pinned) + message sequence (scroll-driven) */}
      <PageWrapper onHeroLeft={() => {
        const timestamp = new Date().toISOString();
        localStorage.setItem('newYear2026_celebration_viewed', 'true');
        localStorage.setItem('newYear2026_visit_timestamp', timestamp);
        // Ensure scroll-driven animations are aware of layout changes
        try { ScrollTrigger.refresh(); } catch (e) {}
      }} />
    </div>
  );
};

export default CelebrationExperience;
