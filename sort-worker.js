// Web Worker for parallel compare-and-swap.
// Receives one chunk of non-overlapping index pairs per message and writes
// results directly into the SharedArrayBuffer — no copying needed.

let g; // Uint8Array view of the shared grid SAB

self.onmessage = function(e) {
  const d = e.data;

  if (d.type === 'init') {
    g = new Uint8Array(d.buffer);
    self.postMessage({ type: 'ready' });
    return;
  }

  if (d.type === 'swap_pairs') {
    // pairsBuf: transferred Int32Array buffer — flat list [a0,b0, a1,b1, ...]
    // Each (a,b) is a flat grid index. Pairs within this chunk are non-overlapping.
    const p = new Int32Array(d.pairsBuf);
    let swaps = 0;
    for (let i = 0; i < p.length; i += 2) {
      const a = p[i], b = p[i + 1];
      if (g[a] > g[b]) {
        const t = g[a]; g[a] = g[b]; g[b] = t;
        swaps++;
      }
    }
    self.postMessage({ type: 'done', id: d.id, swaps });
  }
};
