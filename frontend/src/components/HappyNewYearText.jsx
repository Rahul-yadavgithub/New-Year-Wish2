import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import katex from "katex";
import "katex/dist/katex.min.css";

gsap.registerPlugin(Flip);

/**
 * A reel-like "equation transforms into New Year" reveal.
 * Replace STEPS with your exact math steps (LaTeX) to match the reel’s storyline.
 */
export default function CinematicNewYearReveal({ onComplete }) {
  const wrapRef = useRef(null);
  const eqRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);

  // 1) Provide equation steps (LaTeX).
  // Keep spacing consistent; KaTeX is sensitive.
  const STEPS = useMemo(
    () => [
      String.raw`e^{\ln(2026)} = 2026`,
      String.raw`\ln(2026) = \ln(2026)`,
      String.raw`2 + 0 + 2 + 6 = 10`,
      String.raw`\textbf{HAPPY\ NEW\ YEAR\ 2026}`,
    ],
    []
  );

  // Render current step via KaTeX (or plain text fallback).
  const rendered = useMemo(() => {
    const latex = STEPS[stepIndex];
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        trust: true,
        strict: "ignore",
      });
    } catch {
      return `<div>${latex}</div>`;
    }
  }, [STEPS, stepIndex]);

  useEffect(() => {
    if (!wrapRef.current || !eqRef.current) return;

    const ctx = gsap.context(() => {
      const wrap = wrapRef.current;
      const eq = eqRef.current;

      // Initial cinematic setup
      gsap.set(wrap, { opacity: 0 });
      gsap.set(eq, { opacity: 0, y: 16, filter: "blur(10px)" });

      const tl = gsap.timeline({ delay: 1.6 });

      // Fade in scene
      tl.to(wrap, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0);
      tl.to(eq, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power3.out" }, 0.1);

      // Slow “camera push-in” (film language)
      tl.to(
        wrap,
        { scale: 1.02, duration: 6.0, ease: "sine.inOut" },
        0
      );

      // Step transforms (Flip)
      // We trigger step changes with delays; each change morphs the KaTeX layout.
      const stepTimes = [1.8, 3.0, 4.2]; // timings for step 1->2, 2->3, 3->4

      stepTimes.forEach((t, i) => {
        tl.add(() => {
          // Capture state BEFORE changing DOM (Flip)
          const state = Flip.getState(eq.querySelectorAll("*"), { props: "color,opacity,filter,transform" });

          // Update step
          setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));

          // Next tick: run FLIP after DOM updates
          requestAnimationFrame(() => {
            // Flash highlight (premium cue)
            gsap.fromTo(
              wrap,
              { boxShadow: "0 0 0px rgba(255,215,0,0)" },
              {
                boxShadow: "0 0 60px rgba(255,215,0,0.18)",
                duration: 0.35,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
              }
            );

            Flip.from(state, {
              duration: 0.9,
              ease: "power3.inOut",
              stagger: 0.002,
              absolute: true,
              onEnter: (els) =>
                gsap.fromTo(
                  els,
                  { opacity: 0, filter: "blur(10px)" },
                  { opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }
                ),
              onLeave: (els) =>
                gsap.to(els, { opacity: 0, filter: "blur(12px)", duration: 0.25, ease: "power2.in" }),
            });
          });
        }, t);
      });

      // Final glow pulse, then fade out (to make room for “Dear Manisha”)
      tl.to(
        wrap,
        {
          filter: "drop-shadow(0 0 30px rgba(255,215,0,0.55)) drop-shadow(0 0 70px rgba(180,90,255,0.25))",
          duration: 0.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        5.0
      );

      tl.to(
        wrap,
        { opacity: 0, scale: 1.06, duration: 1.0, ease: "power2.in" },
        6.0
      );

      tl.add(() => onComplete?.(), 7.1);
    }, wrapRef);

    return () => ctx.revert();
  }, [STEPS, onComplete]);

  return (
    <div
      ref={wrapRef}
      className="ny-wrap"
      style={{
        width: "min(980px, 92vw)",
        margin: "0 auto",
        textAlign: "center",
        padding: "26px 22px",
        borderRadius: "28px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        ref={eqRef}
        className="ny-eq"
        // KaTeX output
        dangerouslySetInnerHTML={{ __html: rendered }}
        style={{
          color: "rgba(255,255,255,0.96)",
          letterSpacing: "0.02em",
          textShadow: "0 0 22px rgba(255,255,255,0.08)",
        }}
      />

      {/* Optional: cinematic grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "28px",
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.20%22/%3E%3C/svg%3E')",
          mixBlendMode: "overlay",
          opacity: 0.12,
        }}
      />
    </div>
  );
}
