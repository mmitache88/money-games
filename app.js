window.KMG_BUILD = {"target":"web","debug":false,"version":"43a097d928e5","games":[{"id":"coin-sorter","title":"Coin Sorter","prefix":"COIN"},{"id":"play-shop","title":"Play Shop","prefix":"SHOP"}],"access":{"requireAccessCode":true,"hashes":{"coin-sorter":["09efc35465112c278366fa55160b495a565c45ae27365905d98fbd70301089f9","c2559e31b43e253f001e28a5b484c02ba547134b25b63e126775079d0e36508a","88d47d9c2c16fd82f9df086a281b5f264c5aa2eace8dbdac1be3978c737e7a87","240d7010d83181dd6a26ae0928a67c80fd61b5f9ef771124225ec32b8e756aca","a7a75441f2d1b1f7648359e656af3032b4a170f86051cc9319b91d84bf5afed0","14f12956b4ed06acadc0f4f92499862cf5b0a1c4ed3a5ad166a99cf451f72b55","eede2cf5a790ec582057d5de840004b0469e22ba51c33960c24a9de0b1cb3548","6d11f68eb4d06290178bed073de34c1eb711a199665e619158b6736139920321","8ba1c850676bf74f13b26850bff10e9b1a51b6dac67488f822fc87e89b53ea15","8ed9ff6991bacd5eeae149bc55cd7e17fb765b3342cdd96a1f23fbcdc6464809"],"play-shop":["386674190f3950fa413e6ae0741ef82c5d80d5d79e9fc42015d0d1a29b93ccef","524eaad8a75a4d1b2082a46599cf07ea9731b188f9cebc2d8f3075943d0a3958","1eb600d989acca75e5d6241583f9e41356d7901a4c5c093c4d0554f0f92378b8","52dafefbdaedf8e67cc1ba380b290a604aa5a221179d1d1ec97178466132e31b","93531b7ba8dad6db6bae4605c437d2769fcc751efec81c23fa5eac622da2082d","3b919818415f5b5c408728718479b9aabfb1635917ae00812fa444f6cfdfdd06","271b6d9c9cf6a53b0e9338ca298e8bfd97e9e88111d41f0006d1c958ce234bfd","9311af0df851d8172fc77c1c72367d051d4a02235791e09302f535550aa0066e","ae5ba3d5c9f71153ad725f81396b878281160defdf92d1036a2b3917504b550f","3895bacb303b007859e8abf0fb6c34bef490ac23480a1103b1132d3ecd02cf57"]}}};
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
    // A shop till: a quick "cha" sliding down, then a bright two-note "ching".
    till: [
      { frequency: 1400, slideTo: 700, length: 0.07, volume: 0.06, type: 'triangle' },
      { frequency: 2093, start: 0.08, length: 0.3, volume: 0.1, type: 'triangle' },
      { frequency: 3136, start: 0.08, length: 0.22, volume: 0.05, type: 'triangle' },
    ],
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

