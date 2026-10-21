let audioContext: AudioContext | null = null;

/**
 * Creates/resumes the shared AudioContext. Must be called from a user gesture
 * (the timer's "Старт" tap), otherwise mobile browsers keep audio muted.
 */
export function unlockAudio(): void {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    if (!audioContext) audioContext = new Ctor();
    if (audioContext.state === "suspended") void audioContext.resume();
}

function tone(ctx: AudioContext, startAt: number, duration: number, frequency: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.6, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
}

/** Short pip for the last seconds of the countdown. */
export function playTick(): void {
    if (!audioContext) return;
    tone(audioContext, audioContext.currentTime, 0.12, 660);
}

/** End-of-exercise signal: three long beeps plus vibration where supported. */
export function playFinish(): void {
    if (audioContext) {
        const now = audioContext.currentTime;
        for (let i = 0; i < 3; i++) tone(audioContext, now + i * 0.45, 0.35, 880);
    }
    navigator.vibrate?.([300, 150, 300, 150, 600]);
}
