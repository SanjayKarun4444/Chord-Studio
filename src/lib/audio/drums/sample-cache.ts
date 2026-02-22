import type { PackManifest } from "./types";

const _bufferCache = new Map<string, AudioBuffer>();
const _inFlight = new Map<string, Promise<AudioBuffer>>();

export async function loadSample(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const cached = _bufferCache.get(url);
  if (cached) return cached;

  const pending = _inFlight.get(url);
  if (pending) return pending;

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
      return res.arrayBuffer();
    })
    .then((arrayBuf) => {
      // Use callback-style decodeAudioData for Safari compatibility
      return new Promise<AudioBuffer>((resolve, reject) => {
        ctx.decodeAudioData(arrayBuf, resolve, reject);
      });
    })
    .then((audioBuf) => {
      _bufferCache.set(url, audioBuf);
      _inFlight.delete(url);
      return audioBuf;
    })
    .catch((err) => {
      _inFlight.delete(url);
      throw err;
    });

  _inFlight.set(url, promise);
  return promise;
}

export async function preloadPack(ctx: AudioContext, manifest: PackManifest): Promise<void> {
  const urls: string[] = [];
  for (const entries of Object.values(manifest.drums)) {
    for (const entry of entries) {
      urls.push(entry.url);
    }
  }
  await Promise.all(urls.map((url) => loadSample(ctx, url)));
}

export function getSample(url: string): AudioBuffer | undefined {
  return _bufferCache.get(url);
}

export function isPackLoaded(manifest: PackManifest): boolean {
  for (const entries of Object.values(manifest.drums)) {
    for (const entry of entries) {
      if (!_bufferCache.has(entry.url)) return false;
    }
  }
  return true;
}