// Amounts of money, written and spoken the UK way. Amounts are whole pence.
//
//   KMG.money.format(7)    "7p"      KMG.money.words(7)    "seven p"
//   KMG.money.format(23)   "23p"     KMG.money.words(23)   "twenty-three p"
//   KMG.money.format(100)  "£1"      KMG.money.words(100)  "one pound"
//   KMG.money.format(150)  "£1.50"   KMG.money.words(150)  "one pound fifty"
//   KMG.money.parse("23p") 23        KMG.money.parse("£2") 200
(function (KMG) {
  'use strict';

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  // 0 to 99 in words, with a hyphen as in "twenty-three".
  function number(n) {
    if (n < 20) return ONES[n];
    const tens = TENS[Math.floor(n / 10)];
    return n % 10 ? `${tens}-${ONES[n % 10]}` : tens;
  }

  function format(pence) {
    if (pence < 100) return `${pence}p`;
    if (pence % 100 === 0) return `£${pence / 100}`;
    return `£${(pence / 100).toFixed(2)}`;
  }

  function words(pence) {
    if (pence < 100) return `${number(pence)} p`;
    const pounds = Math.floor(pence / 100);
    const poundWords = `${number(pounds)} ${pounds === 1 ? 'pound' : 'pounds'}`;
    return pence % 100 ? `${poundWords} ${number(pence % 100)}` : poundWords;
  }

  // The amount a label like "23p" or "£2" stands for, or null.
  function parse(label) {
    const text = String(label);
    let match = /^([1-9][0-9]?)p$/.exec(text);
    if (match) return Number(match[1]);
    match = /^£([1-9][0-9]*)$/.exec(text);
    return match ? Number(match[1]) * 100 : null;
  }

  KMG.money = { format, words, parse };
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

  // Stars for a round, the same in every game: 0 mistakes is 3 stars, 1 or 2
  // is 2 stars, and 3 or more is 1 star. Never none.
  const starsFor = (mistakes) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1);

  KMG.celebrate = celebrate;
  KMG.stars = { forMistakes: starsFor };
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

// A game's saved data: stars, unlocked levels, mistakes, and the parent's
// settings. Saved through KMG.storage, so it can never throw. Each game makes
// its own store with KMG.progressStore({...}) and adds its settings.
//
//   key            storage key, and the game named in exported files
//   levels()       the game's levels, each { id, stages? }
//   settings()     the game's own settings and their defaults, such as
//                  { coins: [...], roundLength: 8 }
//   keepOnReset    settings a reset leaves alone, such as ['coins', 'roundLength']
//   isMistakeKey   whether a key in `mistakes` is valid (a coin, a price, ...)
//   checkSettings  (fileData, clean) => false if the file's settings are wrong;
//                  otherwise copies them into `clean`
(function (KMG) {
  'use strict';

  const VERSION = 1;

  const isCount = (value) => Number.isInteger(value) && value >= 0;
  const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

  function progressStore(options) {
    const { key } = options;
    const levelById = (id) => options.levels().find((level) => level.id === id);

    function defaults() {
      return Object.assign({ version: VERSION, unlocked: 1, levels: {}, mistakes: {} }, options.settings());
    }

    const load = () => Object.assign(defaults(), KMG.storage.load(key, null));
    const save = (data) => KMG.storage.save(key, data);

    function levelRecord(data, levelId) {
      return data.levels[levelId] || { stars: 0, plays: 0, stage: 0 };
    }

    // Keeps the best stars, and finishing a round unlocks the next level.
    // `mistakes` counts mistakes per key in this round.
    function recordRound(levelId, { stars, mistakes, stage, lastStage }) {
      const data = load();
      const record = levelRecord(data, levelId);
      data.levels[levelId] = {
        stars: Math.max(record.stars, stars),
        plays: record.plays + 1,
        stage: Math.max(record.stage, Math.min(stage + 1, lastStage)),
      };
      data.unlocked = Math.min(options.levels().length, Math.max(data.unlocked, levelId + 1));
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
      options.keepOnReset.forEach((name) => {
        fresh[name] = data[name];
      });
      save(fresh);
    }

    // The keys with the most mistakes, worst first.
    function confused(data, limit) {
      return Object.entries(data.mistakes)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
    }

    function exportText() {
      return JSON.stringify({
        app: 'kids-money-games',
        game: key,
        version: VERSION,
        exportedAt: new Date().toISOString(),
        data: load(),
      }, null, 2);
    }

    // Checks every field and rebuilds the data from what was checked, so nothing
    // unexpected in a file can reach the game. Returns null if anything is wrong.
    function parseImport(text) {
      let file;
      try {
        file = JSON.parse(text);
      } catch (error) {
        return null;
      }
      if (!isPlainObject(file) || file.app !== 'kids-money-games' || file.game !== key) return null;
      if (file.version !== VERSION || !isPlainObject(file.data)) return null;

      const { unlocked, levels, mistakes } = file.data;
      const levelCount = options.levels().length;
      if (!Number.isInteger(unlocked) || unlocked < 1 || unlocked > levelCount) return null;
      if (!isPlainObject(levels) || !isPlainObject(mistakes)) return null;

      const clean = defaults();
      clean.unlocked = unlocked;
      if (options.checkSettings(file.data, clean) === false) return null;

      for (const [id, record] of Object.entries(levels)) {
        const level = levelById(Number(id));
        if (!level || !isPlainObject(record)) return null;
        const lastStage = level.stages ? level.stages.length - 1 : 0;
        if (!isCount(record.stars) || record.stars > 3 || !isCount(record.plays)) return null;
        if (!isCount(record.stage) || record.stage > lastStage) return null;
        clean.levels[id] = { stars: record.stars, plays: record.plays, stage: record.stage };
      }

      for (const [id, count] of Object.entries(mistakes)) {
        if (!options.isMistakeKey(id) || !isCount(count)) return null;
        clean.mistakes[id] = count;
      }

      return clean;
    }

    return { load, save, defaults, levelRecord, recordRound, reset, confused, exportText, parseImport, VERSION };
  }

  KMG.progressStore = progressStore;
})(window.KMG);

// A game's home screen: the level picker. One card per level with its picture,
// its stars and a lock, the way into the grown-ups area, and the way back to
// the hub. Pictures rather than words, because many players cannot read yet.
//
//   KMG.levelPicker.show({
//     title,           the game's name, shown at the top
//     levels,          the game's levels, each { id }
//     art(level),      the picture on a level's card
//     store,           the game's progress store (src/shared/progress-store.js)
//     onPlay(id),      start a level
//     onParent(),      open the grown-ups area, after the 3-second hold
//     exit,            back to the hub, or null in the standalone build
//   })
(function (KMG) {
  'use strict';

  const { el, show, icon, iconButton, muteButton } = KMG.ui;

  function levelCard(level, data, options) {
    const locked = level.id > data.unlocked;
    const record = options.store.levelRecord(data, level.id);
    const stars = [1, 2, 3].map((n) => el('span', { class: `star ${n <= record.stars ? 'star-won' : 'star-empty'}` }, icon('star')));
    const card = el('button', {
      class: `level-card ${locked ? 'level-locked' : ''}`,
      'data-level': level.id,
      'data-stars': record.stars,
      'data-locked': String(locked),
      'aria-label': `Level ${level.id}${locked ? ', locked' : ''}`,
      onclick() {
        if (!locked) {
          options.onPlay(level.id);
          return;
        }
        card.classList.remove('wobble');
        void card.offsetWidth;
        card.classList.add('wobble');
      },
    },
    el('span', { class: 'level-number' }, String(level.id)),
    el('span', { class: 'level-art' }, options.art(level)),
    el('span', { class: 'stars stars-small' }, stars),
    locked && el('span', { class: 'level-lock' }, icon('lock')));
    return card;
  }

  // ?debug=1 adds a bar for jumping to any level and resetting everything.
  function debugBar(options) {
    if (!KMG.debug.on) return null;
    const jump = options.levels.map((level) => el('button', {
      class: 'btn',
      'data-debug-level': level.id,
      onclick: () => options.onPlay(level.id),
    }, `L${level.id}`));
    const reset = el('button', {
      class: 'btn',
      'data-debug-reset': true,
      onclick() {
        KMG.storage.clearAll();
        showPicker(options);
      },
    }, 'Reset');
    return el('div', { class: 'debug-bar' }, jump, reset);
  }

  function showPicker(options) {
    const data = options.store.load();
    show(el('main', { class: 'game-home', 'data-screen': 'game-home' },
      el('header', { class: 'home-top' },
        el('div', { class: 'home-left' },
          options.exit && iconButton('home', 'All games', options.exit, 'exit'),
          KMG.parentGate.button(options.onParent)),
        el('h1', { class: 'home-title' }, options.title),
        el('div', { class: 'home-right' }, muteButton())),
      el('div', { class: 'level-grid' },
        options.levels.map((level) => levelCard(level, data, options))),
      debugBar(options)));
  }

  KMG.levelPicker = { show: showPicker };
})(window.KMG);

// The frame of every game's play screen: a top bar with the back button, one
// pip per item in the round and the mute button; the prompt, which says itself
// again when tapped; then an empty play area ("zones") and tray for the game
// to fill. The game adds the screen with KMG.ui.show(screen.main).
//
//   const screen = KMG.playScreen.build({ levelId, kind, total, text, spoken, onBack });
//   screen.zones, screen.tray        fill these
//   screen.setDone(n)                light up the first n pips
//   screen.setPrompt(text, spoken)   change what the prompt shows and says
//   screen.speak()                   say the prompt
(function (KMG) {
  'use strict';

  const { el, iconButton, muteButton } = KMG.ui;

  function build({ levelId, kind, total, text, spoken, onBack }) {
    const pips = el('div', { class: 'pips', 'aria-hidden': 'true' },
      Array.from({ length: total }, () => el('span', { class: 'pip' })));

    const promptText = el('span', { class: 'prompt-text' }, text);
    let spokenPrompt = spoken;
    const speak = () => KMG.speech.say(spokenPrompt);

    const top = el('header', { class: 'play-top' },
      iconButton('back', 'Back', onBack, 'back'),
      pips,
      muteButton());
    const prompt = el('button', { class: 'prompt', 'data-action': 'repeat', onclick: speak }, promptText);
    const zones = el('div', { class: `zones zones-${kind}` });
    const tray = el('div', { class: `tray tray-${kind}` });
    const main = el('main', {
      class: 'play',
      'data-screen': 'play',
      'data-level': levelId,
      'data-kind': kind,
    }, top, prompt, zones, tray);

    return {
      main,
      zones,
      tray,
      promptText,
      speak,
      setDone(done) {
        Array.from(pips.children).forEach((pip, i) => pip.classList.toggle('pip-done', i < done));
      },
      setPrompt(newText, newSpoken) {
        promptText.textContent = newText;
        spokenPrompt = newSpoken;
      },
    };
  }

  KMG.playScreen = { build };
})(window.KMG);

// The grown-ups area every game shares, opened through the 3-second hold
// (src/shared/parent-gate.js). This screen is for adults, so unlike the child
// screens it uses words. In order: sound, the game's own settings, progress,
// moving progress to another device, and starting again.
//
//   KMG.parentArea.show({
//     gameName,        "Coin Sorter", for messages
//     store,           the game's progress store (src/shared/progress-store.js)
//     fileName,        name of the exported progress file
//     levels,          the game's levels, each { id, text }
//     settings(data),  the game's own setting sections, made with the helpers below
//     practise,        { title, item(key) }: what the child finds hardest, from
//                      the mistakes counted per key (a coin, a price, ...)
//     onDone(),        back to the game's home
//   })
//
// Helpers for a game's own settings: section(title, ...children),
// choices({ title, values, current, label, attr, onPick }) and
// toggle(label, setting, isOn, onChange), an on/off switch.
(function (KMG) {
  'use strict';

  const { el, show, icon } = KMG.ui;
  const { audio, fileTransfer } = KMG;

  const PRACTISE_LIMIT = 3;

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

  // A row of buttons, one pressed: round length, highest price and so on. Each
  // button carries data-<attr>="<value>", which the tests use.
  function choices({ title, values, current, label, attr, onPick }) {
    const buttons = values.map((value) => el('button', {
      class: 'btn choice',
      [`data-${attr}`]: value,
      'aria-pressed': String(current === value),
      onclick() {
        onPick(value);
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === this)));
      },
    }, label(value)));
    return section(title, el('div', { class: 'choice-row' }, buttons));
  }

  function soundSection() {
    const { sound, voice } = audio.settings();
    return section('Sound',
      toggle('Sound effects', 'sound', sound, (on) => audio.saveSettings({ sound: on })),
      toggle('Spoken prompts', 'voice', voice, (on) => audio.saveSettings({ voice: on })));
  }

  function progressSection(data, options) {
    const { store } = options;
    const rows = options.levels.map((level) => {
      const record = store.levelRecord(data, level.id);
      const stars = [1, 2, 3].map((n) => el('span', { class: `star ${n <= record.stars ? 'star-won' : 'star-empty'}` }, icon('star')));
      const played = record.plays === 1 ? 'Played once' : `Played ${record.plays} times`;
      return el('li', { class: 'progress-row', 'data-progress-level': level.id, 'data-stars': record.stars },
        el('span', {}, `Level ${level.id}: ${level.text}`),
        el('span', { class: 'stars stars-small', 'aria-label': `${record.stars} of 3 stars` }, stars),
        el('span', { class: 'parent-note' }, played));
    });

    const confused = store.confused(data, PRACTISE_LIMIT);
    const practise = confused.length
      ? el('ul', { class: 'confused' }, confused.map(([key, count]) => el('li', { 'data-confused': key },
        options.practise.item(key),
        count === 1 ? '1 mistake' : `${count} mistakes`)))
      : el('p', { class: 'parent-note', 'data-confused-none': true }, 'No mistakes yet.');

    return section('Progress', el('ul', { class: 'progress-list' }, rows), el('h3', {}, options.practise.title), practise);
  }

  function transferSection(options, refresh) {
    const { store } = options;
    const message = el('p', { class: 'parent-note', role: 'status', 'data-transfer-message': true });
    const say = (text) => {
      message.textContent = text;
    };
    const importFile = () => fileTransfer.open((text) => {
      const data = text === null ? null : store.parseImport(text);
      if (!data) {
        say(`That file doesn't look like ${options.gameName} progress, so nothing has been changed.`);
        return;
      }
      store.save(data);
      refresh('Progress imported.');
    });
    const exportFile = () => {
      const saved = fileTransfer.save(options.fileName, store.exportText());
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

  function resetSection(options, refresh) {
    const area = el('div', { class: 'parent-actions' });
    const ask = () => {
      area.textContent = '';
      area.append(
        el('p', { class: 'parent-note' }, 'Remove all stars and unlocked levels? This cannot be undone.'),
        el('button', {
          class: 'btn btn-danger',
          'data-action': 'reset-yes',
          onclick() {
            options.store.reset();
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

  function showArea(options, notice) {
    const refresh = (message) => showArea(options, message);
    const data = options.store.load();
    const transfer = transferSection(options, refresh);
    if (notice) transfer.say(notice);

    show(el('main', { class: 'parent', 'data-screen': 'parent' },
      el('header', { class: 'parent-top' },
        el('h1', {}, 'Grown-ups'),
        el('button', { class: 'btn btn-primary', 'data-action': 'close-parent', onclick: options.onDone }, 'Done')),
      soundSection(),
      options.settings(data),
      progressSection(data, options),
      transfer.node,
      resetSection(options, refresh)));
  }

  KMG.parentArea = { show: (options) => showArea(options), section, choices, toggle };
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

  // The shared star rule (src/shared/celebration.js).
  const starsFor = KMG.stars.forMistakes;

  KMG.cs.levels = { LEVELS, levelById, usableCoins, build, starsFor, MINIMUM_COINS };
})(window.KMG);

// Coin Sorter's saved data: the shared progress store (src/shared/progress-store.js)
// with this game's settings, the coins in play and the round length, and its
// mistakes counted per coin.
(function (KMG) {
  'use strict';

  const { coins, cs } = KMG;

  const ROUND_LENGTHS = [5, 8, 12];

  const store = KMG.progressStore({
    key: 'coin-sorter',
    levels: () => cs.levels.LEVELS,
    settings: () => ({ coins: coins.ALL.map((coin) => coin.id), roundLength: 8 }),
    keepOnReset: ['coins', 'roundLength'],
    isMistakeKey: (id) => Boolean(coins.byId(id)),
    checkSettings(data, clean) {
      const { coins: chosen, roundLength } = data;
      if (!Array.isArray(chosen) || ROUND_LENGTHS.indexOf(roundLength) === -1) return false;
      if (chosen.length < cs.levels.MINIMUM_COINS || new Set(chosen).size !== chosen.length) return false;
      if (!chosen.every((id) => coins.byId(id))) return false;
      clean.roundLength = roundLength;
      clean.coins = chosen.slice();
      return true;
    },
  });

  cs.progress = Object.assign(store, { ROUND_LENGTHS });
})(window.KMG);

// The play screen. Each kind of level supplies its zones (where coins can go)
// and what happens after a landing; dragging and feedback are shared here.
(function (KMG) {
  'use strict';

  const { el, show, icon } = KMG.ui;
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

    // The shared frame: top bar, pips and the prompt (src/shared/play-screen.js).
    const screen = KMG.playScreen.build({
      levelId,
      kind: round.kind,
      total: round.total,
      text: level.text,
      spoken: level.spoken,
      onBack: () => context.home(),
    });
    const { main, zones, tray, promptText } = screen;
    const speakPrompt = screen.speak;

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
        screen.setDone(placed);
        const finished = placed === round.total;
        if (finished) finishRound();
        return finished;
      },
      setPrompt: screen.setPrompt,
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

// Coin Sorter's grown-ups area: the shared one (src/shared/parent-area.js) with
// this game's settings, which coins are in play and the round length, and its
// "coins to practise".
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { coins, cs, parentArea } = KMG;

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
    return parentArea.section('Coins in the game', el('div', { class: 'coin-choices' }, buttons), message);
  }

  function roundSection(data) {
    return parentArea.choices({
      title: 'Round length',
      values: cs.progress.ROUND_LENGTHS,
      current: data.roundLength,
      label: (length) => `${length} coins`,
      attr: 'round',
      onPick(length) {
        const saved = cs.progress.load();
        saved.roundLength = length;
        cs.progress.save(saved);
      },
    });
  }

  function parent(context) {
    parentArea.show({
      gameName: 'Coin Sorter',
      store: cs.progress,
      fileName: 'coin-sorter-progress.json',
      levels: cs.levels.LEVELS,
      settings: (data) => [coinSection(data), roundSection(data)],
      practise: {
        title: 'Coins to practise',
        item: (id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) }),
      },
      onDone: () => context.home(),
    });
  }

  cs.parent = parent;
})(window.KMG);

// Coin Sorter's home screen: the shared level picker (src/shared/level-picker.js)
// with a picture of coins on each level's card.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { coins, cs } = KMG;

  const mini = (id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) });

  const LEVEL_ART = { 1: ['1p', '10p', '£2'], 2: ['1p', '£1'], 3: ['20p'], 4: ['1p', '5p', '10p'] };

  function home(context) {
    KMG.levelPicker.show({
      title: 'Coin Sorter',
      levels: cs.levels.LEVELS,
      art: (level) => LEVEL_ART[level.id].map(mini),
      store: cs.progress,
      onPlay: (levelId) => cs.play(levelId, context),
      onParent: () => cs.parent(context),
      exit: context.exit,
    });
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

// Play Shop's twelve toys, drawn as simple SVG on a 120 by 120 canvas. Original
// and unbranded: no real toy brands or characters. Flat pastel fills with the
// same soft outline, so they look like one set next to the coins.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  KMG.ps = KMG.ps || {};

  // The soft outline every toy uses
  const LINE = 'stroke="#24324a" stroke-opacity="0.22" stroke-width="3" stroke-linejoin="round"';
  const INK = '#24324a';

  const CORAL = '#ff9d8a';
  const SUN = '#ffd56b';
  const SKY = '#9cc9f5';
  const LILAC = '#cfc8f2';
  const MINT = '#8fd3c7';
  const CLOUD = '#f4f7fb';
  const WOOD = '#9b7653';

  const DRAWINGS = {
    ball: `
      <circle cx="60" cy="62" r="44" fill="${CORAL}"/>
      <ellipse cx="60" cy="62" rx="14" ry="44" fill="${SKY}"/>
      <ellipse cx="60" cy="62" rx="44" ry="13" fill="${SUN}"/>
      <circle cx="60" cy="62" r="44" fill="none" ${LINE}/>
      <circle cx="42" cy="42" r="9" fill="#fff" opacity="0.6"/>`,

    teddy: `
      <circle cx="34" cy="34" r="14" fill="#d9a066" ${LINE}/>
      <circle cx="86" cy="34" r="14" fill="#d9a066" ${LINE}/>
      <circle cx="34" cy="34" r="7" fill="#f0c99a"/>
      <circle cx="86" cy="34" r="7" fill="#f0c99a"/>
      <ellipse cx="60" cy="94" rx="31" ry="23" fill="#d9a066" ${LINE}/>
      <ellipse cx="60" cy="98" rx="16" ry="13" fill="#f0c99a"/>
      <circle cx="60" cy="54" r="30" fill="#d9a066" ${LINE}/>
      <ellipse cx="60" cy="64" rx="13" ry="10" fill="#f0c99a"/>
      <ellipse cx="60" cy="59" rx="5" ry="3.5" fill="${INK}"/>
      <path d="M55 67 Q60 71 65 67" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="49" cy="48" r="3.5" fill="${INK}"/>
      <circle cx="71" cy="48" r="3.5" fill="${INK}"/>`,

    car: `
      <path d="M14 74 Q14 62 26 60 L40 58 L52 40 Q55 36 60 36 L84 36 Q89 36 92 40 L102 58 Q108 60 108 68 L108 80 Q108 86 102 86 L20 86 Q14 86 14 80 Z" fill="${SKY}" ${LINE}/>
      <path d="M58 56 L63 43 L72 43 L72 56 Z" fill="${CLOUD}"/>
      <path d="M77 43 L86 43 L94 56 L77 56 Z" fill="${CLOUD}"/>
      <circle cx="104" cy="70" r="4" fill="${SUN}"/>
      <circle cx="36" cy="86" r="13" fill="${INK}"/>
      <circle cx="86" cy="86" r="13" fill="${INK}"/>
      <circle cx="36" cy="86" r="5" fill="#dfe5ec"/>
      <circle cx="86" cy="86" r="5" fill="#dfe5ec"/>`,

    kite: `
      <path d="M60 92 Q48 100 58 108 Q66 114 56 119" fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M50 98 L58 102 L50 106 Z M66 98 L58 102 L66 106 Z" fill="${SUN}"/>
      <path d="M60 12 L92 46 L60 92 L28 46 Z" fill="${LILAC}"/>
      <path d="M60 12 L28 46 L60 46 Z M60 46 L92 46 L60 92 Z" fill="${CORAL}"/>
      <path d="M60 12 L60 92 M28 46 L92 46" stroke="${INK}" stroke-opacity="0.3" stroke-width="2"/>
      <path d="M60 12 L92 46 L60 92 L28 46 Z" fill="none" ${LINE}/>`,

    boat: `
      <rect x="58" y="18" width="4" height="64" rx="2" fill="${WOOD}"/>
      <path d="M60 12 L74 16 L60 20 Z" fill="${MINT}"/>
      <path d="M63 22 L63 76 L96 76 Z" fill="#fff" ${LINE}/>
      <path d="M57 32 L57 76 L32 76 Z" fill="${SUN}" ${LINE}/>
      <path d="M16 82 L104 82 L91 100 L29 100 Z" fill="${CORAL}" ${LINE}/>
      <path d="M8 100 Q20 92 32 100 T56 100 T80 100 T104 100 L112 100 L112 114 L8 114 Z" fill="${SKY}"/>`,

    rocket: `
      <path d="M48 82 Q60 114 72 82 Z" fill="${SUN}"/>
      <path d="M54 82 Q60 100 66 82 Z" fill="${CORAL}"/>
      <path d="M38 60 L24 84 L41 78 Z" fill="${CORAL}" ${LINE}/>
      <path d="M82 60 L96 84 L79 78 Z" fill="${CORAL}" ${LINE}/>
      <path d="M60 10 Q84 34 82 76 L38 76 Q36 34 60 10 Z" fill="${CLOUD}" ${LINE}/>
      <path d="M60 10 Q74 22 78 38 L42 38 Q46 22 60 10 Z" fill="${CORAL}" ${LINE}/>
      <circle cx="60" cy="55" r="10" fill="${SKY}" ${LINE}/>
      <rect x="40" y="74" width="40" height="9" rx="4" fill="${LILAC}" ${LINE}/>`,

    duck: `
      <path d="M26 86 Q8 72 20 62 Q28 72 38 76 Z" fill="${SUN}" ${LINE}/>
      <ellipse cx="60" cy="84" rx="40" ry="22" fill="${SUN}" ${LINE}/>
      <path d="M42 80 Q58 70 74 82 Q58 94 44 88 Z" fill="#f2c14e"/>
      <circle cx="78" cy="48" r="23" fill="${SUN}" ${LINE}/>
      <path d="M98 46 Q114 48 102 58 Q95 56 96 51 Z" fill="${CORAL}" ${LINE}/>
      <circle cx="84" cy="42" r="3.5" fill="${INK}"/>
      <circle cx="72" cy="40" r="5" fill="#fff" opacity="0.5"/>`,

    drum: `
      <path d="M30 34 L54 12 M90 34 L66 12" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="54" cy="12" r="5" fill="${LILAC}"/>
      <circle cx="66" cy="12" r="5" fill="${LILAC}"/>
      <ellipse cx="60" cy="92" rx="38" ry="10" fill="${CORAL}" ${LINE}/>
      <rect x="22" y="46" width="76" height="46" fill="${CORAL}"/>
      <polyline points="24,52 34,86 44,52 54,86 64,52 74,86 84,52 94,86" fill="none" stroke="${SUN}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M22 46 L22 92 M98 46 L98 92" ${LINE}/>
      <ellipse cx="60" cy="46" rx="38" ry="10" fill="${CLOUD}" ${LINE}/>`,

    dinosaur: `
      <rect x="32" y="78" width="13" height="22" rx="5" fill="${MINT}" ${LINE}/>
      <rect x="66" y="78" width="13" height="22" rx="5" fill="${MINT}" ${LINE}/>
      <path d="M20 84 Q4 84 4 74 Q14 78 24 72 Q30 56 54 54 Q74 52 84 40 Q88 24 102 26 Q114 28 110 42 Q106 50 96 50 Q92 70 88 84 Z" fill="${MINT}" ${LINE}/>
      <circle cx="50" cy="66" r="5" fill="#6fbfb4"/>
      <circle cx="65" cy="62" r="4" fill="#6fbfb4"/>
      <circle cx="74" cy="72" r="3.5" fill="#6fbfb4"/>
      <circle cx="101" cy="35" r="3.5" fill="${INK}"/>
      <path d="M106 43 Q101 46 96 44" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,

    robot: `
      <path d="M60 22 L60 12" stroke="${INK}" stroke-opacity="0.5" stroke-width="3"/>
      <circle cx="60" cy="10" r="5" fill="${CORAL}"/>
      <rect x="18" y="68" width="12" height="28" rx="6" fill="#dfe5ec" ${LINE}/>
      <rect x="90" y="68" width="12" height="28" rx="6" fill="#dfe5ec" ${LINE}/>
      <rect x="40" y="100" width="13" height="14" rx="4" fill="#dfe5ec" ${LINE}/>
      <rect x="67" y="100" width="13" height="14" rx="4" fill="#dfe5ec" ${LINE}/>
      <rect x="30" y="64" width="60" height="40" rx="10" fill="${LILAC}" ${LINE}/>
      <rect x="44" y="72" width="32" height="20" rx="5" fill="${CLOUD}"/>
      <circle cx="52" cy="82" r="3.5" fill="${CORAL}"/>
      <circle cx="60" cy="82" r="3.5" fill="${SUN}"/>
      <circle cx="68" cy="82" r="3.5" fill="${MINT}"/>
      <rect x="28" y="34" width="6" height="14" rx="3" fill="${LILAC}"/>
      <rect x="86" y="34" width="6" height="14" rx="3" fill="${LILAC}"/>
      <rect x="34" y="22" width="52" height="38" rx="10" fill="#dfe5ec" ${LINE}/>
      <circle cx="50" cy="40" r="6" fill="${SKY}"/>
      <circle cx="70" cy="40" r="6" fill="${SKY}"/>
      <circle cx="50" cy="40" r="2.5" fill="${INK}"/>
      <circle cx="70" cy="40" r="2.5" fill="${INK}"/>
      <rect x="50" y="50" width="20" height="4" rx="2" fill="${INK}" opacity="0.6"/>`,

    yoyo: `
      <circle cx="60" cy="10" r="5" fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="2.5"/>
      <path d="M60 15 Q67 30 60 46" fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="2.5"/>
      <circle cx="60" cy="74" r="38" fill="${CORAL}" ${LINE}/>
      <circle cx="60" cy="74" r="26" fill="${SUN}"/>
      <path d="M60 48 A26 26 0 0 1 86 74 L60 74 Z M60 100 A26 26 0 0 1 34 74 L60 74 Z" fill="${SKY}"/>
      <circle cx="60" cy="74" r="8" fill="${CLOUD}" ${LINE}/>
      <circle cx="44" cy="56" r="6" fill="#fff" opacity="0.5"/>`,

    blocks: `
      <rect x="38" y="18" width="44" height="44" rx="7" fill="${SUN}" ${LINE}/>
      <rect x="12" y="66" width="44" height="44" rx="7" fill="${CORAL}" ${LINE}/>
      <rect x="64" y="66" width="44" height="44" rx="7" fill="${SKY}" ${LINE}/>
      <text class="ps-toy-text" x="60" y="40" dy="0.35em" text-anchor="middle" font-size="30" fill="${INK}">C</text>
      <text class="ps-toy-text" x="34" y="88" dy="0.35em" text-anchor="middle" font-size="30" fill="${INK}">A</text>
      <text class="ps-toy-text" x="86" y="88" dy="0.35em" text-anchor="middle" font-size="30" fill="${INK}">B</text>`,
  };

  // `name` is how the shopkeeper says it; blocks are plural ("cost").
  const TOYS = [
    { id: 'ball', name: 'the ball' },
    { id: 'teddy', name: 'the teddy bear' },
    { id: 'car', name: 'the toy car' },
    { id: 'kite', name: 'the kite' },
    { id: 'boat', name: 'the boat' },
    { id: 'rocket', name: 'the rocket' },
    { id: 'duck', name: 'the duck' },
    { id: 'drum', name: 'the drum' },
    { id: 'dinosaur', name: 'the dinosaur' },
    { id: 'robot', name: 'the robot' },
    { id: 'yoyo', name: 'the yo-yo' },
    { id: 'blocks', name: 'the blocks', plural: true },
  ];

  const byId = (id) => TOYS.find((toy) => toy.id === id);

  function svg(id) {
    const toy = byId(id);
    return `<svg class="ps-toy-svg" viewBox="0 0 120 120" role="img" aria-label="${toy.name.replace('the ', '')}">${DRAWINGS[id]}</svg>`;
  }

  // A toy at any size: the element fills whatever box the stylesheet gives it.
  const element = (id, className = 'ps-toy') => el('span', { class: className, 'data-toy': id, html: svg(id) });
  const mini = (id) => element(id, 'ps-toy-mini');

  KMG.ps.toys = { ALL: TOYS, byId, svg, element, mini };
})(window.KMG);

// The shopkeeper: a simple, friendly character seen from the chest up behind
// the counter, drawn as SVG on a 200 by 200 canvas from a dozen rounded shapes.
// Original and unbranded.
//
// Looks change from round to round (picked by the seeded random numbers), so
// every child can see someone like them: 4 skin tones, 3 hair shapes, 4 hair
// colours. Four expressions, all friendly, never cross or sad:
//   idle     a smile
//   talking  the mouth opens and closes while a prompt is spoken
//   happy    happy-arc eyes and a small bounce, after an exact payment
//   hmm      a head tilt and raised eyebrows, for "a little more, please"
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;

  const INK = '#24324a';
  const LINE = 'stroke="#24324a" stroke-opacity="0.2" stroke-width="3" stroke-linejoin="round"';
  const MOUTH = '#8a3b44';
  const SHIRT = '#9cc9f5';
  const APRON = '#1f6f6b';

  const SKINS = ['#f7d7c4', '#e3ad84', '#b97b52', '#7b4a2e'];
  const HAIR_COLOURS = ['#2e1f17', '#6b4226', '#b8622d', '#e3c06e'];
  const HAIR_SHAPES = ['short', 'bun', 'curly'];
  const EXPRESSIONS = ['idle', 'talking', 'happy', 'hmm'];

  // One look for a round, from the game's seeded random numbers.
  function lookFor(rng) {
    return { skin: rng.pick(SKINS), hair: rng.pick(HAIR_COLOURS), shape: rng.pick(HAIR_SHAPES) };
  }

  // Hair behind the head (a bun) and in front of it (the fringe or curls)
  function hairBehind(look) {
    return look.shape === 'bun' ? `<circle cx="100" cy="28" r="19" fill="${look.hair}" ${LINE}/>` : '';
  }

  function hairFront(look) {
    if (look.shape === 'curly') {
      const curls = [[58, 70, 13], [64, 50, 14], [82, 38, 15], [102, 34, 15], [121, 39, 14], [137, 51, 13], [142, 70, 12]];
      return curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${look.hair}"/>`).join('');
    }
    return `<path d="M54 80 Q50 34 100 32 Q150 34 146 80 Q140 58 122 54 Q100 64 78 54 Q60 58 54 80 Z" fill="${look.hair}"/>`;
  }

  function face(expression) {
    const brows = expression === 'hmm'
      ? `<path d="M76 64 Q84 58 92 62 M108 66 Q116 62 124 64" fill="none" stroke="${INK}" stroke-opacity="0.65" stroke-width="3.5" stroke-linecap="round"/>`
      : `<path d="M76 72 Q84 67 92 70 M108 70 Q116 67 124 72" fill="none" stroke="${INK}" stroke-opacity="0.65" stroke-width="3.5" stroke-linecap="round"/>`;
    const eyes = expression === 'happy'
      ? `<path d="M77 87 Q84 79 91 87 M109 87 Q116 79 123 87" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
      : `<circle cx="84" cy="85" r="5" fill="${INK}"/><circle cx="116" cy="85" r="5" fill="${INK}"/>`;
    const smile = `<path d="M86 104 Q100 115 114 104" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    let mouth = smile;
    if (expression === 'happy') {
      mouth = `<path d="M83 101 Q100 124 117 101 Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    } else if (expression === 'talking') {
      // Two mouths; the stylesheet shows one, then the other.
      mouth = `<g class="ps-mouth-shut">${smile}</g>` +
        `<g class="ps-mouth-open"><ellipse cx="100" cy="107" rx="10" ry="8" fill="${MOUTH}" stroke="${INK}" stroke-width="3"/></g>`;
    } else if (expression === 'hmm') {
      // A lopsided, thinking smile: puzzled, never worried.
      mouth = `<path d="M90 106 Q101 113 111 103" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    }
    const cheeks = `<ellipse cx="71" cy="100" rx="8" ry="5" fill="#ff9d8a" opacity="0.4"/><ellipse cx="129" cy="100" rx="8" ry="5" fill="#ff9d8a" opacity="0.4"/>`;
    return brows + eyes + cheeks + mouth;
  }

  function svg(look, expression) {
    return `<svg class="ps-shopkeeper-svg" viewBox="0 0 200 200" aria-hidden="true">
      <path d="M28 200 Q28 140 100 136 Q172 140 172 200 Z" fill="${SHIRT}" ${LINE}/>
      <path d="M64 200 L66 150 Q100 160 134 150 L136 200 Z" fill="${APRON}"/>
      <path d="M70 152 L80 138 M130 152 L120 138" stroke="${APRON}" stroke-width="7" stroke-linecap="round"/>
      <rect x="88" y="172" width="24" height="16" rx="4" fill="#2a8580"/>
      <g class="ps-shopkeeper-head">
        <rect x="88" y="116" width="24" height="24" rx="8" fill="${look.skin}"/>
        ${hairBehind(look)}
        <circle cx="54" cy="86" r="9" fill="${look.skin}" ${LINE}/>
        <circle cx="146" cy="86" r="9" fill="${look.skin}" ${LINE}/>
        <circle cx="100" cy="82" r="46" fill="${look.skin}" ${LINE}/>
        ${hairFront(look)}
        ${face(expression)}
      </g>
    </svg>`;
  }

  // The shopkeeper on screen. setExpression swaps the face, and the stylesheet
  // animates by expression (.ps-shopkeeper[data-expression="..."]).
  function element(look, expression = 'idle') {
    const node = el('div', {
      class: 'ps-shopkeeper',
      'data-expression': expression,
      'data-look': `${look.shape}-${SKINS.indexOf(look.skin)}-${HAIR_COLOURS.indexOf(look.hair)}`,
      html: svg(look, expression),
    });
    return {
      node,
      setExpression(name) {
        node.dataset.expression = name;
        node.innerHTML = svg(look, name);
      },
    };
  }

  KMG.ps.shopkeeper = { lookFor, element, svg, EXPRESSIONS, SKINS, HAIR_COLOURS, HAIR_SHAPES };
})(window.KMG);

