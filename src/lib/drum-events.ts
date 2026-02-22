import type { DrumType } from "./audio/drums/types";

export interface DrumHitEvent {
  type: DrumType;
  velocity: number;
  scheduledTime: number;
}

type Listener = (event: DrumHitEvent) => void;

const listeners = new Map<DrumType | "*", Set<Listener>>();

export function onDrumHit(type: DrumType | "*", listener: Listener): () => void {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(listener);
  return () => {
    listeners.get(type)?.delete(listener);
  };
}

export function emitDrumHit(event: DrumHitEvent): void {
  listeners.get(event.type)?.forEach((fn) => fn(event));
  listeners.get("*")?.forEach((fn) => fn(event));
}
