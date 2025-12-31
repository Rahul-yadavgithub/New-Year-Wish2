import { useEffect, useRef } from 'react';
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
    text: "I don’t have a gift to give you, but I made this especially for you—so that, at least one last time, I could see a smile on your face. I truly always wanted you to be happy, but I never understood that all I needed to do was cherish a simple friendship. Even that, I couldn’t manage.So please accept this as my first and also my last gift to you.",
    icon: "🌟"
  },
  {
    id: 4,
    text: "Thank you, Manisha, for being a beautiful part of my journey. Goodbye, and Happy New Year—may 2026 bring you a new life filled with happiness, growth, and endless possibilities.",
    icon: "💖"
  }
];

export const MessageSequence = () => {
  const messageRefs = useRef([]);
  const finalMessageRef = useRef(null);

  useEffect(() => {
    // Wait for initial animations to complete
    const initScrollTriggers = setTimeout(() => {
      messageRefs.current.forEach((messageEl, index) => {
        if (!messageEl) return;

        // Entrance animation
        gsap.from(messageEl, {
          scrollTrigger: {
            trigger: messageEl,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1.5,
            markers: false
          },
          opacity: 0,
          y: 80,
          scale: 0.9,
          rotationX: 15,
          duration: 1.8,
          ease: 'power2.out'
        });

        // Exit animation for previous message
        if (index > 0 && messageRefs.current[index - 1]) {
          gsap.to(messageRefs.current[index - 1], {
            scrollTrigger: {
              trigger: messageEl,
              start: 'top 60%',
              scrub: 1.5
            },
            opacity: 0.15,
            y: -40,
            scale: 0.95,
            duration: 1
          });
        }
      });

      // Final message trigger
      if (finalMessageRef.current) {
        gsap.from(finalMessageRef.current, {
          scrollTrigger: {
            trigger: finalMessageRef.current,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 2,
            markers: false
          },
          opacity: 0,
          y: 60,
          scale: 0.92,
          duration: 2,
          ease: 'power2.out'
        });
      }
    }, 7500); // Start after initial animations

    return () => {
      clearTimeout(initScrollTriggers);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="relative w-full" style={{ paddingTop: '100vh' }}>
      {/* Message Cards */}
      {messages.map((message, index) => (
        <div
          key={message.id}
          className="min-h-screen flex items-center justify-center px-6 py-20"
        >
          <div
            ref={el => messageRefs.current[index] = el}
            className="glass max-w-3xl w-full p-8 md:p-12 rounded-3xl"
            style={{
              boxShadow: 'var(--shadow-elegant)',
            }}
          >
            <div className="text-center">
              <div className="text-6xl md:text-7xl mb-6 opacity-80">
                {message.icon}
              </div>
              <p
                className="text-xl md:text-2xl lg:text-3xl leading-relaxed"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: 'hsl(0 0% 95%)'
                }}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Final Message */}
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div
          ref={finalMessageRef}
          className="text-center max-w-4xl"
        >
          <div className="mb-8">
            <div className="text-7xl md:text-8xl mb-6 animate-pulse">💫</div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text"
              style={{
                fontFamily: "'Playfair Display', serif"
              }}
            >
              Happy New Year 2026
            </h2>
          </div>
          <p
            className="text-2xl md:text-3xl mb-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'hsl(0 0% 90%)'
            }}
          >
            May this year bring you endless joy, boundless success,<br className="hidden md:block" />
            and all the love your heart can hold.
          </p>
          <div className="mt-12 opacity-60">
            <p className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              With warmth and best wishes 🌟
            </p>
          </div>
        </div>
      </div>

      {/* Spacer for smooth ending */}
      <div className="h-screen" />
    </div>
  );
};

export default MessageSequence;