// Price tags: a swing tag hanging from the toy, with the price in large type.
// At level 1 it also shows the coin that pays it, so a child who cannot read
// numbers yet can match by look. A small version names prices in the grown-ups
// area.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { coins, money } = KMG;

  function element(item, onTap) {
    return el('button', {
      class: 'ps-tag',
      'data-price': item.price,
      'data-action': 'repeat-price',
      'aria-label': `Price: ${money.format(item.price)}. Hear it again`,
      onclick: onTap,
    },
    el('span', { class: 'ps-tag-hole', 'aria-hidden': 'true' }),
    el('span', { class: 'ps-tag-price' }, money.format(item.price)),
    item.tagCoin && el('span', { class: 'coin-mini ps-tag-coin', html: coins.svg(coins.byId(item.tagCoin)) }));
  }

  // "7p" on a small tag, for lists
  const mini = (label) => el('span', { class: 'ps-tag-mini' }, label);

  KMG.ps.tag = { element, mini };
})(window.KMG);

// What each Play Shop level asks for. Plain logic with no drawing: `build`
// turns a level and the parent's settings into one round: a list of toys, each
// with a price and the coins the child can pay with. Amounts are whole pence.
(function (KMG) {
  'use strict';

  const { coins, money } = KMG;
  const { toys } = KMG.ps;

  const LEVELS = [
    { id: 1, kind: 'pay', text: 'One coin', spoken: 'Pay with one coin!' },
    { id: 2, kind: 'pay', text: 'Count it out', spoken: 'Pay the right amount!' },
    { id: 3, kind: 'pay', text: 'Bigger prices', spoken: 'Pay the right amount!' },
    { id: 4, kind: 'change', text: 'Change please', spoken: 'Pay with your coin, then check your change!' },
  ];

  const levelById = (id) => LEVELS.find((level) => level.id === id);

  // The parent's choice of the highest price at level 3. Level 2 always stops at 10p.
  const HIGHEST_PRICES = [20, 50];
  const LEVEL_2_HIGHEST = 10;
  // Change at level 4 is never more than this.
  const MOST_CHANGE = 20;

  // The coins in the purse at each level. A 1p is always there from level 2 on,
  // so every price can be paid exactly.
  const PURSES = {
    1: coins.ALL.map((coin) => coin.id),
    2: ['1p', '2p', '5p'],
    3: ['1p', '2p', '5p', '10p', '20p'],
  };
  // The coin a child pays with at level 4, from the smallest that works.
  const PAYING_COINS = ['10p', '20p', '50p'];

  const valueOf = (id) => coins.byId(id).value;
  const between = (rng, low, high) => low + rng.int(high - low + 1);

  // A price for each toy, never the same twice in a row.
  function prices(count, makePrice) {
    const list = [];
    for (let i = 0; i < count; i++) {
      let price = makePrice();
      for (let tries = 0; tries < 10 && price === list[i - 1]; tries++) price = makePrice();
      list.push(price);
    }
    return list;
  }

  // Level 4's three piles of change to choose from: the right one, and two near
  // misses. A near miss is 1p or 2p out, or the price itself, a common mix-up.
  function changeChoices(change, price, coin, rng) {
    const near = [change - 1, change + 1, change - 2, change + 2, price]
      .filter((amount, i, all) => amount > 0 && amount !== change && amount < coin && all.indexOf(amount) === i);
    return rng.shuffle([change].concat(rng.shuffle(near).slice(0, 2)));
  }

  // The fewest coins that make an amount. UK coins always allow this greedily.
  // `ids` limits the coins to those in a purse; by default any coin.
  function fewestCoins(amount, ids) {
    const allowed = ids ? coins.ALL.filter((coin) => ids.includes(coin.id)) : coins.ALL;
    const largestFirst = allowed.slice().sort((a, b) => b.value - a.value);
    const pile = [];
    let left = amount;
    largestFirst.forEach((coin) => {
      while (left >= coin.value) {
        pile.push(coin.id);
        left -= coin.value;
      }
    });
    return pile;
  }

  // roundLength toys; highestPrice is the parent's level 3 setting.
  function build(levelId, { roundLength, highestPrice, rng }) {
    const kind = levelById(levelId).kind;
    const chosenToys = rng.shuffle(toys.ALL.map((toy) => toy.id)).slice(0, roundLength);
    const highest = HIGHEST_PRICES.indexOf(highestPrice) === -1 ? 50 : highestPrice;

    if (kind === 'change') {
      const payingCoins = PAYING_COINS.filter((id) => valueOf(id) <= highest);
      const items = chosenToys.map((toy) => {
        const coin = rng.pick(payingCoins);
        const value = valueOf(coin);
        const price = between(rng, Math.max(1, value - MOST_CHANGE), value - 1);
        const change = value - price;
        return { toy, price, coin, change, choices: changeChoices(change, price, value, rng) };
      });
      return { kind, items, total: items.length };
    }

    const makePrice = {
      1: () => valueOf(rng.pick(PURSES[1])),
      2: () => between(rng, 2, LEVEL_2_HIGHEST),
      3: () => between(rng, LEVEL_2_HIGHEST + 1, highest),
    }[levelId];
    const items = prices(chosenToys.length, makePrice).map((price, i) => ({
      toy: chosenToys[i],
      price,
      purse: PURSES[levelId],
      // At level 1 the price tag also shows the coin that pays it.
      tagCoin: levelId === 1 ? coins.ALL.find((c) => c.value === price).id : null,
    }));
    return { kind, items, total: items.length };
  }

  // The busiest the mat can be at a level, for fitting small screens (see
  // fit() in play.js): the payment with the most coins, paid with the fewest
  // coins from the purse (the biggest coins on a tie), or at level 4 the three
  // piles of change with the most coins between them. Worked out for the level
  // rather than the round, so a level always looks the same on a screen.
  function busiestMat(levelId, highestPrice) {
    const highest = HIGHEST_PRICES.indexOf(highestPrice) === -1 ? 50 : highestPrice;
    const size = (ids) => ids.reduce((sum, id) => sum + coins.byId(id).mm, 0);
    const busier = (a, b) => (b.length > a.length || (b.length === a.length && size(b) > size(a)));

    if (levelById(levelId).kind === 'change') {
      let most = { ids: [], piles: [] };
      PAYING_COINS.filter((id) => valueOf(id) <= highest).forEach((coin) => {
        const value = valueOf(coin);
        for (let price = Math.max(1, value - MOST_CHANGE); price < value; price++) {
          const change = value - price;
          const near = [change - 1, change + 1, change - 2, change + 2, price]
            .filter((amount, i, all) => amount > 0 && amount !== change && amount < value && all.indexOf(amount) === i);
          near.forEach((a, i) => near.slice(i + 1).forEach((b) => {
            const piles = [change, a, b];
            const ids = [].concat(...piles.map((amount) => fewestCoins(amount)));
            if (busier(most.ids, ids)) most = { ids, piles };
          }));
        }
      });
      return { piles: most.piles };
    }

    const range = (low, high) => Array.from({ length: high - low + 1 }, (_, i) => low + i);
    const allPrices = {
      1: PURSES[1].map(valueOf),
      2: range(2, LEVEL_2_HIGHEST),
      3: range(LEVEL_2_HIGHEST + 1, highest),
    }[levelId];
    return {
      coins: allPrices.map((price) => fewestCoins(price, PURSES[levelId]))
        .reduce((most, ids) => (busier(most, ids) ? ids : most)),
    };
  }

  // What the shopkeeper says about a toy, on screen and spoken.
  function priceLine(item) {
    const toy = toys.byId(item.toy);
    const name = toy.name.charAt(0).toUpperCase() + toy.name.slice(1);
    const verb = toy.plural ? 'cost' : 'costs';
    return {
      text: `${name} ${verb} ${money.format(item.price)}.`,
      spoken: `${name} ${verb} ${money.words(item.price)}.`,
    };
  }

  KMG.ps.levels = {
    LEVELS, levelById, build, priceLine, fewestCoins, busiestMat, PURSES, HIGHEST_PRICES, LEVEL_2_HIGHEST, MOST_CHANGE,
  };
})(window.KMG);

