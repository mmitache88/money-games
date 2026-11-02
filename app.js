window.KMG_BUILD = {"target":"web","debug":false,"version":"ae1adf220c09","games":[{"id":"coin-sorter","title":"Coin Sorter","prefix":"COIN"}],"access":{"requireAccessCode":true,"hashes":{"coin-sorter":["09efc35465112c278366fa55160b495a565c45ae27365905d98fbd70301089f9","c2559e31b43e253f001e28a5b484c02ba547134b25b63e126775079d0e36508a","88d47d9c2c16fd82f9df086a281b5f264c5aa2eace8dbdac1be3978c737e7a87","240d7010d83181dd6a26ae0928a67c80fd61b5f9ef771124225ec32b8e756aca","a7a75441f2d1b1f7648359e656af3032b4a170f86051cc9319b91d84bf5afed0","14f12956b4ed06acadc0f4f92499862cf5b0a1c4ed3a5ad166a99cf451f72b55","eede2cf5a790ec582057d5de840004b0469e22ba51c33960c24a9de0b1cb3548","6d11f68eb4d06290178bed073de34c1eb711a199665e619158b6736139920321","8ba1c850676bf74f13b26850bff10e9b1a51b6dac67488f822fc87e89b53ea15","8ed9ff6991bacd5eeae149bc55cd7e17fb765b3342cdd96a1f23fbcdc6464809"]}}};
// Everything lives on one global, KMG. The build puts KMG_BUILD in front of this
// file: { target: 'standalone' | 'web', debug, version, games }.
(function () {
  'use strict';

  window.KMG = {
    build: window.KMG_BUILD,
    games: {},

    // A game calls this once, with:
    //   prepare()   any set-up its hub art needs
    //   art()       the picture for its hub tile
    //   open(exit)  shows the game. `exit` leaves it, and is null in the standalone
    //               build, where there is nowhere to go back to
    registerGame(id, game) {
      this.games[id] = game;
    },
  };
})();

// Test support. ?debug=1 only does anything in a build made with --debug, so a
// production copy ignores every parameter here.
(function (KMG) {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const on = KMG.build.debug && params.get('debug') === '1';

  function number(name) {
    if (!on || !params.has(name)) return null;
    const value = Number(params.get(name));
    return Number.isFinite(value) ? value : null;
  }

  KMG.debug = {
    on,
    seed: number('seed'),
    level: number('level'),
    stage: number('stage'),
    flag: (name) => on && params.get(name) === '1',
  };
})(window.KMG);

// Saved data. Every localStorage touch is wrapped, because just reading
// window.localStorage can throw on file:// and in private browsing. Values are
// always kept in memory too, so the game carries on for the session either way.
(function (KMG) {
  'use strict';

  const PREFIX = 'kmg.v1.';
  const memory = new Map();

  function browserStore() {
    try {
      return window.localStorage || null;
    } catch (error) {
      return null;
    }
  }

  function load(name, fallback) {
    let text = memory.has(name) ? memory.get(name) : null;
    if (text === null) {
      try {
        const store = browserStore();
        text = store ? store.getItem(PREFIX + name) : null;
      } catch (error) {
        text = null;
      }
    }
    if (text === null) return fallback;
    try {
      return JSON.parse(text);
    } catch (error) {
      return fallback;
    }
  }

  function save(name, value) {
    const text = JSON.stringify(value);
    memory.set(name, text);
    try {
      const store = browserStore();
      if (store) store.setItem(PREFIX + name, text);
    } catch (error) {
      // Full or blocked: the value stays in memory for this session.
    }
  }

  function remove(name) {
    memory.delete(name);
    try {
      const store = browserStore();
      if (store) store.removeItem(PREFIX + name);
    } catch (error) {
      // Nothing to do: it has gone from memory.
    }
  }

  // Only our own keys, so another app on the same origin is left alone.
  function clearAll() {
    memory.clear();
    try {
      const store = browserStore();
      if (!store) return;
      const ours = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key && key.indexOf(PREFIX) === 0) ours.push(key);
      }
      ours.forEach((key) => store.removeItem(key));
    } catch (error) {
      // Nothing to do: memory is already clear.
    }
  }

  KMG.storage = { load, save, remove, clearAll };
})(window.KMG);

// A small seeded random number generator (mulberry32), so a test can fix the
// coin layout with ?seed=123. Without a seed it starts from the clock.
(function (KMG) {
  'use strict';

  function create(seed) {
    let state = (seed === null || seed === undefined ? Date.now() : seed) >>> 0;

    function next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    return {
      next,
      int: (limit) => Math.floor(next() * limit),
      pick: (list) => list[Math.floor(next() * list.length)],
      // Fisher-Yates on a copy, so the caller's list is left alone.
      shuffle(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      },
    };
  }

  KMG.rng = { create };
})(window.KMG);

// All sounds are made with the Web Audio API, so there are no audio files.
// Every call is wrapped: headless browsers and locked-down devices may have no
// audio at all, and the game must carry on silently if so.
(function (KMG) {
  'use strict';

  let context = null;
  let unavailable = false;

  // iOS only starts audio inside a user gesture, and not every event counts on
  // every version, so all of these are tried until the context is running.
  const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];

  function getContext() {
    if (context || unavailable) return context;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) context = new Context();
      else unavailable = true;
    } catch (error) {
      unavailable = true;
    }
    return context;
  }

  function stopListening() {
    UNLOCK_EVENTS.forEach((name) => document.removeEventListener(name, unlock, true));
  }

  function unlock() {
    try {
      const audio = getContext();
      if (!audio) {
        stopListening();
        return;
      }
      if (audio.state === 'suspended') {
        const resumed = audio.resume();
        if (resumed && resumed.catch) resumed.catch(() => {});
      }
      if (audio.state === 'running') stopListening();
    } catch (error) {
      stopListening();
    }
  }

  function listenForUnlock() {
    UNLOCK_EVENTS.forEach((name) => document.addEventListener(name, unlock, true));
  }

  // One soft note with a quick fade in and out, so it never clicks.
  function note(audio, { frequency, start = 0, length = 0.15, volume = 0.2, type = 'sine', slideTo }) {
    const at = audio.currentTime + start;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, at + length);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  }

  const SOUNDS = {
    pickup: [{ frequency: 880, length: 0.05, volume: 0.08, type: 'triangle' }],
    correct: [
      { frequency: 659, length: 0.14 },
      { frequency: 880, start: 0.08, length: 0.14 },
      { frequency: 1319, start: 0.16, length: 0.22 },
    ],
    // Low and short, a soft "boop", never a buzzer.
    wrong: [{ frequency: 294, slideTo: 247, length: 0.2, volume: 0.12 }],
    star: [{ frequency: 1760, length: 0.25, volume: 0.1, type: 'triangle' }],
    fanfare: [
      { frequency: 523, length: 0.15 },
      { frequency: 659, start: 0.14, length: 0.15 },
      { frequency: 784, start: 0.28, length: 0.15 },
      { frequency: 1047, start: 0.42, length: 0.4 },
      { frequency: 784, start: 0.42, length: 0.4, volume: 0.12 },
    ],
  };

  function play(name) {
    if (!KMG.audio.isEnabled()) return;
    try {
      const audio = getContext();
      if (!audio || audio.state !== 'running') return;
      (SOUNDS[name] || []).forEach((sound) => note(audio, sound));
    } catch (error) {
      // No sound this time.
    }
  }

  function settings() {
    return Object.assign({ sound: true, voice: true }, KMG.storage.load('sound', null));
  }

  function saveSettings(changes) {
    KMG.storage.save('sound', Object.assign(settings(), changes));
  }

  KMG.audio = {
    listenForUnlock,
    play,
    settings,
    saveSettings,
    isEnabled: () => settings().sound,
    // The mute button is one switch over both: muted means sound and voice are off.
    isMuted() {
      const { sound, voice } = settings();
      return !sound && !voice;
    },
    setMuted(muted) {
      saveSettings({ sound: !muted, voice: !muted });
      if (muted && KMG.speech) KMG.speech.stop();
    },
  };
})(window.KMG);

// Spoken prompts, using an en-GB voice when the device has one. Every prompt is
// also on screen, so with no voice the game just stays quiet.
(function (KMG) {
  'use strict';

  function synth() {
    try {
      return window.speechSynthesis || null;
    } catch (error) {
      return null;
    }
  }

  function findVoice() {
    try {
      const engine = synth();
      if (!engine) return null;
      const voices = engine.getVoices() || [];
      return voices.find((voice) => /^en[-_]GB/i.test(voice.lang)) ||
        voices.find((voice) => /^en/i.test(voice.lang)) ||
        null;
    } catch (error) {
      return null;
    }
  }

  function stop() {
    try {
      const engine = synth();
      if (engine) engine.cancel();
    } catch (error) {
      // Nothing was playing that we can reach.
    }
  }

  function say(text) {
    if (!KMG.audio.settings().voice) return;
    try {
      const engine = synth();
      const voice = findVoice();
      if (!engine || !voice || typeof window.SpeechSynthesisUtterance !== 'function') return;
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.9;
      engine.cancel();
      engine.speak(utterance);
    } catch (error) {
      // Stay quiet: the prompt is on screen.
    }
  }

  KMG.speech = { say, stop };
})(window.KMG);

