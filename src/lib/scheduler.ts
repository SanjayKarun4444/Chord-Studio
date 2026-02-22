export interface SchedulerBarEvent {
  barIndex: number;
  barStartTime: number;
}

export type BarCallback = (event: SchedulerBarEvent) => void;

/**
 * Lookahead scheduler that uses setInterval to poll AudioContext.currentTime
 * and schedules audio events ahead of time within a lookahead window.
 * Eliminates drift risk at high BPMs compared to setTimeout chains.
 */
export class LookaheadScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private ctx: AudioContext;
  private onBar: BarCallback;
  private onVisualBar: ((barIndex: number) => void) | null;
  private onVisualStep: ((barIndex: number, step: number) => void) | null;

  private bpm: number = 120;
  private totalBars: number = 4;
  private startTime: number = 0;
  private nextBarIndex: number = 0;
  private running: boolean = false;
  private _stepsPerBar: number = 16;

  // Timing constants
  private readonly POLL_MS = 25;
  private readonly LOOKAHEAD_SEC = 0.1;

  constructor(
    ctx: AudioContext,
    onBar: BarCallback,
    onVisualBar?: (barIndex: number) => void,
    onVisualStep?: (barIndex: number, step: number) => void,
  ) {
    this.ctx = ctx;
    this.onBar = onBar;
    this.onVisualBar = onVisualBar ?? null;
    this.onVisualStep = onVisualStep ?? null;
  }

  setStepsPerBar(steps: number): void {
    this._stepsPerBar = steps;
  }

  start(bpm: number, totalBars: number): void {
    this.stop();
    this.bpm = bpm;
    this.totalBars = totalBars;
    this.startTime = this.ctx.currentTime;
    this.nextBarIndex = 0;
    this.running = true;

    this.intervalId = setInterval(() => this.poll(), this.POLL_MS);
    // Immediately poll to schedule first bar
    this.poll();
  }

  stop(): void {
    this.running = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updateBpm(bpm: number): void {
    this.bpm = bpm;
  }

  updateTotalBars(totalBars: number): void {
    this.totalBars = totalBars;
  }

  isRunning(): boolean {
    return this.running;
  }

  private get barDuration(): number {
    return (60 / this.bpm) * 4;
  }

  private poll(): void {
    if (!this.running) return;

    const now = this.ctx.currentTime;
    const horizon = now + this.LOOKAHEAD_SEC;

    while (this.running) {
      const barStart = this.startTime + this.nextBarIndex * this.barDuration;

      if (barStart > horizon) break;

      // Schedule audio for this bar
      this.onBar({
        barIndex: this.nextBarIndex % this.totalBars,
        barStartTime: barStart,
      });

      // Schedule visual update via setTimeout (needs to fire at visual moment)
      const msUntilBar = Math.max(0, (barStart - now) * 1000);
      const visualIdx = this.nextBarIndex % this.totalBars;
      if (this.onVisualBar) {
        const cb = this.onVisualBar;
        setTimeout(() => cb(visualIdx), msUntilBar);
      }

      // Schedule per-step visual updates for step grid cursor
      if (this.onVisualStep) {
        const stepCb = this.onVisualStep;
        const stepDurMs = (this.barDuration / this._stepsPerBar) * 1000;
        for (let s = 0; s < this._stepsPerBar; s++) {
          const msUntilStep = msUntilBar + s * stepDurMs;
          const barIdx = visualIdx;
          const stepIdx = s;
          setTimeout(() => stepCb(barIdx, stepIdx), msUntilStep);
        }
      }

      this.nextBarIndex++;

      // Loop: when we've passed all bars, wrap
      if (this.nextBarIndex % this.totalBars === 0) {
        this.startTime = this.startTime + this.totalBars * this.barDuration;
        this.nextBarIndex = 0;
      }
    }
  }
}