// Play Shop's saved data: the shared progress store (src/shared/progress-store.js)
// with this game's settings, and its mistakes counted per price ("7p", "£1").
(function (KMG) {
  'use strict';

  const { money, ps } = KMG;

  const ROUND_LENGTHS = [3, 5, 8];

  const store = KMG.progressStore({
    key: 'play-shop',
    levels: () => ps.levels.LEVELS,
    settings: () => ({ roundLength: 5, highestPrice: 50, showTotal: true }),
    keepOnReset: ['roundLength', 'highestPrice', 'showTotal'],
    isMistakeKey: (key) => money.parse(key) !== null,
    checkSettings(data, clean) {
      const { roundLength, highestPrice, showTotal } = data;
      if (ROUND_LENGTHS.indexOf(roundLength) === -1) return false;
      if (ps.levels.HIGHEST_PRICES.indexOf(highestPrice) === -1) return false;
      if (typeof showTotal !== 'boolean') return false;
      Object.assign(clean, { roundLength, highestPrice, showTotal });
      return true;
    },
  });

  ps.progress = Object.assign(store, { ROUND_LENGTHS });
})(window.KMG);

// Play Shop's play screen: the shop. The shared frame (src/shared/play-screen.js)
// holds the shopkeeper behind the counter (with a shopping bag, the toy and its
// price tag, and the till), the payment mat in front, and the purse in the tray.
//
// Levels 1 to 3 ("pay"): the child drags coins from the purse to the mat (the
// purse never runs out), taps a coin on the mat to send it back, and presses
// the till. The shopkeeper checks the payment:
//   exact      a till "cha-ching", the toy drops into the bag, the next toy comes
//   too little "A little more, please"; a second time says how much more
//   too much   "That's a bit too much"; the child takes some back
// A wrong payment is one mistake. An empty mat just repeats the price.
//
// Level 4 ("change"): the purse holds one coin bigger than the price. The
// child puts it on the mat (the mat takes just that coin) and presses the till.
// The shopkeeper takes it and holds out three piles of change on the mat; the
// child taps the right one. A wrong pile is one mistake: the first time
// "Have another look", then the sum spelled out ("From 7p up to 10p is 3p").
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { coins, money, audio, speech, drag, effects, ps } = KMG;

  // How far outside the mat a coin can be dropped and still count.
  const FORGIVING_PX = 44;
  // The most coins the mat holds, so it never pushes the shop off screen.
  const MAT_LIMIT = 12;
  const TALK_MS = 1800;
  const RETURN_MS = 260;
  const BAG_MS = 520;
  const NEXT_TOY_MS = 900;
  // Small screens (see fit() below): the shopkeeper's height to aim for, the
  // least they may shrink to (and in the tight layout), and the height below
  // which the phone-on-its-side layout in style.css applies.
  const KEEPER_PX = 120;
  const KEEPER_MIN_PX = 90;
  const KEEPER_TIGHT_PX = 64;
  const SHORT_PX = 520;

  // A phone turning from its side to upright, with a curved arrow, for when a
  // phone on its side has no room for the shop.
  const TURN_SVG = `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M30 26 A44 44 0 0 1 96 46" fill="none" stroke="#24324a" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
    <path d="M86 40 L98 48 L101 34" fill="none" stroke="#24324a" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="ps-turn-phone">
      <rect x="38" y="30" width="44" height="76" rx="9" fill="#f4f7fb" stroke="#24324a" stroke-width="5"/>
      <rect x="45" y="40" width="30" height="52" rx="3" fill="#8fd3c7"/>
      <circle cx="60" cy="99" r="3" fill="#24324a"/>
    </g>
  </svg>`;

  // A plain till, drawn like the toys: a body, a screen with a pound sign and keys.
  const TILL_SVG = `<svg viewBox="0 0 120 110" aria-hidden="true">
    <rect x="24" y="8" width="72" height="30" rx="8" fill="#24324a"/>
    <text class="ps-toy-text" x="60" y="23" dy="0.35em" text-anchor="middle" font-size="22" fill="#ffd56b">£</text>
    <path d="M14 46 Q14 38 22 38 L98 38 Q106 38 106 46 L112 92 Q112 100 104 100 L16 100 Q8 100 8 92 Z" fill="#8fd3c7" stroke="#24324a" stroke-opacity="0.22" stroke-width="3"/>
    <g fill="#f4f7fb">
      <rect x="28" y="50" width="16" height="11" rx="3"/><rect x="52" y="50" width="16" height="11" rx="3"/><rect x="76" y="50" width="16" height="11" rx="3"/>
      <rect x="26" y="68" width="16" height="11" rx="3"/><rect x="52" y="68" width="16" height="11" rx="3"/><rect x="78" y="68" width="16" height="11" rx="3"/>
    </g>
    <rect x="30" y="86" width="60" height="8" rx="4" fill="#6fbfb4"/>
  </svg>`;

  // A paper shopping bag with handles, for the toys bought this round.
  const BAG_SVG = `<svg viewBox="0 0 100 110" aria-hidden="true">
    <path d="M34 34 Q34 12 50 12 Q66 12 66 34" fill="none" stroke="#9b7653" stroke-width="5" stroke-linecap="round"/>
    <path d="M16 34 L84 34 L90 104 Q90 108 86 108 L14 108 Q10 108 10 104 Z" fill="#f2c9a0" stroke="#24324a" stroke-opacity="0.22" stroke-width="3" stroke-linejoin="round"/>
    <path d="M16 34 L84 34 L83 46 L17 46 Z" fill="#e9b887"/>
  </svg>`;

  function play(levelId, context) {
    drag.reset();
    const level = ps.levels.levelById(levelId);
    const saved = ps.progress.load();
    const round = ps.levels.build(levelId, {
      roundLength: saved.roundLength,
      highestPrice: saved.highestPrice,
      rng: context.rng,
    });

    const screen = KMG.playScreen.build({
      levelId,
      kind: round.kind,
      total: round.total,
      text: level.text,
      spoken: level.spoken,
      onBack: () => context.home(),
    });

    let alive = true;
    // Busy while the shopkeeper checks a payment or the next toy arrives. Shown
    // as data-busy on the screen, so tests can wait for it.
    let busy = false;
    const setBusy = (value) => {
      busy = value;
      screen.main.dataset.busy = String(value);
    };
    let index = 0;
    let shortTries = 0;
    // Level 4: the piles of change are on the mat, waiting for a tap.
    let choosing = false;
    let wrongPicks = 0;
    let mistakes = 0;
    const mistakesByPrice = {};
    const item = () => round.items[index];

    const later = (callback, ms) => window.setTimeout(() => {
      if (alive) callback();
    }, ms);

    // The shopkeeper and what they say. `expression` lasts TALK_MS, then idle.
    const keeper = ps.shopkeeper.element(ps.shopkeeper.lookFor(context.rng));
    const bubble = el('div', { class: 'ps-bubble', role: 'status' });
    let talkTimer = null;
    function say(text, spoken, expression = 'talking') {
      bubble.textContent = text;
      keeper.setExpression(expression);
      speech.say(spoken);
      window.clearTimeout(talkTimer);
      talkTimer = window.setTimeout(() => {
        if (alive && keeper.node.dataset.expression === expression) keeper.setExpression('idle');
      }, TALK_MS);
    }
    const sayPrice = () => {
      const line = ps.levels.priceLine(item());
      say(line.text, line.spoken);
    };

    const goods = el('div', { class: 'ps-goods' });
    const bag = el('div', { class: 'ps-bag', 'data-bag': true, html: BAG_SVG });
    const till = el('button', {
      class: 'ps-till',
      'data-action': 'pay',
      'aria-label': 'Pay',
      html: TILL_SVG,
    });
    const mat = el('div', { class: 'ps-mat', 'data-mat': true, 'aria-label': 'Put coins here to pay' });
    const total = el('div', { class: 'ps-total', 'data-total': true, 'aria-live': 'polite' });
    const showTotal = saved.showTotal && (levelId === 2 || levelId === 3);

    const back = el('div', { class: 'ps-back' }, keeper.node, bubble);
    const counter = el('div', { class: 'ps-counter' }, bag, goods, till);
    const matArea = el('div', { class: 'ps-mat-area' }, mat, showTotal && total);
    screen.zones.appendChild(el('div', { class: 'ps-shop' }, back, counter, matArea));
    screen.main.appendChild(el('div', { class: 'ps-turn', 'data-turn': true },
      el('div', { class: 'ps-turn-art', html: TURN_SVG }),
      el('p', { class: 'ps-turn-text' }, 'Turn me upright')));

    // Fitting small screens. The purse's height depends on the level (level 1
    // has all eight coins), so the layout is measured, not just set by the
    // screen's size:
    //   usual    the shopkeeper behind the counter, the mat in front
    //   compact  a phone held upright, when the shopkeeper would be under
    //            KEEPER_PX: they stand beside the mat, and the level's name and
    //            the speech bubble make way (data-ps-fit="compact")
    //   tight    the smallest phones, when even that leaves no room: a smaller
    //            shopkeeper at the end of the counter, the bag put away and
    //            the mat the full width (data-ps-fit="tight")
    //   turn     a phone on its side with no room for the shop at all: a
    //            picture asks for it to be turned upright (data-ps-turn)
    // Phones on their side otherwise use the short-screen layout in style.css.
    const box = (node) => node.getBoundingClientRect();
    function shopFits() {
      const top = box(screen.main.querySelector('.play-top')).bottom;
      const bottom = box(screen.tray).top;
      const inside = [back, counter, matArea].every((node) => {
        const edges = box(node);
        return edges.top >= top - 1 && edges.bottom <= bottom + 1 && edges.right <= window.innerWidth + 1;
      });
      const least = screen.main.dataset.psFit === 'tight' ? KEEPER_TIGHT_PX : KEEPER_MIN_PX;
      return inside && box(keeper.node).height >= least - 1;
    }

    // The most this level's mat can need to hold (see levels.js)
    function busiestMat() {
      const busiest = ps.levels.busiestMat(levelId, saved.highestPrice);
      if (busiest.piles) return busiest.piles.map(pileButton);
      return busiest.coins.map((id) => coins.element(coins.byId(id), sizeOf(id)));
    }

    // Measures with the busiest mat in place, then puts the mat back. All in
    // one go, so nothing is ever drawn.
    function fitsWithBusiestMat() {
      const kept = Array.from(mat.childNodes);
      mat.textContent = '';
      busiestMat().forEach((node) => mat.appendChild(node));
      const fits = shopFits();
      mat.textContent = '';
      kept.forEach((node) => mat.appendChild(node));
      return fits;
    }

    // On arrival and whenever the screen changes size or turns: the usual
    // layout if it fits with the shopkeeper at KEEPER_PX or more, then compact,
    // then the usual layout with a smaller shopkeeper, then tight. On a phone
    // on its side with no room even so, the turn picture.
    function fit() {
      if (!alive) return;
      const data = screen.main.dataset;
      delete data.psTurn;
      delete data.psFit;
      if (window.innerHeight <= SHORT_PX) {
        if (!fitsWithBusiestMat() && window.innerWidth > window.innerHeight) data.psTurn = 'true';
        return;
      }
      if (box(keeper.node).height >= KEEPER_PX && fitsWithBusiestMat()) return;
      data.psFit = 'compact';
      if (fitsWithBusiestMat()) return;
      delete data.psFit;
      if (fitsWithBusiestMat()) return;
      data.psFit = 'tight';
    }

    // A child may pay with more coins than the busiest mat, such as nine 1p
    // coins for 9p. On a phone held upright, when the mat outgrows the layout,
    // this tries the roomier layouts in turn before the mat refuses a coin.
    // The level's own layout returns with the next toy.
    function makeRoom() {
      if (shopFits()) return true;
      if (window.innerHeight <= SHORT_PX) return false;
      const data = screen.main.dataset;
      const was = data.psFit;
      // The layouts roomier than the current one, roomiest last
      const roomier = ['compact', 'tight'].slice(['compact', 'tight'].indexOf(was) + 1);
      for (const layout of roomier) {
        data.psFit = layout;
        if (shopFits()) return true;
      }
      if (was) data.psFit = was;
      else delete data.psFit;
      return false;
    }

    const scale = coins.scaleFor(window.innerWidth, window.innerHeight);
    const sizeOf = (id) => coins.sizeOf(coins.byId(id), scale);
    // The biggest coin that can go on the mat this level. The empty mat is tall
    // enough for it, so the shop never jumps when a bigger coin lands.
    const matCoinIds = [].concat(...round.items.map((it) => (round.kind === 'pay' ? it.purse : [it.coin])));
    screen.main.style.setProperty('--ps-mat-coin', `${Math.max(...matCoinIds.map(sizeOf))}px`);

    // Puts the current toy and its tag on the counter.
    function showToy(entrance) {
      goods.textContent = '';
      const toy = ps.toys.element(item().toy);
      const tag = ps.tag.element(item(), () => {
        if (!busy) sayPrice();
      });
      if (entrance) {
        toy.classList.add('pop');
        tag.classList.add('pop');
      }
      goods.append(toy, tag);
    }

    // What is on the mat, in pence
    const matCoins = () => Array.from(mat.querySelectorAll('.coin'));
    const paid = () => matCoins().reduce((sum, node) => sum + coins.byId(node.dataset.coin).value, 0);
    function refreshTotal() {
      const amount = paid();
      total.textContent = amount ? money.format(amount) : '';
      total.dataset.amount = amount;
    }

    function addToMat(id) {
      const node = coins.element(coins.byId(id), sizeOf(id));
      node.classList.add('pop');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `${id} on the mat. Tap to take it back`);
      node.dataset.matCoin = id;
      // A tap takes it back to the purse.
      node.addEventListener('click', () => {
        if (busy || choosing || !alive) return;
        audio.play('pickup');
        node.remove();
        refreshTotal();
      });
      mat.appendChild(node);
      // On a small screen a mat fuller than the level needs could push the
      // shop into the purse. With no roomier layout left, the coin goes back,
      // as a 13th coin would.
      if (!makeRoom() && matCoins().length > 1) {
        node.remove();
        return false;
      }
      refreshTotal();
      return true;
    }

    function overMat(box) {
      const area = mat.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      return x >= area.left - FORGIVING_PX && x <= area.right + FORGIVING_PX &&
        y >= area.top - FORGIVING_PX && y <= area.bottom + FORGIVING_PX;
    }

    function returnToPurse(node) {
      node.classList.add('returning');
      node.style.transform = '';
      later(() => node.classList.remove('returning'), RETURN_MS);
    }

    // A coin in the purse. Dropped on the mat, a copy goes onto the mat and
    // this one is back in the purse at once, because the purse never runs out.
    function purseCoin(id) {
      const node = coins.element(coins.byId(id), sizeOf(id));
      drag.draggable(node, {
        canStart: () => alive && !busy && !choosing,
        onStart() {
          audio.play('pickup');
          node.classList.add('dragging');
        },
        onEnd() {
          const box = node.getBoundingClientRect();
          node.classList.remove('dragging');
          // At level 4 the mat takes just the one paying coin.
          const limit = round.kind === 'change' ? 1 : MAT_LIMIT;
          if (overMat(box) && matCoins().length < limit) {
            if (addToMat(id)) node.style.transform = '';
            else returnToPurse(node);
          } else {
            returnToPurse(node);
          }
        },
        onCancel() {
          node.classList.remove('dragging');
          returnToPurse(node);
        },
      });
      return node;
    }

    // The purse: the level's coins, or at level 4 this toy's one paying coin.
    function fillPurse() {
      screen.tray.textContent = '';
      const purse = round.kind === 'pay' ? item().purse : [item().coin];
      purse.forEach((id) => {
        screen.tray.appendChild(el('div', { class: 'tray-slot', style: `--size:${sizeOf(id)}px` }, purseCoin(id)));
      });
    }

    // One mistake, counted against the toy's price, with a gentle wobble.
    function mistake(text, spoken, wobbling) {
      mistakes++;
      const key = money.format(item().price);
      mistakesByPrice[key] = (mistakesByPrice[key] || 0) + 1;
      audio.play('wrong');
      wobbling.classList.remove('wobble');
      void wobbling.offsetWidth;
      wobbling.classList.add('wobble');
      say(text, spoken, 'hmm');
    }
    const wrongPayment = (text, spoken) => mistake(text, spoken, till);

    function finishRound() {
      const stars = KMG.stars.forMistakes(mistakes);
      ps.progress.recordRound(levelId, { stars, mistakes: mistakesByPrice, stage: 0, lastStage: 0 });
      const next = ps.levels.levelById(levelId + 1) ? () => play(levelId + 1, context) : null;
      KMG.celebrate(screen.main, {
        stars,
        onAgain: () => play(levelId, context),
        onNext: next,
        onHome: () => context.home(),
      });
    }

    // The toy flies into the bag, then the next toy comes, or the round ends.
    function sell() {
      setBusy(true);
      audio.play('till');
      const tillBox = till.getBoundingClientRect();
      effects.sparkle(tillBox.left + tillBox.width / 2, tillBox.top + tillBox.height / 2);
      say('Thank you!', 'Thank you!', 'happy');

      const toy = goods.querySelector('.ps-toy');
      const from = toy.getBoundingClientRect();
      // Into the bag, or to the shopkeeper when the bag is put away.
      const to = (bag.offsetWidth ? bag : keeper.node).getBoundingClientRect();
      toy.classList.add('ps-toy-bagging');
      toy.style.transform = `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ` +
        `${to.top + to.height / 2 - (from.top + from.height / 2)}px) scale(0.3)`;

      later(() => {
        index++;
        screen.setDone(index);
        mat.textContent = '';
        refreshTotal();
        // Back to the level's own layout, if a full mat needed a roomier one
        fit();
        shortTries = 0;
        wrongPicks = 0;
        choosing = false;
        delete screen.main.dataset.choosing;
        if (index === round.total) {
          goods.textContent = '';
          finishRound();
          return;
        }
        later(() => {
          showToy(true);
          if (round.kind === 'change') fillPurse();
          setBusy(false);
          sayPrice();
        }, NEXT_TOY_MS - BAG_MS);
      }, BAG_MS);
    }

    // Level 4: a tap on a pile of change.
    function pickChange(amount, pile) {
      if (busy || !choosing || !alive) return;
      const { price, coin, change } = item();
      if (amount === change) {
        sell();
        return;
      }
      wrongPicks++;
      const value = coins.byId(coin).value;
      if (wrongPicks === 1) {
        mistake('Have another look.',
          `Have another look. You gave me ${money.words(value)}, and it costs ${money.words(price)}.`, pile);
      } else {
        mistake(`From ${money.format(price)} up to ${money.format(value)} is ${money.format(change)}.`,
          `From ${money.words(price)} up to ${money.words(value)} is ${money.words(change)}.`, pile);
      }
    }

    // Level 4: a pile of change, its coins and its amount
    function pileButton(amount) {
      return el('button', {
        class: 'ps-pile',
        'data-change': amount,
        'aria-label': `${money.format(amount)} change`,
      },
      el('span', { class: 'ps-pile-coins' }, ps.levels.fewestCoins(amount).map((id) => el('span', {
        class: 'coin-mini',
        html: coins.svg(coins.byId(id)),
      }))),
      el('span', { class: 'ps-pile-amount' }, money.format(amount)));
    }

    // Level 4: the shopkeeper takes the coin and holds out three piles of change.
    function offerChange() {
      const it = item();
      choosing = true;
      screen.main.dataset.choosing = 'true';
      audio.play('pickup');
      mat.textContent = '';
      it.choices.forEach((amount) => {
        const pile = pileButton(amount);
        pile.addEventListener('click', () => pickChange(amount, pile));
        mat.appendChild(pile);
      });
      const line = ps.levels.priceLine(it);
      say('Which is your change?',
        `You gave me ${money.words(coins.byId(it.coin).value)}. ${line.spoken} Which is your change?`);
    }

    till.addEventListener('click', () => {
      if (busy || choosing || !alive) return;
      const amount = paid();
      const price = item().price;
      if (amount === 0) {
        sayPrice();
      } else if (round.kind === 'change') {
        offerChange();
      } else if (amount === price) {
        sell();
      } else if (amount < price) {
        shortTries++;
        const more = price - amount;
        if (shortTries === 1) wrongPayment('A little more, please.', 'A little more, please.');
        else wrongPayment(`You need ${money.format(more)} more.`, `You need ${money.words(more)} more.`);
      } else {
        wrongPayment("That's a bit too much.", "That's a bit too much.");
      }
    });

    screen.main.onleave = () => {
      alive = false;
      drag.reset();
      speech.stop();
      window.clearTimeout(talkTimer);
      window.removeEventListener('resize', fit);
    };

    showToy(false);
    fillPurse();
    refreshTotal();
    setBusy(false);
    show(screen.main);
    fit();
    window.addEventListener('resize', fit);
    sayPrice();
  }

  ps.play = play;
})(window.KMG);

