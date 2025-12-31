import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

const FirecrackerParticles = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    burst: () => {
      createBurst();
    }
  }));

  useEffect(() => {
    initThreeJS();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const initThreeJS = () => {
    if (!canvasRef.current) return;

    // Scene setup
    sceneRef.current = new THREE.Scene();

    // Camera setup
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    // Renderer setup
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setClearColor(0x000000, 0);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  const createBurst = () => {
    const particleCount = isMobile() ? 200 : 400;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];
    
    // Luxurious New Year color palette
    const colorPalette = [
      new THREE.Color(1, 0.84, 0),      // Gold
      new THREE.Color(1, 0.71, 0.76),   // Rose Gold
      new THREE.Color(0.8, 0.52, 0.79), // Amethyst
      new THREE.Color(0.92, 0.75, 0.84),// Mauve Pink
      new THREE.Color(1, 1, 1)          // White
    ];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.8 + Math.random() * 1.8;

      // Initial position at center
      positions.push(0, 0, 0);

      // Velocity in spherical coordinates
      velocities.push(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      );

      // Random color from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const material = new THREE.PointsMaterial({
      size: isMobile() ? 6 : 10,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    particlesRef.current = new THREE.Points(geometry, material);
    sceneRef.current.add(particlesRef.current);

    animateBurst(velocities, material, particleCount);
  };

  const animateBurst = (velocities, material, particleCount) => {
    const startTime = performance.now();
    const duration = 1500; // 1.5 seconds

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (!particlesRef.current) return;

      const positions = particlesRef.current.geometry.attributes.position.array;

      // Update particle positions with gravity effect
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += velocities[idx] * 0.016;
        positions[idx + 1] += velocities[idx + 1] * 0.016 - progress * 0.02; // Gravity
        positions[idx + 2] += velocities[idx + 2] * 0.016;
        
        // Add slight drag
        velocities[idx] *= 0.99;
        velocities[idx + 1] *= 0.99;
        velocities[idx + 2] *= 0.99;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      material.opacity = 1 - progress;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Cleanup
        if (particlesRef.current) {
          sceneRef.current.remove(particlesRef.current);
          particlesRef.current.geometry.dispose();
          particlesRef.current.material.dispose();
          particlesRef.current = null;
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  );
});

FirecrackerParticles.displayName = 'FirecrackerParticles';

export default FirecrackerParticles;