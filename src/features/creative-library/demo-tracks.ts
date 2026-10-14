// Placeholder previews for the AI music suggestions until generated tracks
// are connected: short loops synthesized in the browser, one style per slot.

const SAMPLE_RATE = 22050;
export const DEMO_TRACK_SECONDS = 15;

type Ctx = OfflineAudioContext;

function noiseBuffer(ctx: Ctx) {
  const buf = ctx.createBuffer(1, SAMPLE_RATE, SAMPLE_RATE);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function tone(ctx: Ctx, t: number, freq: number, dur: number, type: OscillatorType, level: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function kick(ctx: Ctx, t: number, level = 0.9) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.35);
}

function noiseHit(ctx: Ctx, noise: AudioBuffer, t: number, filter: BiquadFilterType, freq: number, dur: number, level: number) {
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = noise;
  f.type = filter;
  f.frequency.value = freq;
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(gain).connect(ctx.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
}

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
// A minor – F – C – G, as MIDI roots.
const ROOTS = [57, 53, 48, 55];
const MINOR = [0, 3, 7];
const MAJOR = [0, 4, 7];

function chordOf(bar: number) {
  const root = ROOTS[bar % ROOTS.length];
  return (bar % ROOTS.length === 0 ? MINOR : MAJOR).map((i) => root + i);
}

function schedule(ctx: Ctx, variant: number) {
  const noise = noiseBuffer(ctx);
  const bpm = [110, 96, 72, 140, 100, 124][variant % 6];
  const beat = 60 / bpm;
  const bars = Math.ceil(DEMO_TRACK_SECONDS / (beat * 4));

  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * beat * 4;
    const chord = chordOf(bar);
    for (let b = 0; b < 4; b++) {
      const t = t0 + b * beat;
      if (t >= DEMO_TRACK_SECONDS) break;
      switch (variant % 6) {
        case 0: // Fresh rhythm: kick, offbeat hats, bass
          if (b % 2 === 0) kick(ctx, t);
          noiseHit(ctx, noise, t + beat / 2, "highpass", 7000, 0.05, 0.25);
          tone(ctx, t, midi(chord[0] - 12), beat * 0.8, "triangle", 0.35);
          break;
        case 1: // Different instrumentation: plucked arpeggio
          for (let s = 0; s < 4; s++) tone(ctx, t + (s * beat) / 4, midi(chord[s % 3] + 12), beat * 0.6, "triangle", 0.18);
          break;
        case 2: // Mood variation: slow minor pads
          if (b === 0) chord.forEach((n) => tone(ctx, t, midi(n - (bar % 2 ? 0 : 1)), beat * 4, "sine", 0.14));
          break;
        case 3: // Energy variation: driving kick and saw bass
          kick(ctx, t, 1);
          noiseHit(ctx, noise, t + beat / 2, "highpass", 6000, 0.04, 0.3);
          tone(ctx, t, midi(chord[0] - 12), beat * 0.45, "sawtooth", 0.18);
          tone(ctx, t + beat / 2, midi(chord[0] - 12), beat * 0.45, "sawtooth", 0.18);
          break;
        case 4: // New melody: sine lead over soft pad
          if (b === 0) chord.forEach((n) => tone(ctx, t, midi(n), beat * 4, "sine", 0.07));
          tone(ctx, t, midi(chord[(b + bar) % 3] + 12 + (b === 3 ? 2 : 0)), beat * 0.9, "sine", 0.25);
          break;
        default: // Trending sound: four on the floor, clap, bass
          kick(ctx, t);
          if (b % 2 === 1) noiseHit(ctx, noise, t, "bandpass", 1500, 0.15, 0.5);
          tone(ctx, t + beat / 2, midi(chord[0] - 12), beat * 0.4, "square", 0.12);
      }
    }
  }
}

function toWav(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0);
  const out = new DataView(new ArrayBuffer(44 + data.length * 2));
  const str = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  out.setUint32(4, 36 + data.length * 2, true);
  str(8, "WAVEfmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 1, true);
  out.setUint32(24, buffer.sampleRate, true);
  out.setUint32(28, buffer.sampleRate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  str(36, "data");
  out.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i] * 0.9)) * 0x7fff, true);
  return new Blob([out], { type: "audio/wav" });
}

export function peaksOf(buffer: AudioBuffer, count: number) {
  const data = buffer.getChannelData(0);
  const size = Math.floor(data.length / count);
  const peaks = Array.from({ length: count }, (_, i) => {
    let max = 0;
    for (let j = i * size; j < (i + 1) * size; j++) max = Math.max(max, Math.abs(data[j]));
    return max;
  });
  const top = Math.max(...peaks, 0.0001);
  return peaks.map((p) => p / top);
}

const cache = new Map<string, Promise<{ src: string; peaks: number[] }>>();

/** Renders (once) the demo preview of a music suggestion slot. */
export function getDemoTrack(key: string, variant: number, bars: number) {
  let track = cache.get(key);
  if (!track) {
    track = (async () => {
      const ctx = new OfflineAudioContext(1, SAMPLE_RATE * DEMO_TRACK_SECONDS, SAMPLE_RATE);
      schedule(ctx, variant);
      const buffer = await ctx.startRendering();
      return { src: URL.createObjectURL(toWav(buffer)), peaks: peaksOf(buffer, bars) };
    })();
    cache.set(key, track);
  }
  return track;
}

const fileCache = new Map<string, Promise<{ src: string; peaks: number[] }>>();

/** The real waveform of an audio or video file, for the original's player. */
export function getFileTrack(url: string, bars: number) {
  let track = fileCache.get(url);
  if (!track) {
    track = (async () => {
      const data = await (await fetch(url)).arrayBuffer();
      const ctx = new OfflineAudioContext(1, 1, SAMPLE_RATE);
      const buffer = await ctx.decodeAudioData(data);
      return { src: url, peaks: peaksOf(buffer, bars) };
    })();
    fileCache.set(url, track);
  }
  return track;
}