// Play Shop's grown-ups area: the shared one (src/shared/parent-area.js) with
// this game's settings and its "prices to practise".
(function (KMG) {
  'use strict';

  const { money, ps, parentArea } = KMG;

  // Changes one saved setting.
  function saveSetting(name, value) {
    const saved = ps.progress.load();
    saved[name] = value;
    ps.progress.save(saved);
  }

  function settings(data) {
    return [
      parentArea.choices({
        title: 'Round length',
        values: ps.progress.ROUND_LENGTHS,
        current: data.roundLength,
        label: (length) => `${length} toys`,
        attr: 'round',
        onPick: (length) => saveSetting('roundLength', length),
      }),
      parentArea.choices({
        title: 'Highest price at level 3',
        values: ps.levels.HIGHEST_PRICES,
        current: data.highestPrice,
        label: (pence) => money.format(pence),
        attr: 'highest',
        onPick: (pence) => saveSetting('highestPrice', pence),
      }),
      parentArea.section('Running total',
        parentArea.toggle('Show how much is on the mat, at levels 2 and 3', 'total', data.showTotal,
          (on) => saveSetting('showTotal', on))),
    ];
  }

  function parent(context) {
    parentArea.show({
      gameName: 'Play Shop',
      store: ps.progress,
      fileName: 'play-shop-progress.json',
      levels: ps.levels.LEVELS,
      settings,
      practise: { title: 'Prices to practise', item: (label) => ps.tag.mini(label) },
      onDone: () => context.home(),
    });
  }

  ps.parent = parent;
})(window.KMG);

