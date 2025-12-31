class AudioEngine {
  constructor() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.35; // Volume limiter
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      this.context = null;
    }
  }

  playBurst() {
    if (!this.context || this.context.state === 'suspended') {
      console.warn('Audio context not available or suspended');
      return;
    }

    const now = this.context.currentTime;
    const duration = 0.18;

    // Main pop oscillator with sharper attack
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.frequency.linearRampToValueAtTime(900, now + duration);
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);

    // Second harmonic layer
    this.playHarmonic(now, duration);
    
    // Sparkle layer for luxury feel
    this.playSparkle(now);
  }

  playHarmonic(startTime, duration) {
    const osc2 = this.context.createOscillator();
    const gain2 = this.context.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(450, startTime);
    osc2.frequency.exponentialRampToValueAtTime(40, startTime + duration);

    gain2.gain.setValueAtTime(0.35, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc2.start(startTime);
    osc2.stop(startTime + duration);
  }

  playSparkle(startTime) {
    const duration = 0.08;
    const frequencies = [3000, 4000, 5000];

    frequencies.forEach((freq, index) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      const time = startTime + (index * 0.02);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(time);
      osc.stop(time + duration);
    });
  }

  resumeContext() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().then(() => {
        console.log('Audio context resumed');
      });
    }
  }
}

export default AudioEngine;