// Small DOM helpers and the shared icons.
(function (KMG) {
  'use strict';

  // el('button', { class: 'x', onclick: fn }, 'Text', childNode)
  function el(tag, attributes, ...children) {
    const node = document.createElement(tag);
    Object.entries(attributes || {}).forEach(([name, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (name.indexOf('on') === 0) node.addEventListener(name.slice(2), value);
      else if (name === 'html') node.innerHTML = value;
      else node.setAttribute(name, value === true ? '' : value);
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  // Replaces whatever is on screen. A screen can set `onleave` to clean up
  // anything it added outside itself, such as window listeners.
  let current = null;
  function show(screen) {
    if (current && current.onleave) current.onleave();
    current = screen;
    const app = document.getElementById('app');
    app.textContent = '';
    app.appendChild(screen);
  }

  const reducedMotion = () => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      return false;
    }
  };

  const STROKE = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
  const SPEAKER = '<path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/>';
  const ICONS = {
    back: `<path ${STROKE} d="M15 5l-7 7 7 7"/>`,
    home: '<path fill="currentColor" d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    star: '<path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3L7.4 14 2.5 9.4l6.6-.8z"/>',
    lock: `<path ${STROKE} d="M8 11V8a4 4 0 0 1 8 0v3"/><rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor"/>`,
    replay: '<path fill="currentColor" d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/>',
    next: '<path fill="currentColor" d="M6 5l9 7-9 7zM16 5h3v14h-3z"/>',
    person: '<path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm-8 9a8 8 0 0 1 16 0z"/>',
    soundOn: `${SPEAKER}<path ${STROKE} d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>`,
    soundOff: `${SPEAKER}<path ${STROKE} d="M16 9.5l5 5M21 9.5l-5 5"/>`,
  };

  function icon(name) {
    return el('span', {
      class: 'icon',
      'aria-hidden': 'true',
      html: `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>`,
    });
  }

  function iconButton(name, label, onclick, action) {
    return el('button', { class: 'icon-btn', 'aria-label': label, 'data-action': action, onclick }, icon(name));
  }

  // The same button everywhere, so it is always in the same place and remembered.
  function muteButton() {
    const button = el('button', { class: 'icon-btn', 'data-action': 'mute' });
    const refresh = () => {
      const muted = KMG.audio.isMuted();
      button.textContent = '';
      button.appendChild(icon(muted ? 'soundOff' : 'soundOn'));
      button.setAttribute('aria-pressed', String(muted));
      button.setAttribute('aria-label', muted ? 'Sound is off' : 'Sound is on');
    };
    button.addEventListener('click', () => {
      KMG.audio.setMuted(!KMG.audio.isMuted());
      refresh();
    });
    refresh();
    return button;
  }

  KMG.ui = { el, show, reducedMotion, icon, iconButton, muteButton };
})(window.KMG);

// Dragging with Pointer Events, so mouse, finger and stylus all work the same.
// Only one pointer can drag at a time: a resting palm or a second thumb is ignored.
(function (KMG) {
  'use strict';

  let activePointer = null;

  // handlers: canStart(), onStart(), onEnd(), onCancel()
  function draggable(node, handlers) {
    let startX = 0;
    let startY = 0;

    node.addEventListener('pointerdown', (event) => {
      if (activePointer !== null) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (handlers.canStart && !handlers.canStart()) return;

      activePointer = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      try {
        node.setPointerCapture(event.pointerId);
      } catch (error) {
        // Capture is a nicety: moves still reach the node while over it.
      }
      event.preventDefault();
      handlers.onStart();
    });

    node.addEventListener('pointermove', (event) => {
      if (event.pointerId !== activePointer) return;
      node.style.transform = `translate(${event.clientX - startX}px, ${event.clientY - startY}px)`;
    });

    function finish(event, callback) {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      callback();
    }

    node.addEventListener('pointerup', (event) => finish(event, handlers.onEnd));
    node.addEventListener('pointercancel', (event) => finish(event, handlers.onCancel));
    // Fires after pointerup as well, by which time activePointer is already clear.
    node.addEventListener('lostpointercapture', (event) => finish(event, handlers.onCancel));
  }

  // A screen that replaces a mid-drag coin must not leave the lock held.
  function reset() {
    activePointer = null;
  }

  KMG.drag = { draggable, reset };
})(window.KMG);

// Sparkles and confetti, built from plain elements. Both are skipped entirely
// for anyone who prefers reduced motion.
(function (KMG) {
  'use strict';

  const { el, reducedMotion } = KMG.ui;

  const removeLater = (node, ms) => window.setTimeout(() => node.remove(), ms);

  function sparkle(x, y) {
    if (reducedMotion()) return;
    const burst = el('div', { class: 'sparkle', style: `left:${x}px;top:${y}px`, 'aria-hidden': 'true' });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      burst.appendChild(el('span', {
        style: `--x:${Math.round(Math.cos(angle) * 64)}px;--y:${Math.round(Math.sin(angle) * 64)}px`,
      }));
    }
    document.body.appendChild(burst);
    removeLater(burst, 700);
  }

  const CONFETTI_COLOURS = ['#ffd56b', '#ff9d8a', '#8fd3c7', '#cfc8f2', '#9cc9f5'];

  function confetti(parent) {
    if (reducedMotion()) return;
    const layer = el('div', { class: 'confetti', 'aria-hidden': 'true' });
    for (let i = 0; i < 44; i++) {
      layer.appendChild(el('span', {
        style: [
          `left:${Math.random() * 100}%`,
          `background:${CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]}`,
          `animation-delay:${(Math.random() * 0.7).toFixed(2)}s`,
          `animation-duration:${(1.8 + Math.random() * 1.2).toFixed(2)}s`,
        ].join(';'),
      }));
    }
    parent.appendChild(layer);
    removeLater(layer, 3800);
  }

  KMG.effects = { sparkle, confetti };
})(window.KMG);

// The end-of-round screen, used by every game: stars, confetti, cheerful sound.
(function (KMG) {
  'use strict';

  const { el, icon, reducedMotion } = KMG.ui;

  const STAR_GAP_MS = 320;

  // options: stars (1 to 3), onAgain, onHome, and onNext (null when there is no next level)
  function celebrate(parent, options) {
    const stars = [1, 2, 3].map((n) => el('span', {
      class: `star ${n <= options.stars ? 'star-won' : 'star-empty'}`,
      style: `--delay:${(n - 1) * STAR_GAP_MS}ms`,
    }, icon('star')));

    const button = (action, iconName, label, onclick, primary) => el('button', {
      class: `btn ${primary ? 'btn-primary' : ''}`,
      'data-action': action,
      onclick,
    }, icon(iconName), ' ', label);

    const overlay = el('div', {
      class: 'celebration',
      'data-screen': 'celebration',
      'data-stars': options.stars,
      role: 'dialog',
      'aria-label': `${options.stars} ${options.stars === 1 ? 'star' : 'stars'}`,
    }, el('div', { class: 'celebration-card' },
      el('div', { class: 'stars' }, stars),
      el('div', { class: 'celebration-actions' },
        button('again', 'replay', 'Play again', options.onAgain, !options.onNext),
        options.onNext && button('next', 'next', 'Next level', options.onNext, true),
        button('home', 'home', 'Home', options.onHome, false))));

    parent.appendChild(overlay);
    KMG.effects.confetti(overlay);
    KMG.audio.play('fanfare');

    if (!reducedMotion()) {
      for (let n = 0; n < options.stars; n++) {
        window.setTimeout(() => KMG.audio.play('star'), 500 + n * STAR_GAP_MS);
      }
    }
  }

  KMG.celebrate = celebrate;
})(window.KMG);

// The way into the parent area: a button that must be held for 3 seconds, with a
// ring that fills while it is held, so children do not open it by accident.
(function (KMG) {
  'use strict';

  const { el, icon } = KMG.ui;

  const HOLD_MS = 3000;

  function button(onOpen) {
    const ring = el('span', {
      class: 'gate-ring',
      'aria-hidden': 'true',
      html: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" pathLength="100"/></svg>',
    });
    const hint = el('span', { class: 'gate-hint', role: 'status' });
    const node = el('button', {
      class: 'icon-btn gate',
      'data-action': 'parent-gate',
      'aria-label': 'Grown-ups: press and hold for 3 seconds',
    }, ring, icon('person'), hint);

    let timer = null;
    let holdingPointer = null;

    function stop() {
      window.clearTimeout(timer);
      timer = null;
      holdingPointer = null;
      node.classList.remove('gate-holding');
    }

    node.addEventListener('pointerdown', (event) => {
      if (holdingPointer !== null) return;
      holdingPointer = event.pointerId;
      hint.textContent = '';
      try {
        node.setPointerCapture(event.pointerId);
      } catch (error) {
        // Without capture, moving off the button just cancels the hold.
      }
      node.classList.add('gate-holding');
      timer = window.setTimeout(() => {
        stop();
        onOpen();
      }, HOLD_MS);
    });

    const release = (event) => {
      if (event.pointerId !== holdingPointer) return;
      stop();
      hint.textContent = 'Keep holding';
    };
    node.addEventListener('pointerup', release);
    node.addEventListener('pointercancel', release);

    // A long press would otherwise open the browser's own menu on a tablet.
    node.addEventListener('contextmenu', (event) => event.preventDefault());

    return node;
  }

  KMG.parentGate = { button, HOLD_MS };
})(window.KMG);

// Saving a small file to the device, and reading one back. Used for moving
// progress between devices, since nothing ever leaves the device by itself.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;

  // Largest file worth reading. A real progress file is well under 2 KB.
  const MAX_BYTES = 100 * 1024;

  function isIos() {
    const { userAgent, platform, maxTouchPoints } = window.navigator;
    return /iP(ad|hone|od)/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  }

  function shareOnIos(name, text) {
    try {
      if (!isIos() || !window.navigator.canShare) return false;
      const file = new window.File([text], name, { type: 'application/json' });
      if (!window.navigator.canShare({ files: [file] })) return false;
      window.navigator.share({ files: [file] }).catch(() => {});
      return true;
    } catch (error) {
      return false;
    }
  }

  // An installed app on iOS cannot use download links, so it goes through the
  // share sheet there. Everywhere else it is a normal download.
  function save(name, text) {
    if (shareOnIos(name, text)) return true;
    try {
      const url = window.URL.createObjectURL(new window.Blob([text], { type: 'application/json' }));
      const link = el('a', { href: url, download: name, style: 'display:none' });
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Calls back with the file's text, or null if it could not be read.
  function open(onText) {
    const input = el('input', {
      type: 'file',
      accept: '.json,application/json',
      style: 'display:none',
      'data-file-input': true,
      onchange() {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;
        if (file.size > MAX_BYTES) {
          onText(null);
          return;
        }
        const reader = new window.FileReader();
        reader.onload = () => onText(String(reader.result));
        reader.onerror = () => onText(null);
        reader.readAsText(file);
      },
    });
    document.body.appendChild(input);
    input.click();
  }

  KMG.fileTransfer = { save, open };
})(window.KMG);

// The eight UK coins as stylised SVG drawings. These are original shapes with
// the value on them: no monarch, no real reverse designs.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;

  // Diameters are the real ones, in mm. `value` is in pence, and is what ordering
  // uses: the 5p is the smallest coin but not the lowest value.
  const COINS = [
    { id: '1p', value: 1, mm: 20.3, shape: 'round', metal: 'copper', group: 'copper', spoken: 'one p' },
    { id: '2p', value: 2, mm: 25.9, shape: 'round', metal: 'copper', group: 'copper', spoken: 'two p' },
    { id: '5p', value: 5, mm: 18, shape: 'round', metal: 'silver', group: 'silver', spoken: 'five p' },
    { id: '10p', value: 10, mm: 24.5, shape: 'round', metal: 'silver', group: 'silver', spoken: 'ten p' },
    { id: '20p', value: 20, mm: 21.4, shape: 'heptagon', metal: 'silver', group: 'silver', spoken: 'twenty p' },
    { id: '50p', value: 50, mm: 27.3, shape: 'heptagon', metal: 'silver', group: 'silver', spoken: 'fifty p' },
    { id: '£1', value: 100, mm: 23.4, shape: 'dodecagon', metal: 'bimetal', group: 'bimetal', spoken: 'one pound' },
    { id: '£2', value: 200, mm: 28.4, shape: 'round', metal: 'bimetal', group: 'bimetal', spoken: 'two pounds' },
  ];

  const byId = (id) => COINS.find((coin) => coin.id === id);

  // Drawn on a 200 by 200 canvas around this centre.
  const CENTRE = 100;
  const WIDTH = 192;

  const round = (n) => Math.round(n * 1000) / 1000;

  function polygon(sides, radius, startDegrees) {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (startDegrees + (i * 360) / sides) * (Math.PI / 180);
      points.push({ x: CENTRE + radius * Math.cos(angle), y: CENTRE + radius * Math.sin(angle) });
    }
    return points;
  }

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // A Reuleaux polygon, the shape of the 20p and 50p. Each edge is an arc between
  // two neighbouring vertices, centred on the vertex opposite them, so its radius
  // is the distance from a vertex to its farthest vertices. That is also the
  // coin's width, which is the same in every direction.
  function reuleaux(sides, width) {
    const radius = width / (2 * Math.cos(Math.PI / (2 * sides)));
    const vertices = polygon(sides, radius, -90);
    const arcRadius = distance(vertices[0], vertices[(sides - 1) / 2]);
    const r = round(arcRadius);
    const start = `M${round(vertices[0].x)} ${round(vertices[0].y)}`;
    const arcs = vertices.map((_, i) => {
      const to = vertices[(i + 1) % sides];
      return `A${r} ${r} 0 0 1 ${round(to.x)} ${round(to.y)}`;
    });
    return { vertices, arcRadius, path: `${start} ${arcs.join(' ')} Z` };
  }

  // Rotated half a step, so a flat side sits at the top.
  function dodecagon(width) {
    const vertices = polygon(12, width / 2, -90 + 15);
    const [first, ...rest] = vertices.map((p) => `${round(p.x)} ${round(p.y)}`);
    return { vertices, path: `M${first} ${rest.map((p) => `L${p}`).join(' ')} Z` };
  }

  const circle = (r) => `M${CENTRE - r} ${CENTRE}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

  function outline(shape) {
    if (shape === 'heptagon') return reuleaux(7, WIDTH).path;
    if (shape === 'dodecagon') return dodecagon(WIDTH).path;
    return circle(WIDTH / 2);
  }

  // Gradients are defined once and shared by every coin on the page.
  function installDefs() {
    if (document.getElementById('kmg-coin-defs')) return;
    const shine = (id, light, mid, dark) => `
      <radialGradient id="${id}" cx="35%" cy="30%" r="80%">
        <stop offset="0" stop-color="${light}"/>
        <stop offset="0.55" stop-color="${mid}"/>
        <stop offset="1" stop-color="${dark}"/>
      </radialGradient>`;
    const holder = el('div', {
      id: 'kmg-coin-defs',
      'aria-hidden': 'true',
      style: 'position:absolute;width:0;height:0;overflow:hidden',
      html: `<svg width="0" height="0"><defs>
        ${shine('kmg-copper', '#f6cfae', '#dc9a68', '#ad6534')}
        ${shine('kmg-silver', '#ffffff', '#d9dee5', '#a2abb8')}
        ${shine('kmg-gold', '#fff3b8', '#ecc955', '#b98f22')}
        <linearGradient id="kmg-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
          <stop offset="1" stop-color="#3a2a14" stop-opacity="0.4"/>
        </linearGradient>
      </defs></svg>`,
    });
    document.body.appendChild(holder);
  }

  const TEXT_COLOURS = { copper: '#3b1c0a', silver: '#27303d', bimetal: '#27303d' };

  function fontSize(coin) {
    if (coin.metal === 'bimetal') return 74;
    if (coin.id === '5p') return 96;
    return coin.id.length === 2 ? 92 : 74;
  }

  function svg(coin) {
    const shape = outline(coin.shape);
    const outerFill = coin.metal === 'bimetal' ? 'kmg-gold' : `kmg-${coin.metal}`;
    // The raised rim is the same outline, smaller, with a light top-left edge.
    const rim = `<path d="${shape}" transform="translate(100 100) scale(0.87) translate(-100 -100)"
      fill="none" stroke="url(#kmg-rim)" stroke-width="5"/>`;
    const milled = coin.shape === 'round'
      ? '<circle cx="100" cy="100" r="93" fill="none" stroke="#000" stroke-opacity="0.13" stroke-width="5" stroke-dasharray="2 4"/>'
      : '';
    const centre = coin.metal === 'bimetal'
      ? '<circle cx="100" cy="100" r="63" fill="url(#kmg-silver)" stroke="url(#kmg-rim)" stroke-width="3"/>'
      : '';
    return `<svg class="coin-svg" viewBox="0 0 200 200" role="img" aria-label="${coin.id} coin">
      <path d="${shape}" fill="url(#${outerFill})" stroke="rgba(58,42,20,0.35)" stroke-width="2"/>
      ${milled}${rim}${centre}
      <text class="coin-value" x="100" y="100" dy="0.35em" text-anchor="middle"
        font-size="${fontSize(coin)}" fill="${TEXT_COLOURS[coin.metal]}">${coin.id}</text>
    </svg>`;
  }

  // Sizes keep the real proportions. The 5p is the smallest, so it sets the floor:
  // at this scale it is still a 64px target.
  const MIN_PX_PER_MM = 64 / 18;
  const MAX_PX_PER_MM = 4.8;

  function scaleFor(width, height) {
    return Math.min(MAX_PX_PER_MM, Math.max(MIN_PX_PER_MM, Math.min(width, height) / 170));
  }

  const sizeOf = (coin, pxPerMm) => Math.ceil(coin.mm * pxPerMm);

  function element(coin, size) {
    return el('div', { class: 'coin', 'data-coin': coin.id, style: `--size:${size}px` },
      el('div', { class: 'coin-face', html: svg(coin) }));
  }

  KMG.coins = {
    ALL: COINS,
    byId,
    installDefs,
    svg,
    element,
    scaleFor,
    sizeOf,
    geometry: { reuleaux, dodecagon, distance, WIDTH },
  };
})(window.KMG);

// What each level asks for. This file is plain logic with no drawing: `build`
// turns a level and the parent's settings into the contents of one round, so a
// new level is a new entry in LEVELS plus a build function.
(function (KMG) {
  'use strict';

  const { coins } = KMG;
  KMG.cs = KMG.cs || {};

  const GROUPS = [
    { id: 'copper', colour: '#f6d3b8' },
    { id: 'silver', colour: '#dfe5ec' },
    { id: 'bimetal', colour: '#fbe7a1' },
  ];

  const MINIMUM_COINS = 3;

  const LEVELS = [
    {
      id: 1,
      kind: 'sort',
      text: 'Sort by colour',
      spoken: 'Put each coin in the pot that matches its colour!',
    },
    {
      id: 2,
      kind: 'sort',
      text: 'Match the coins',
      spoken: 'Put each coin in its matching pot!',
      // Pots per stage: finishing a stage moves on to the next one.
      stages: [3, 4, 6, 8],
    },
    { id: 3, kind: 'find', text: 'Find the coin', spoken: 'Find the coin!' },
    {
      id: 4,
      kind: 'order',
      text: 'Smallest value to biggest',
      spoken: 'Put the coins in order, from the smallest value to the biggest!',
    },
  ];

  const levelById = (id) => LEVELS.find((level) => level.id === id);

  // A parent's choice, cleaned up. Too few coins and the levels do not work.
  function usableCoins(selected) {
    const valid = coins.ALL.map((coin) => coin.id).filter((id) => (selected || []).indexOf(id) !== -1);
    return valid.length >= MINIMUM_COINS ? valid : coins.ALL.map((coin) => coin.id);
  }

  // Shares the round out across the pots, so no pot sits unused.
  function dealAcross(pots, count, rng) {
    const cycles = pots.map((pot) => ({ order: rng.shuffle(pot.accepts), next: 0 }));
    const dealt = [];
    for (let i = 0; i < count; i++) {
      const cycle = cycles[i % cycles.length];
      dealt.push(cycle.order[cycle.next++ % cycle.order.length]);
    }
    return rng.shuffle(dealt);
  }

  function sortByColour({ selected, roundLength, rng }) {
    const groupPots = (ids) => GROUPS
      .map((group) => ({
        id: group.id,
        colour: group.colour,
        accepts: ids.filter((id) => coins.byId(id).group === group.id),
      }))
      .filter((pot) => pot.accepts.length > 0);

    // One colour alone would leave nothing to sort, so use every coin instead.
    let pots = groupPots(selected);
    if (pots.length < 2) pots = groupPots(coins.ALL.map((coin) => coin.id));
    return { kind: 'sort', pots, queue: dealAcross(pots, roundLength, rng), total: roundLength };
  }

  const potColour = (id) => GROUPS.find((group) => group.id === coins.byId(id).group).colour;

  function sortByCoin({ selected, roundLength, rng, stage }) {
    const { stages } = levelById(2);
    const wanted = stages[Math.min(stage, stages.length - 1)];
    const count = Math.min(wanted, selected.length);

    // The first coins are spread out by value, so they are easy to tell apart.
    const first = ['1p', '10p', '£1'].filter((id) => selected.indexOf(id) !== -1);
    const others = rng.shuffle(selected.filter((id) => first.indexOf(id) === -1));
    const chosen = first.concat(others).slice(0, count)
      .sort((a, b) => coins.byId(a).value - coins.byId(b).value);

    const pots = chosen.map((id) => ({ id, colour: potColour(id), accepts: [id] }));
    const total = Math.max(roundLength, count);
    return { kind: 'sort', pots, queue: dealAcross(pots, total, rng), total };
  }

  function findCoin({ selected, roundLength, rng, traySize }) {
    const prompts = [];
    let cycle = [];
    for (let i = 0; i < roundLength; i++) {
      if (!cycle.length) cycle = rng.shuffle(selected);
      // Never the same coin twice in a row.
      const previous = prompts.length ? prompts[prompts.length - 1].target : null;
      if (cycle[0] === previous) cycle.push(cycle.shift());
      const target = cycle.shift();
      const others = rng.shuffle(selected.filter((id) => id !== target)).slice(0, traySize - 1);
      prompts.push({ target, tray: rng.shuffle(others.concat(target)) });
    }
    return { kind: 'find', prompts, total: roundLength };
  }

  // By value, never by size: the 5p is the smallest coin but the third lowest value.
  function orderByValue({ selected, rng }) {
    const slots = selected.slice().sort((a, b) => coins.byId(a).value - coins.byId(b).value);
    let queue = rng.shuffle(slots);
    while (queue.join() === slots.join()) queue = rng.shuffle(slots);
    return { kind: 'order', slots, queue, total: slots.length };
  }

  const BUILDERS = { 1: sortByColour, 2: sortByCoin, 3: findCoin, 4: orderByValue };

  // traySize is how many coins fit side by side on this screen.
  function build(levelId, { selected, roundLength, rng, stage, traySize }) {
    return BUILDERS[levelId]({ selected: usableCoins(selected), roundLength, rng, stage: stage || 0, traySize });
  }

  // 0 mistakes is 3 stars, 1 or 2 is 2 stars, and 3 or more is 1 star.
  const starsFor = (mistakes) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);

  KMG.cs.levels = { LEVELS, levelById, usableCoins, build, starsFor, MINIMUM_COINS };
})(window.KMG);

// Coin Sorter's saved data: stars, unlocked levels, mistakes per coin and the
// parent's settings. Saved through KMG.storage, so it can never throw.
(function (KMG) {
  'use strict';

  const { coins, cs } = KMG;
  const KEY = 'coin-sorter';
  const VERSION = 1;

  function defaults() {
    return {
      version: VERSION,
      unlocked: 1,
      levels: {},
      mistakes: {},
      coins: coins.ALL.map((coin) => coin.id),
      roundLength: 8,
    };
  }

  const load = () => Object.assign(defaults(), KMG.storage.load(KEY, null));
  const save = (data) => KMG.storage.save(KEY, data);

  function levelRecord(data, levelId) {
    return data.levels[levelId] || { stars: 0, plays: 0, stage: 0 };
  }

  // Keeps the best stars, and finishing a round unlocks the next level.
  function recordRound(levelId, { stars, mistakes, stage, lastStage }) {
    const data = load();
    const record = levelRecord(data, levelId);
    data.levels[levelId] = {
      stars: Math.max(record.stars, stars),
      plays: record.plays + 1,
      stage: Math.max(record.stage, Math.min(stage + 1, lastStage)),
    };
    data.unlocked = Math.min(cs.levels.LEVELS.length, Math.max(data.unlocked, levelId + 1));
    Object.entries(mistakes).forEach(([id, count]) => {
      data.mistakes[id] = (data.mistakes[id] || 0) + count;
    });
    save(data);
    return data;
  }

  // Clears what the child has done, and keeps the parent's settings.
  function reset() {
    const data = load();
    const fresh = defaults();
    save(Object.assign(fresh, { coins: data.coins, roundLength: data.roundLength }));
  }

  // The coins with the most mistakes, worst first.
  function confused(data, limit) {
    return Object.entries(data.mistakes)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  const ROUND_LENGTHS = [5, 8, 12];

  function exportText() {
    return JSON.stringify({
      app: 'kids-money-games',
      game: KEY,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      data: load(),
    }, null, 2);
  }

  const isCount = (value) => Number.isInteger(value) && value >= 0;
  const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

  // Checks every field and rebuilds the data from what was checked, so nothing
  // unexpected in a file can reach the game. Returns null if anything is wrong.
  function parseImport(text) {
    let file;
    try {
      file = JSON.parse(text);
    } catch (error) {
      return null;
    }
    if (!isPlainObject(file) || file.app !== 'kids-money-games' || file.game !== KEY) return null;
    if (file.version !== VERSION || !isPlainObject(file.data)) return null;

    const { unlocked, levels, mistakes, coins: chosen, roundLength } = file.data;
    const levelCount = cs.levels.LEVELS.length;
    if (!Number.isInteger(unlocked) || unlocked < 1 || unlocked > levelCount) return null;
    if (!isPlainObject(levels) || !isPlainObject(mistakes) || !Array.isArray(chosen)) return null;
    if (ROUND_LENGTHS.indexOf(roundLength) === -1) return null;

    const clean = defaults();
    clean.unlocked = unlocked;
    clean.roundLength = roundLength;

    for (const [id, record] of Object.entries(levels)) {
      const level = cs.levels.levelById(Number(id));
      if (!level || !isPlainObject(record)) return null;
      const lastStage = level.stages ? level.stages.length - 1 : 0;
      if (!isCount(record.stars) || record.stars > 3 || !isCount(record.plays)) return null;
      if (!isCount(record.stage) || record.stage > lastStage) return null;
      clean.levels[id] = { stars: record.stars, plays: record.plays, stage: record.stage };
    }

    for (const [id, count] of Object.entries(mistakes)) {
      if (!coins.byId(id) || !isCount(count)) return null;
      clean.mistakes[id] = count;
    }

    if (chosen.length < cs.levels.MINIMUM_COINS || new Set(chosen).size !== chosen.length) return null;
    if (!chosen.every((id) => coins.byId(id))) return null;
    clean.coins = chosen.slice();

    return clean;
  }

  cs.progress = {
    load,
    save,
    defaults,
    levelRecord,
    recordRound,
    reset,
    confused,
    exportText,
    parseImport,
    ROUND_LENGTHS,
    VERSION,
  };
})(window.KMG);

// The play screen. Each kind of level supplies its zones (where coins can go)
// and what happens after a landing; dragging and feedback are shared here.
(function (KMG) {
  'use strict';

  const { el, show, icon, iconButton, muteButton } = KMG.ui;
  const { coins, audio, speech, drag, effects, cs } = KMG;

  // How far outside a pot a coin can be dropped and still count.
  const FORGIVING_PX = 44;
  const LAND_MS = 460;
  const WRONG_MS = 340;
  const RETURN_MS = 260;
  const GAP = 16;
  const MIN_SLOT = 64;
  // Room for the number and step below a slot.
  const SLOT_EXTRA = 60;

  const mini = (id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) });

  // How many coins fit side by side without touching.
  const traySlots = () => (window.innerWidth < 480 ? 3 : 4);

  // Finds the layout that makes the items largest in the space available. Empty
  // cells and extra rows count against a layout, and ties go to the wider one:
  // three pots sit in a row, so a coin is not dragged past the wrong pots to
  // reach the far one.
  function fitGrid(count, width, height, gap, tallness, largest) {
    let best = { size: 0, columns: 1, score: 0 };
    for (let columns = 1; columns <= count; columns++) {
      const rows = Math.ceil(count / columns);
      const across = (width - gap * (columns - 1)) / columns;
      const down = (height - gap * (rows - 1)) / rows / tallness;
      const size = Math.min(across, down, largest);
      const score = size * (count / (rows * columns)) * (1 - 0.12 * (rows - 1));
      if (score >= best.score) best = { size, columns, score };
    }
    return best;
  }

  function potElement(pot) {
    const node = el('div', {
      class: 'pot',
      'data-pot': pot.id,
      'data-accepts': pot.accepts.join(' '),
      style: `--pot-colour:${pot.colour}`,
    }, el('div', { class: 'pot-mouth' }), el('div', { class: 'pot-body' }, el('div', { class: 'pot-label' }, pot.label.map(mini))));
    return node;
  }

  // The tray has fixed slots, and a taken coin's slot stays empty until it is
  // refilled from the queue. Nothing moves when a coin leaves, so the board never
  // shifts under a child who is halfway through a drag.
  function fillTray(tray, coinIds, slotCount, api) {
    const queue = coinIds.slice();
    const refill = (slot) => {
      if (queue.length) slot.appendChild(api.makeCoin(queue.shift(), 'pop'));
    };
    for (let i = 0; i < slotCount; i++) {
      const slot = el('div', { class: 'tray-slot' });
      if (slotCount === coinIds.length) {
        slot.dataset.slotFor = coinIds[i];
        slot.style.setProperty('--size', `${api.coinSize(coinIds[i])}px`);
      }
      tray.appendChild(slot);
      refill(slot);
    }
    return refill;
  }

  function setupSort(round, screen, api) {
    const zonesArea = screen.zones;
    const potRow = el('div', { class: 'pots' });
    zonesArea.appendChild(potRow);
    const pots = round.pots.map((pot) => {
      const label = pot.accepts.slice(0, 4);
      const node = potElement(Object.assign({ label }, pot));
      potRow.appendChild(node);
      return { node, mouth: node.querySelector('.pot-mouth'), accepts: pot.accepts };
    });

    const refill = fillTray(screen.tray, round.queue, traySlots(), api);

    return {
      zones: pots,
      accepts: (zone, id) => zone.accepts.indexOf(id) !== -1,
      afterLanding(node) {
        const slot = node.parentNode;
        node.remove();
        api.counted();
        refill(slot);
      },
      layout() {
        const area = zonesArea.getBoundingClientRect();
        const fit = fitGrid(pots.length, area.width, area.height, GAP, 1.06, 230);
        const size = Math.floor(fit.size);
        zonesArea.style.setProperty('--pot', `${size}px`);
        // Wrapping at this width centres a short last row.
        zonesArea.style.setProperty('--row-width', `${fit.columns * size + (fit.columns - 1) * GAP}px`);
      },
    };
  }

  // One pot and one coin to find. Many players cannot read yet, so a large picture
  // of the coin sits above the pot, and tapping it says the prompt again.
  function setupFind(round, screen, api) {
    const picture = el('button', {
      class: 'target',
      'data-action': 'repeat-target',
      'aria-label': 'Hear it again',
      onclick: () => api.speak(),
    });
    const pot = potElement({ id: 'find', accepts: [], colour: '#d6e6f7', label: [] });
    const area = el('div', { class: 'find-area' }, picture, pot);
    screen.zones.appendChild(area);

    const zone = { node: pot, mouth: pot.querySelector('.pot-mouth') };
    let index = 0;
    let target = null;

    function showPrompt() {
      const prompt = round.prompts[index];
      target = prompt.target;
      const coin = coins.byId(target);
      pot.setAttribute('data-accepts', target);
      picture.setAttribute('data-target', target);
      picture.innerHTML = coins.svg(coin);
      picture.appendChild(el('span', { class: 'target-speaker' }, icon('soundOn')));
      api.setPrompt(`Put the ${coin.id} in the pot!`, `Put the ${coin.spoken} in the pot!`);
      screen.tray.textContent = '';
      prompt.tray.forEach((id) => {
        screen.tray.appendChild(el('div', { class: 'tray-slot' }, api.makeCoin(id, 'pop')));
      });
    }
    showPrompt();

    return {
      zones: [zone],
      accepts: (_, id) => id === target,
      // A wrong coin here means the child did not recognise the one asked for.
      blame: () => target,
      onCorrect() {
        screen.tray.querySelectorAll('.coin').forEach((node) => node.classList.add('busy'));
      },
      afterLanding() {
        const finished = api.counted();
        if (finished) return;
        index++;
        showPrompt();
        api.speak();
      },
      layout() {
        const box = screen.zones.getBoundingClientRect();
        const sideways = box.height < 340;
        const target = Math.floor(Math.min(box.height * (sideways ? 0.8 : 0.38), 170));
        const room = sideways ? box.height : box.height - target - GAP;
        const size = Math.floor(Math.min(room / 1.06, box.width - (sideways ? target + GAP : 0), 230));
        area.classList.toggle('find-sideways', sideways);
        area.style.setProperty('--target', `${target}px`);
        area.style.setProperty('--pot', `${size}px`);
      },
    };
  }

  // A numbered row of slots. The steps under them rise left to right as a cue.
  function setupOrder(round, screen, api) {
    const row = el('div', { class: 'slots' });
    screen.zones.appendChild(row);
    const zones = round.slots.map((id, i) => {
      const hold = el('div', { class: 'slot-hold' });
      const node = el('div', {
        class: 'slot',
        'data-slot': i + 1,
        'data-accepts': id,
        style: `--step:${(i + 1) / round.slots.length}`,
      }, hold, el('span', { class: 'slot-number' }, String(i + 1)));
      row.appendChild(node);
      return { node, mouth: hold, id };
    });

    // All the coins at once if they fit in two rows on a roomy screen. Otherwise
    // a few at a time, because on a phone the slots need the height.
    const room = window.innerWidth - 44;
    const widths = round.queue.reduce((sum, id) => sum + api.coinSize(id) + 8, 0);
    const showAll = window.innerHeight >= 700 && widths <= room * 2;
    const biggest = Math.max(...round.queue.map(api.coinSize));
    const slotCount = showAll ? round.queue.length : Math.max(3, Math.min(5, Math.floor(room / (biggest + 8))));
    screen.tray.classList.add(showAll ? 'tray-all' : 'tray-few');
    const refill = fillTray(screen.tray, round.queue, slotCount, api);

    return {
      zones,
      accepts: (zone, id) => zone.id === id,
      afterLanding(node, id, zone) {
        const slot = node.parentNode;
        node.remove();
        refill(slot);
        zone.mouth.appendChild(mini(id));
        zone.node.classList.add('slot-filled');
        zone.node.removeAttribute('data-accepts');
        // A filled slot stops being a target, so dropping on it is not a mistake.
        zones.splice(zones.indexOf(zone), 1);
        api.counted();
      },
      layout() {
        const count = round.slots.length;
        const box = screen.zones.getBoundingClientRect();
        // One row while each slot can stay a 64px target, otherwise two rows.
        const oneRow = (box.width - GAP * (count - 1)) / count >= MIN_SLOT;
        const columns = oneRow ? count : Math.ceil(count / 2);
        const rows = Math.ceil(count / columns);
        const across = (box.width - GAP * (columns - 1)) / columns;
        const down = (box.height - GAP * (rows - 1)) / rows - SLOT_EXTRA;
        const size = Math.floor(Math.min(across, down, 120));
        row.style.setProperty('--slot', `${size}px`);
        row.style.gridTemplateColumns = `repeat(${columns}, var(--slot))`;
      },
    };
  }

  const KINDS = { sort: setupSort, find: setupFind, order: setupOrder };

  function play(levelId, context) {
    drag.reset();
    const level = cs.levels.levelById(levelId);
    const saved = cs.progress.load();
    const stage = context.stage === undefined ? cs.progress.levelRecord(saved, levelId).stage : context.stage;
    const round = cs.levels.build(levelId, {
      selected: saved.coins,
      roundLength: saved.roundLength,
      rng: context.rng,
      stage,
      traySize: traySlots(),
    });

    let alive = true;
    let placed = 0;
    let mistakes = 0;
    const mistakesByCoin = {};

    const pips = el('div', { class: 'pips', 'aria-hidden': 'true' },
      Array.from({ length: round.total }, () => el('span', { class: 'pip' })));

    const promptText = el('span', { class: 'prompt-text' }, level.text);
    let spokenPrompt = level.spoken;
    const speakPrompt = () => speech.say(spokenPrompt);

    const top = el('header', { class: 'play-top' },
      iconButton('back', 'Back', () => context.home(), 'back'),
      pips,
      muteButton());
    const prompt = el('button', { class: 'prompt', 'data-action': 'repeat', onclick: speakPrompt }, promptText);
    const zones = el('div', { class: `zones zones-${round.kind}` });
    const tray = el('div', { class: `tray tray-${round.kind}` });
    const main = el('main', {
      class: 'play',
      'data-screen': 'play',
      'data-level': levelId,
      'data-kind': round.kind,
    }, top, prompt, zones, tray);

    const coinSize = (coin) => coins.sizeOf(coin, coins.scaleFor(window.innerWidth, window.innerHeight));

    function later(callback, ms) {
      window.setTimeout(() => {
        if (alive) callback();
      }, ms);
    }

    function nearestZone(id, x, y) {
      const inReach = kind.zones.filter((zone) => {
        const box = zone.node.getBoundingClientRect();
        return x >= box.left - FORGIVING_PX && x <= box.right + FORGIVING_PX &&
          y >= box.top - FORGIVING_PX && y <= box.bottom + FORGIVING_PX;
      });
      if (!inReach.length) return null;
      // A generous rule for small hands: if the right pot is in reach, it wins.
      const right = inReach.find((zone) => kind.accepts(zone, id));
      if (right) return right;
      const distanceTo = (zone) => {
        const box = zone.node.getBoundingClientRect();
        return Math.hypot(box.left + box.width / 2 - x, box.top + box.height / 2 - y);
      };
      return inReach.slice().sort((a, b) => distanceTo(a) - distanceTo(b))[0];
    }

    function returnToTray(node) {
      node.classList.add('returning');
      node.style.transform = '';
      later(() => {
        node.classList.remove('returning', 'busy');
      }, RETURN_MS);
    }

    function wrongDrop(node, id) {
      mistakes++;
      const blamed = kind.blame ? kind.blame(id) : id;
      mistakesByCoin[blamed] = (mistakesByCoin[blamed] || 0) + 1;
      audio.play('wrong');
      node.classList.add('wobble');
      later(() => {
        node.classList.remove('wobble');
        returnToTray(node);
      }, WRONG_MS);
    }

    function correctDrop(node, id, zone) {
      const from = node.getBoundingClientRect();
      const to = (zone.mouth || zone.node).getBoundingClientRect();
      const moved = new DOMMatrixReadOnly(window.getComputedStyle(node).transform);
      const x = moved.m41 + to.left + to.width / 2 - (from.left + from.width / 2);
      const y = moved.m42 + to.top + to.height / 2 - (from.top + from.height / 2);
      node.classList.add('landing');
      node.style.transform = `translate(${x}px, ${y}px)`;
      if (kind.onCorrect) kind.onCorrect();
      audio.play('correct');
      effects.sparkle(to.left + to.width / 2, to.top + to.height / 2);
      later(() => kind.afterLanding(node, id, zone), LAND_MS);
    }

    function finishRound() {
      const stars = cs.levels.starsFor(mistakes);
      const lastStage = level.stages ? level.stages.length - 1 : 0;
      cs.progress.recordRound(levelId, { stars, mistakes: mistakesByCoin, stage, lastStage });

      const again = () => play(levelId, Object.assign({}, context, { stage }));
      let next = null;
      if (stage < lastStage) next = () => play(levelId, Object.assign({}, context, { stage: stage + 1 }));
      else if (cs.levels.levelById(levelId + 1)) {
        next = () => play(levelId + 1, Object.assign({}, context, { stage: undefined }));
      }
      KMG.celebrate(main, { stars, onAgain: again, onNext: next, onHome: () => context.home() });
    }

    const api = {
      coinSize: (id) => coinSize(coins.byId(id)),
      makeCoin(id, entrance) {
        const coin = coins.byId(id);
        const node = coins.element(coin, coinSize(coin));
        if (entrance) node.classList.add(entrance);
        const dropped = () => {
          const box = node.getBoundingClientRect();
          node.classList.remove('dragging');
          node.classList.add('busy');
          const zone = nearestZone(id, box.left + box.width / 2, box.top + box.height / 2);
          if (!zone) returnToTray(node);
          else if (kind.accepts(zone, id)) correctDrop(node, id, zone);
          else wrongDrop(node, id);
        };
        drag.draggable(node, {
          canStart: () => alive && !node.classList.contains('busy'),
          onStart() {
            audio.play('pickup');
            node.classList.add('dragging');
          },
          onEnd: dropped,
          onCancel() {
            node.classList.remove('dragging');
            node.classList.add('busy');
            returnToTray(node);
          },
        });
        return node;
      },
      // Counts a placed coin, and says whether that finished the round.
      counted() {
        placed++;
        Array.from(pips.children).forEach((pip, i) => pip.classList.toggle('pip-done', i < placed));
        const finished = placed === round.total;
        if (finished) finishRound();
        return finished;
      },
      setPrompt(text, spoken) {
        promptText.textContent = text;
        spokenPrompt = spoken;
      },
      speak: speakPrompt,
    };

    const kind = KINDS[round.kind](round, { zones, tray, prompt: promptText }, api);

    const layout = () => {
      main.querySelectorAll('.coin').forEach((node) => {
        node.style.setProperty('--size', `${api.coinSize(node.dataset.coin)}px`);
      });
      main.querySelectorAll('[data-slot-for]').forEach((node) => {
        node.style.setProperty('--size', `${api.coinSize(node.dataset.slotFor)}px`);
      });
      // Sized for the largest coin, so the tray keeps its height as it empties.
      main.style.setProperty('--coin-max', `${api.coinSize('£2')}px`);
      kind.layout();
    };
    window.addEventListener('resize', layout);
    main.onleave = () => {
      alive = false;
      drag.reset();
      speech.stop();
      window.removeEventListener('resize', layout);
    };

    show(main);
    layout();
    speakPrompt();
  }

  cs.play = play;
})(window.KMG);

// The parent area: settings, progress, and moving progress between devices.
// This screen is for adults, so unlike the child screens it uses words.
(function (KMG) {
  'use strict';

  const { el, show, icon } = KMG.ui;
  const { audio, coins, cs, fileTransfer } = KMG;

  const FILE_NAME = 'coin-sorter-progress.json';

  function section(title, ...children) {
    return el('section', { class: 'parent-card' }, el('h2', {}, title), children);
  }

  function toggle(label, setting, isOn, onChange) {
    const button = el('button', {
      class: 'switch',
      role: 'switch',
      'aria-checked': String(isOn),
      'data-setting': setting,
      onclick() {
        const on = button.getAttribute('aria-checked') !== 'true';
        button.setAttribute('aria-checked', String(on));
        onChange(on);
      },
    }, el('span', { class: 'switch-label' }, label), el('span', { class: 'switch-track' }, el('span', { class: 'switch-thumb' })));
    return button;
  }

  function soundSection() {
    const { sound, voice } = audio.settings();
    return section('Sound',
      toggle('Sound effects', 'sound', sound, (on) => audio.saveSettings({ sound: on })),
      toggle('Spoken prompts', 'voice', voice, (on) => audio.saveSettings({ voice: on })));
  }

  function coinSection(data) {
    const message = el('p', { class: 'parent-note', role: 'status' });
    const buttons = coins.ALL.map((coin) => {
      const button = el('button', {
        class: 'coin-choice',
        'data-coin-choice': coin.id,
        'aria-pressed': String(data.coins.indexOf(coin.id) !== -1),
        'aria-label': `${coin.id} coin`,
        html: coins.svg(coin),
        onclick() {
          const saved = cs.progress.load();
          const position = saved.coins.indexOf(coin.id);
          if (position !== -1 && saved.coins.length <= cs.levels.MINIMUM_COINS) {
            message.textContent = `Please keep at least ${cs.levels.MINIMUM_COINS} coins switched on.`;
            return;
          }
          message.textContent = '';
          if (position === -1) saved.coins.push(coin.id);
          else saved.coins.splice(position, 1);
          cs.progress.save(saved);
          button.setAttribute('aria-pressed', String(position === -1));
        },
      });
      return button;
    });
    return section('Coins in the game', el('div', { class: 'coin-choices' }, buttons), message);
  }

  function roundSection(data) {
    const buttons = cs.progress.ROUND_LENGTHS.map((length) => el('button', {
      class: 'btn round-choice',
      'data-round': length,
      'aria-pressed': String(data.roundLength === length),
      onclick() {
        const saved = cs.progress.load();
        saved.roundLength = length;
        cs.progress.save(saved);
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other.dataset.round === String(length))));
      },
    }, `${length} coins`));
    return section('Round length', el('div', { class: 'round-choices' }, buttons));
  }

  function progressSection(data) {
    const rows = cs.levels.LEVELS.map((level) => {
      const record = cs.progress.levelRecord(data, level.id);
      const stars = [1, 2, 3].map((n) => el('span', { class: `star ${n <= record.stars ? 'star-won' : 'star-empty'}` }, icon('star')));
      const played = record.plays === 1 ? 'Played once' : `Played ${record.plays} times`;
      return el('li', { class: 'progress-row', 'data-progress-level': level.id, 'data-stars': record.stars },
        el('span', {}, `Level ${level.id}: ${level.text}`),
        el('span', { class: 'stars stars-small', 'aria-label': `${record.stars} of 3 stars` }, stars),
        el('span', { class: 'parent-note' }, played));
    });

    const confused = cs.progress.confused(data, 3);
    const practise = confused.length
      ? el('ul', { class: 'confused' }, confused.map(([id, count]) => el('li', { 'data-confused': id },
        el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) }),
        count === 1 ? '1 mistake' : `${count} mistakes`)))
      : el('p', { class: 'parent-note', 'data-confused-none': true }, 'No mistakes yet.');

    return section('Progress', el('ul', { class: 'progress-list' }, rows), el('h3', {}, 'Coins to practise'), practise);
  }

  function transferSection(refresh) {
    const message = el('p', { class: 'parent-note', role: 'status', 'data-transfer-message': true });
    const say = (text) => {
      message.textContent = text;
    };
    const importFile = () => fileTransfer.open((text) => {
      const data = text === null ? null : cs.progress.parseImport(text);
      if (!data) {
        say("That file doesn't look like Coin Sorter progress, so nothing has been changed.");
        return;
      }
      cs.progress.save(data);
      refresh('Progress imported.');
    });
    const exportFile = () => {
      const saved = fileTransfer.save(FILE_NAME, cs.progress.exportText());
      say(saved ? 'Progress exported.' : 'Sorry, this device could not save the file.');
    };

    return {
      node: section('Move to another device',
        el('p', { class: 'parent-note' }, 'Progress stays on this device. To move it, export a small file here and import it on the other device.'),
        el('div', { class: 'parent-actions' },
          el('button', { class: 'btn', 'data-action': 'export', onclick: exportFile }, 'Export progress'),
          el('button', { class: 'btn', 'data-action': 'import', onclick: importFile }, 'Import progress')),
        message),
      say,
    };
  }

  function resetSection(refresh) {
    const area = el('div', { class: 'parent-actions' });
    const ask = () => {
      area.textContent = '';
      area.append(
        el('p', { class: 'parent-note' }, 'Remove all stars and unlocked levels? This cannot be undone.'),
        el('button', {
          class: 'btn btn-danger',
          'data-action': 'reset-yes',
          onclick() {
            cs.progress.reset();
            refresh('Progress reset.');
          },
        }, 'Yes, reset'),
        el('button', { class: 'btn', 'data-action': 'reset-no', onclick: start }, 'Keep progress'));
    };
    const start = () => {
      area.textContent = '';
      area.append(el('button', { class: 'btn', 'data-action': 'reset', onclick: ask }, 'Reset progress'));
    };
    start();
    return section('Start again', area);
  }

  function parent(context, notice) {
    const refresh = (message) => parent(context, message);
    const data = cs.progress.load();
    const transfer = transferSection(refresh);
    if (notice) transfer.say(notice);

    show(el('main', { class: 'parent', 'data-screen': 'parent' },
      el('header', { class: 'parent-top' },
        el('h1', {}, 'Grown-ups'),
        el('button', { class: 'btn btn-primary', 'data-action': 'close-parent', onclick: () => context.home() }, 'Done')),
      soundSection(),
      coinSection(data),
      roundSection(data),
      progressSection(data),
      transfer.node,
      resetSection(refresh)));
  }

  cs.parent = parent;
})(window.KMG);

// Coin Sorter's home screen: pick a level.
(function (KMG) {
  'use strict';

  const { el, show, icon, iconButton, muteButton } = KMG.ui;
  const { coins, cs } = KMG;

  const mini = (id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) });

  // Pictures rather than words, because many players cannot read yet.
  const LEVEL_ART = { 1: ['1p', '10p', '£2'], 2: ['1p', '£1'], 3: ['20p'], 4: ['1p', '5p', '10p'] };

  function levelCard(level, data, context) {
    const locked = level.id > data.unlocked;
    const record = cs.progress.levelRecord(data, level.id);
    const stars = [1, 2, 3].map((n) => el('span', { class: `star ${n <= record.stars ? 'star-won' : 'star-empty'}` }, icon('star')));
    const card = el('button', {
      class: `level-card ${locked ? 'level-locked' : ''}`,
      'data-level': level.id,
      'data-stars': record.stars,
      'data-locked': String(locked),
      'aria-label': `Level ${level.id}${locked ? ', locked' : ''}`,
      onclick() {
        if (!locked) {
          cs.play(level.id, context);
          return;
        }
        card.classList.remove('wobble');
        void card.offsetWidth;
        card.classList.add('wobble');
      },
    },
    el('span', { class: 'level-number' }, String(level.id)),
    el('span', { class: 'level-art' }, LEVEL_ART[level.id].map(mini)),
    el('span', { class: 'stars stars-small' }, stars),
    locked && el('span', { class: 'level-lock' }, icon('lock')));
    return card;
  }

  // ?debug=1 adds a bar for jumping to any level and resetting everything.
  function debugBar(context) {
    if (!KMG.debug.on) return null;
    const jump = cs.levels.LEVELS.map((level) => el('button', {
      class: 'btn',
      'data-debug-level': level.id,
      onclick: () => cs.play(level.id, context),
    }, `L${level.id}`));
    const reset = el('button', {
      class: 'btn',
      'data-debug-reset': true,
      onclick() {
        KMG.storage.clearAll();
        home(context);
      },
    }, 'Reset');
    return el('div', { class: 'debug-bar' }, jump, reset);
  }

  function home(context) {
    const data = cs.progress.load();
    show(el('main', { class: 'cs-home', 'data-screen': 'game-home' },
      el('header', { class: 'home-top' },
        el('div', { class: 'home-left' },
          context.exit && iconButton('home', 'All games', context.exit, 'exit'),
          KMG.parentGate.button(() => cs.parent(context))),
        el('h1', { class: 'home-title' }, 'Coin Sorter'),
        el('div', { class: 'home-right' }, muteButton())),
      el('div', { class: 'level-grid' },
        cs.levels.LEVELS.map((level) => levelCard(level, data, context))),
      debugBar(context)));
  }

  cs.home = home;
})(window.KMG);

// Coin Sorter's entry point: registers the game with the hub or standalone boot.
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { coins, cs } = KMG;

  // ?debug=1&gallery=1 shows every coin at its real proportions.
  function gallery() {
    const scale = coins.scaleFor(window.innerWidth, window.innerHeight);
    show(el('main', { class: 'cs-gallery', 'data-screen': 'gallery' },
      coins.ALL.map((coin) => coins.element(coin, coins.sizeOf(coin, scale)))));
  }

  KMG.registerGame('coin-sorter', {
    // Called once before any of this game's art is drawn.
    prepare: () => coins.installDefs(),

    // The picture on the hub tile.
    art: () => ['1p', '20p', '£2'].map((id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) })),

    open(exit) {
      coins.installDefs();
      const context = { exit, rng: KMG.rng.create(KMG.debug.seed) };
      context.home = () => cs.home(context);

      if (KMG.debug.flag('gallery')) gallery();
      else if (KMG.debug.level) {
        const stage = KMG.debug.stage === null ? undefined : KMG.debug.stage;
        cs.play(KMG.debug.level, Object.assign({}, context, { stage }));
      } else context.home();
    },
  });
})(window.KMG);

// SHA-256 in plain JavaScript. crypto.subtle only exists on HTTPS and localhost,
// and code entry must also work on a LAN address (http://192.168.x.x) when
// testing on a real tablet.
(function (KMG) {
  'use strict';

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const rotate = (x, n) => (x >>> n) | (x << (32 - n));

  // The message, then 0x80, then zeros, then its length in bits as the last 8 bytes.
  function pad(bytes) {
    const blocks = Math.ceil((bytes.length + 9) / 64);
    const padded = new Uint8Array(blocks * 64);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor((bytes.length * 8) / 4294967296));
    view.setUint32(padded.length - 4, (bytes.length * 8) >>> 0);
    return view;
  }

  function sha256(text) {
    const message = pad(new TextEncoder().encode(text));
    const hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Array(64);

    for (let block = 0; block < message.byteLength; block += 64) {
      for (let t = 0; t < 16; t++) w[t] = message.getUint32(block + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rotate(w[t - 15], 7) ^ rotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotate(w[t - 2], 17) ^ rotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }

      let [a, b, c, d, e, f, g, h] = hash;
      for (let t = 0; t < 64; t++) {
        const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
        const choice = (e & f) ^ (~e & g);
        const temp1 = (h + s1 + choice + K[t] + w[t]) | 0;
        const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0 + majority) | 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((value, i) => {
        hash[i] = (hash[i] + value) | 0;
      });
    }

    return hash.map((word) => (word >>> 0).toString(16).padStart(8, '0')).join('');
  }

  KMG.sha256 = sha256;
})(window.KMG);

// Access codes, hosted build only. Codes are stored as SHA-256 hashes of the
// prefix and the 10-character body, and each game has its own list, so the hub
// can unlock games one at a time. This stops casual sharing, not a determined
// person: everything needed to check a code is in the page. See DECISIONS.md.
(function (KMG) {
  'use strict';

  const BODY_LENGTH = 10;
  const { access } = KMG.build;

  // Trimmed and uppercased, with spaces and dashes ignored.
  const normalise = (text) => String(text).toUpperCase().replace(/[\s-]/g, '');

  const required = () => access.requireAccessCode;
  const unlockedGames = () => KMG.storage.load('access', {});

  const isUnlocked = (gameId) => !required() || unlockedGames()[gameId] === true;

  function unlock(gameId) {
    KMG.storage.save('access', Object.assign(unlockedGames(), { [gameId]: true }));
  }

  // The game this code opens, or null. The prefix is optional when typing.
  function gameForCode(text) {
    const code = normalise(text);
    const match = KMG.build.games.find((game) => {
      const body = code.indexOf(game.prefix) === 0 && code.length === game.prefix.length + BODY_LENGTH
        ? code.slice(game.prefix.length)
        : code;
      if (body.length !== BODY_LENGTH) return false;
      return (access.hashes[game.id] || []).indexOf(KMG.sha256(game.prefix + body)) !== -1;
    });
    return match ? match.id : null;
  }

  KMG.access = { normalise, required, isUnlocked, unlock, gameForCode };
})(window.KMG);

// Offline support and the install tip, hosted build only. Service workers need
// HTTPS or localhost, so on a LAN address the game still works, just not offline.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const DISMISSED = 'install-tip-dismissed';

  function registerWorker() {
    try {
      if (!('serviceWorker' in window.navigator)) return;
      window.navigator.serviceWorker.register('sw.js').catch(() => {});
    } catch (error) {
      // No offline mode on this device, and the game carries on.
    }
  }

  function matches(query) {
    try {
      return window.matchMedia(query).matches;
    } catch (error) {
      return false;
    }
  }

  const isInstalled = () => matches('(display-mode: standalone)') || window.navigator.standalone === true;

  function isIos() {
    const { userAgent, platform, maxTouchPoints } = window.navigator;
    return /iP(ad|hone|od)/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  }

  // Shown on tablets and phones only, and only until it is dismissed.
  function tip() {
    const wanted = matches('(pointer: coarse)') || KMG.debug.flag('tip');
    if (!wanted || isInstalled() || KMG.storage.load(DISMISSED, false)) return null;

    const how = isIos()
      ? 'To install, tap Share, then Add to Home Screen.'
      : 'To install, open the browser menu, then choose Install app.';
    const node = el('aside', { class: 'install-tip', 'data-install-tip': true },
      el('span', {}, how),
      el('button', {
        class: 'btn',
        'data-action': 'dismiss-tip',
        onclick() {
          KMG.storage.save(DISMISSED, true);
          node.remove();
        },
      }, 'Got it'));
    return node;
  }

  KMG.install = { registerWorker, tip };
})(window.KMG);

// The hosted home screen: one tile per game, and the access-code screen.
(function (KMG) {
  'use strict';

  const { el, show, icon, iconButton } = KMG.ui;
  const { access } = KMG;

  const allLocked = () => KMG.build.games.every((game) => !access.isUnlocked(game.id));

  function codeScreen() {
    const input = el('input', {
      class: 'code-input',
      type: 'text',
      'data-code-input': true,
      'aria-label': 'Access code',
      placeholder: 'COIN-XXXXX-XXXXX',
      autocomplete: 'off',
      autocapitalize: 'characters',
      autocorrect: 'off',
      spellcheck: 'false',
    });
    const message = el('p', { class: 'code-message', role: 'status', 'data-code-message': true });

    function submit(event) {
      event.preventDefault();
      const gameId = access.gameForCode(input.value);
      if (!gameId) {
        message.textContent = "That code didn't work. Please check it and try again.";
        input.focus();
        return;
      }
      access.unlock(gameId);
      home();
    }

    show(el('main', { class: 'hub', 'data-screen': 'access' },
      el('form', { class: 'code-card', onsubmit: submit },
        el('h1', {}, 'Enter your access code'),
        el('p', {}, 'You will find it in the guide that came with your download.'),
        input,
        el('button', { class: 'btn btn-primary', type: 'submit', 'data-action': 'unlock' }, 'Unlock'),
        message,
        !allLocked() && el('button', {
          class: 'btn',
          type: 'button',
          'data-action': 'code-back',
          onclick: home,
        }, 'Back'))));
  }

  function tile(game) {
    const locked = !access.isUnlocked(game.id);
    return el('button', {
      class: 'hub-tile',
      'data-game': game.id,
      'data-locked': String(locked),
      onclick: () => (locked ? codeScreen() : KMG.games[game.id].open(home)),
    },
    el('span', { class: 'hub-art' }, KMG.games[game.id].art()),
    el('span', { class: 'hub-name' }, game.title),
    locked && icon('lock'));
  }

  function home() {
    show(el('main', { class: 'hub', 'data-screen': 'hub' },
      el('h1', { class: 'hub-title' }, 'Money Games'),
      el('div', { class: 'hub-tiles' }, KMG.build.games.map(tile)),
      KMG.install.tip()));
  }

  function start() {
    KMG.install.registerWorker();
    KMG.build.games.forEach((game) => KMG.games[game.id].prepare());
    if (KMG.debug.flag('unlock')) KMG.build.games.forEach((game) => access.unlock(game.id));
    if (allLocked()) codeScreen();
    else home();
  }

  KMG.hub = { start };
})(window.KMG);

// Runs last. The hub takes over in the hosted build; the standalone file goes
// straight to its one game.
(function (KMG) {
  'use strict';

  if (KMG.debug.flag('reset')) KMG.storage.clearAll();
  KMG.audio.listenForUnlock();

  if (KMG.hub) KMG.hub.start();
  else KMG.games[KMG.build.games[0].id].open(null);
})(window.KMG);