// Play Shop's home screen: the shared level picker (src/shared/level-picker.js)
// with a toy and coins on each level's card.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { coins, ps } = KMG;

  const coin = (id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) });
  const toy = (id) => ps.toys.mini(id);

  const LEVEL_ART = {
    1: () => [toy('ball'), coin('5p')],
    2: () => [toy('car'), coin('2p'), coin('1p')],
    3: () => [toy('robot'), coin('20p'), coin('10p')],
    4: () => [coin('20p'), toy('kite'), coin('5p')],
  };

  function home(context) {
    KMG.levelPicker.show({
      title: 'Play Shop',
      levels: ps.levels.LEVELS,
      art: (level) => LEVEL_ART[level.id](),
      store: ps.progress,
      onPlay: (levelId) => ps.play(levelId, context),
      onParent: () => ps.parent(context),
      exit: context.exit,
    });
  }

  ps.home = home;
})(window.KMG);

// Play Shop's entry point: registers the game with the hub or standalone boot.
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { coins, ps } = KMG;

  const coin = (id) => el('span', { class: 'coin-mini', html: coins.svg(coins.byId(id)) });

  // ?debug=1&toys=1 shows every toy with a price tag, and the shopkeeper in
  // several looks and every expression, for checking the artwork.
  function gallery(context) {
    const toys = ps.toys.ALL.map((toy, i) => el('figure', { class: 'ps-gallery-item' },
      ps.toys.element(toy.id),
      ps.tag.element({ price: [1, 7, 10, 23, 50, 99, 2, 5, 12, 35, 48, 20][i] }, null),
      el('figcaption', {}, toy.name)));

    const looks = [1, 2, 3, 4, 5, 6].map((seed) => {
      const keeper = ps.shopkeeper.element(ps.shopkeeper.lookFor(KMG.rng.create(seed)));
      return el('figure', { class: 'ps-gallery-item', 'data-look-seed': seed }, keeper.node, el('figcaption', {}, `Seed ${seed}`));
    });

    const look = ps.shopkeeper.lookFor(context.rng);
    const expressions = ps.shopkeeper.EXPRESSIONS.map((name) => el('figure', { class: 'ps-gallery-item', 'data-expression-sample': name },
      ps.shopkeeper.element(look, name).node, el('figcaption', {}, name)));

    show(el('main', { class: 'ps-gallery', 'data-screen': 'gallery' },
      el('h2', {}, 'Toys'), el('div', { class: 'ps-gallery-grid' }, toys),
      el('h2', {}, 'Shopkeeper looks'), el('div', { class: 'ps-gallery-grid' }, looks),
      el('h2', {}, 'Expressions'), el('div', { class: 'ps-gallery-grid' }, expressions)));
  }

  KMG.registerGame('play-shop', {
    // Called once before any of this game's art is drawn.
    prepare: () => coins.installDefs(),

    // The picture on the hub tile.
    art: () => [ps.toys.mini('teddy'), coin('10p'), ps.toys.mini('duck')],

    open(exit) {
      coins.installDefs();
      const context = { exit, rng: KMG.rng.create(KMG.debug.seed) };
      context.home = () => ps.home(context);

      if (KMG.debug.flag('toys')) gallery(context);
      else if (KMG.debug.level) ps.play(KMG.debug.level, context);
      else context.home();
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

  // The shape of a code. Each game has its own prefix, so with several games the
  // example cannot name one.
  const codeExample = () => {
    const { games } = KMG.build;
    return `${games.length === 1 ? games[0].prefix : 'XXXX'}-XXXXX-XXXXX`;
  };

  function codeScreen() {
    const input = el('input', {
      class: 'code-input',
      type: 'text',
      'data-code-input': true,
      'aria-label': 'Access code',
      placeholder: codeExample(),
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
