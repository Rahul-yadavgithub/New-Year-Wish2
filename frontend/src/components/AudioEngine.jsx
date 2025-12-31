class AudioEngine {
  constructor() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.35;
      
      // Background music gain (separate control)
      this.musicGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0;
      
      // Effects for music (reverb + subtle delay)
      this.musicConvolver = this.context.createConvolver();
      this.musicDelay = this.context.createDelay(0.3);
      this.musicDelay.delayTime.value = 0.12;
      this.musicFeedback = this.context.createGain();
      this.musicFeedback.gain.value = 0.4;
      
      // Connect music FX chain
      this.musicGain.connect(this.musicConvolver);
      this.musicConvolver.connect(this.musicDelay);
      this.musicDelay.connect(this.musicFeedback);
      this.musicFeedback.connect(this.musicDelay);
      this.musicDelay.connect(this.masterGain);
      
      this.isMusicPlaying = false;
      this.isBurstPlaying = false;
      
      console.log('AudioEngine initialized');
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      this.context = null;
    }
  }

  // 🔥 MAIN FIRECRACKER BURST (Opening explosion)
  async playBurst() {
    if (!this.context || this.context.state === 'suspended') {
      console.warn('Audio context not available');
      return false;
    }

    // Resume context first
    await this.resumeContext();

    this.isBurstPlaying = true;
    const now = this.context.currentTime;
    const duration = 0.22;

    // MAIN EXPLOSION (Square wave - sharp attack)
    const osc1 = this.context.createOscillator();
    const gain1 = this.context.createGain();
    const filter1 = this.context.createBiquadFilter();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2400, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + duration);

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(5000, now);
    filter1.frequency.exponentialRampToValueAtTime(800, now + duration);
    filter1.Q.value = 2;

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.85, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + duration + 0.1);

    // LOW RUMBLE (Triangle - body)
    this.playRumble(now + 0.03, duration * 1.5);

    // SPARKLES (High freq sine waves)
    this.playSparkles(now + 0.08);

    // CRACKLE TAIL (Noise burst)
    this.playCrackle(now + 0.12);

    setTimeout(() => {
      this.isBurstPlaying = false;
    }, duration * 1000 * 2);

    return true;
  }

  // 🎵 BACKGROUND MUSIC (starts with Happy New Year text)
  async playBackgroundMusic() {
    if (!this.context || this.isMusicPlaying) return;

    await this.resumeContext();
    this.isMusicPlaying = true;

    const now = this.context.currentTime;
    
    // Gentle ambient pad (sawtooth waves)
    const notes = [
      {freq: 220, vol: 0.12},  // A3
      {freq: 277, vol: 0.09},  // C#4  
      {freq: 330, vol: 0.11},  // E4
      {freq: 440, vol: 0.08}   // A5
    ];

    notes.forEach((note, index) => {
      this.playAmbientNote(note.freq, note.vol, now + index * 0.3, 8 + Math.random() * 4);
    });

    // Pulsing rhythm layer
    this.playMusicPulse(now + 2, 16);

    // Fade in music smoothly
    this.musicGain.gain.linearRampToValueAtTime(0.22, now + 0.5);
    this.musicGain.gain.linearRampToValueAtTime(0.18, now + 12);

    // Auto fade out after 15 seconds
    setTimeout(() => {
      this.musicGain.gain.exponentialRampToValueAtTime(0.001, now + 18);
      setTimeout(() => {
        this.isMusicPlaying = false;
      }, 2000);
    }, 15000);
  }

  // Stop all sounds
  stopAll() {
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 1);
    this.isMusicPlaying = false;
    this.isBurstPlaying = false;
  }

  // Resume audio context (required for user interaction)
  async resumeContext() {
    if (this.context && this.context.state === 'suspended') {
      return this.context.resume().then(() => {
        console.log('✅ Audio context resumed');
        return true;
      }).catch(e => {
        console.warn('Failed to resume audio context', e);
        return false;
      });
    }
    return true;
  }

  // ================= LOW-LEVEL SOUND GENERATORS =================

  playRumble(startTime, duration) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.frequency.linearRampToValueAtTime(100, startTime + duration);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.45, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.2);
  }

  playSparkles(startTime) {
    const sparkles = [2800, 3800, 5200, 6800];
    sparkles.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.28, this.context.currentTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.15);
      }, i * 25);
    });
  }

  playCrackle(startTime) {
    // White noise crackle
    const bufferSize = this.context.sampleRate * 0.08;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 2000;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(startTime);
  }

  playAmbientNote(freq, vol, startTime, duration) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Slow attack for ambient pad
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(this.musicGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.5);
  }

  playMusicPulse(startTime, duration) {
    const now = this.context.currentTime;
    for (let i = 0; i < duration; i += 1.1) {
      setTimeout(() => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.value = 110 + (Math.random() * 20);

        gain.gain.setValueAtTime(0.08, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, this.context.currentTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.45);

        osc.connect(this.musicGain);
        osc.start();
        osc.stop(this.context.currentTime + 0.5);
      }, (i + Math.random() * 0.3) * 1000);
    }
  }
}

export default AudioEngine;
