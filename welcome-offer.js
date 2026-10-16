(function () {
  'use strict';

  const storageKey = 'real-piece-welcome-v1';
  const durationMs = 600000;
  const memoryByStorage = new WeakMap();
  let memoryWithoutStorage = null;

  function isStateValid(state) {
    return Boolean(state && state.version === 1 &&
      Number.isSafeInteger(state.startedAt) && state.startedAt >= 0 &&
      Number.isSafeInteger(state.expiresAt) &&
      state.expiresAt === state.startedAt + durationMs &&
      typeof state.seen === 'boolean');
  }

  function storageIsObject(storage) {
    return storage !== null && (typeof storage === 'object' || typeof storage === 'function');
  }

  function remember(state, storage) {
    if (storageIsObject(storage)) memoryByStorage.set(storage, state);
    else memoryWithoutStorage = state;
  }

  function persist(state, storage) {
    remember(state, storage);
    try {
      storage?.setItem(storageKey, JSON.stringify(state));
    } catch (_) {
      // Keep the same deadline in memory when browser storage is unavailable.
    }
  }

  function readOrCreate(storage, now = Date.now()) {
    const remembered = storageIsObject(storage) ? memoryByStorage.get(storage) : memoryWithoutStorage;
    if (isStateValid(remembered)) return remembered;

    try {
      const saved = JSON.parse(storage?.getItem(storageKey) || 'null');
      if (isStateValid(saved)) {
        remember(saved, storage);
        return saved;
      }
    } catch (_) {
      // A missing or unreadable entry falls back to this session's state.
    }

    const startedAt = Number.isSafeInteger(now) && now >= 0 ? now : Date.now();
    const state = { version: 1, startedAt, expiresAt: startedAt + durationMs, seen: false };
    persist(state, storage);
    return state;
  }

  function markSeen(state, storage) {
    if (!isStateValid(state)) throw new Error('Stato di benvenuto non valido.');
    const nextState = {
      version: 1,
      startedAt: state.startedAt,
      expiresAt: state.expiresAt,
      seen: true
    };
    persist(nextState, storage);
    return nextState;
  }

  function remainingSeconds(state, now = Date.now()) {
    if (!isStateValid(state) || !Number.isFinite(now)) return 0;
    return Math.max(0, Math.ceil(Math.min(durationMs, state.expiresAt - now) / 1000));
  }

  function isActive(state, now = Date.now()) {
    return remainingSeconds(state, now) > 0;
  }

  window.RealPieceWelcome = Object.freeze({
    storageKey,
    durationMs,
    readOrCreate,
    markSeen,
    remainingSeconds,
    isActive
  });
})();
