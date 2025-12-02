import { useCallback, useRef } from 'react';

export const useGameSounds = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(err => console.error('Audio resume failed:', err));
        }
    }, []);

    const playTick = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // "Tick" sound - short, high pitch, quick decay
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.3, ctx.currentTime); // Volume
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    }, [initAudio]);

    const playWin = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // Play a major chord (C-E-G) arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = ctx.currentTime + (i * 0.1);
            const duration = 0.8;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }, [initAudio]);

    const playSpinStart = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Rising pitch "power up" sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }, [initAudio]);

    const playCheer = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // Create a buffer for a single "clap" sound
        const bufferSize = ctx.sampleRate * 0.1; // 100ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with noise with a decay envelope
        for (let i = 0; i < bufferSize; i++) {
            const noise = Math.random() * 2 - 1;
            const envelope = 1 - (i / bufferSize); // Linear decay
            data[i] = noise * envelope;
        }

        // Function to play a single clap
        const playClap = (time: number) => {
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            // Filter to make it sound like hands clapping (bandpass around 1kHz)
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800 + Math.random() * 600; // Vary pitch per clap
            filter.Q.value = 1;

            const gain = ctx.createGain();
            gain.gain.value = 0.1 + Math.random() * 0.1; // Vary volume

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            source.start(time);
        };

        // Schedule many claps to simulate a crowd
        const now = ctx.currentTime;
        const duration = 2.0; // 2 seconds of applause
        const density = 30; // Claps per second (approx)

        for (let i = 0; i < duration * density; i++) {
            // Randomize timing heavily
            const time = now + (Math.random() * duration);
            // Add a "swell" effect (more claps in the middle)
            if (Math.random() > 0.3) {
                playClap(time);
            }
        }

        // Add a few immediate claps for instant feedback
        for (let i = 0; i < 5; i++) {
            playClap(now + Math.random() * 0.1);
        }

    }, [initAudio]);

    const playConfettiPop = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // 1. The "Thump" (Cannon firing)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);

        // 2. The "Crackle" (Paper flying)
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = ctx.createGain();

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.3);
    }, [initAudio]);

    return { playTick, playWin, playSpinStart, playCheer, playConfettiPop };
};
