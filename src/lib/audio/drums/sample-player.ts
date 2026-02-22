import type { DrumType, PackId, SamplePlayOptions } from "./types";
import { PACK_REGISTRY } from "./pack-manifests";
import { preloadPack, getSample, isPackLoaded } from "./sample-cache";
import { playSynthDrum } from "@/lib/drums";

export class SampleDrumPlayer {
  private ctx: AudioContext;
  private destination: AudioNode;
  private _hatDestination: AudioNode | null = null;
  private _currentPack: PackId | null = null;

  // Round-robin index per drum type
  private rrIndex = new Map<DrumType, number>();

  // Open hat choke tracking
  private activeOhatGain: GainNode | null = null;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;
  }

  /** Set an optional routing destination for hihat/ohat samples (e.g. hat panner) */
  setHatDestination(node: AudioNode | null): void {
    this._hatDestination = node;
  }

  async loadPack(packId: PackId): Promise<void> {
    const manifest = PACK_REGISTRY[packId];
    if (!manifest) return;
    await preloadPack(this.ctx, manifest);
    this._currentPack = packId;
    // Reset round-robin indices
    this.rrIndex.clear();
  }

  get currentPack(): PackId | null {
    return this._currentPack;
  }

  get ready(): boolean {
    if (!this._currentPack) return false;
    const manifest = PACK_REGISTRY[this._currentPack];
    return isPackLoaded(manifest);
  }

  play(type: DrumType, time: number, options: SamplePlayOptions = {}): void {
    const { velocity = 1.0, pitchCents = 0, timingOffsetSec = 0 } = options;
    const scheduledTime = time + timingOffsetSec;

    if (!this._currentPack) {
      playSynthDrum(type, scheduledTime, velocity);
      return;
    }

    const manifest = PACK_REGISTRY[this._currentPack];
    const entries = manifest.drums[type];
    if (!entries || entries.length === 0) {
      playSynthDrum(type, scheduledTime, velocity);
      return;
    }

    // Round-robin selection
    const rrIdx = this.rrIndex.get(type) ?? 0;
    const entry = entries[rrIdx % entries.length];
    this.rrIndex.set(type, (rrIdx + 1) % entries.length);

    const buffer = getSample(entry.url);
    if (!buffer) {
      // Sample not loaded yet — fall back to synth
      playSynthDrum(type, scheduledTime, velocity);
      return;
    }

    // Hat choke: when closed hihat plays, kill any active open hat
    if (type === "hihat" && this.activeOhatGain) {
      this.activeOhatGain.gain.cancelScheduledValues(scheduledTime);
      this.activeOhatGain.gain.setValueAtTime(
        this.activeOhatGain.gain.value,
        scheduledTime,
      );
      this.activeOhatGain.gain.linearRampToValueAtTime(0, scheduledTime + 0.005);
      this.activeOhatGain = null;
    }

    // Create playback graph: BufferSourceNode → GainNode → destination
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    // Pitch: entry pitch offset + per-play pitch
    const totalCents = (entry.pitchCents ?? 0) + pitchCents;
    if (totalCents !== 0) {
      source.playbackRate.value = Math.pow(2, totalCents / 1200);
    }

    const gainNode = this.ctx.createGain();
    // Velocity curve: gain = velocity^1.5 for natural dynamics
    const sampleGain = entry.gain ?? 1.0;
    gainNode.gain.setValueAtTime(
      Math.pow(velocity, 1.5) * sampleGain,
      scheduledTime,
    );

    source.connect(gainNode);
    // Route hats through hat destination if available
    const dest = (type === "hihat" || type === "ohat") && this._hatDestination
      ? this._hatDestination
      : this.destination;
    gainNode.connect(dest);

    // Track open hat gain for choking
    if (type === "ohat") {
      this.activeOhatGain = gainNode;
    }

    source.start(scheduledTime);

    // Cleanup: disconnect after playback ends
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
      if (this.activeOhatGain === gainNode) {
        this.activeOhatGain = null;
      }
    };
  }
}
