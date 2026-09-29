/**
 * Kitchen Service Bell Audio Synthesizer
 * Produces an authentic metallic restaurant order chime ("Ding-Dong! Ding-Dong!")
 * using Web Audio API without needing external mp3 files.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// Unlock audio context on any user interaction so incoming orders can ring immediately
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {
      // safe ignore
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Plays a single bell strike with metallic overtones
 */
function playSingleStrike(ctx: AudioContext, baseFreq: number, startTime: number, gainVolume = 0.3) {
  try {
    // Fundamental tone + metallic overtones
    const harmonics = [
      { freqMult: 1.0, gainMult: 0.8, decay: 0.9 },
      { freqMult: 2.02, gainMult: 0.45, decay: 0.7 },
      { freqMult: 3.01, gainMult: 0.25, decay: 0.5 },
      { freqMult: 4.25, gainMult: 0.15, decay: 0.35 },
    ];

    harmonics.forEach(({ freqMult, gainMult, decay }) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * freqMult, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        // Instant attack
        gain.gain.linearRampToValueAtTime(gainVolume * gainMult, startTime + 0.005);
        // Natural exponential ring decay
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + decay);
      } catch {
        // Safe ignore
      }
    });
  } catch {
    // Safe ignore
  }
}

/**
 * Plays the loud, attention-grabbing restaurant kitchen order ring:
 * "Ding-Dong! ... Ding-Dong!"
 */
export function playOrderNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime || 0;

    // First Chime: High Ding (1046 Hz C6) -> Lower Dong (784 Hz G5)
    playSingleStrike(ctx, 1046.5, now + 0.05, 0.45);
    playSingleStrike(ctx, 783.99, now + 0.22, 0.4);

    // Second Chime: High Ding -> Lower Dong (accentuated echo for kitchen alertness)
    playSingleStrike(ctx, 1046.5, now + 0.52, 0.45);
    playSingleStrike(ctx, 880.0, now + 0.70, 0.42);
  } catch {
    // Safe ignore all audio context failures
  }
}
