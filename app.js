window.KMG_BUILD = {"target":"web","debug":false,"version":"b4ca3fdfd2dd","games":[{"id":"coin-sorter","title":"Coin Sorter","prefix":"COIN"},{"id":"party-planner","title":"Party Planner","prefix":"PRTY"},{"id":"play-shop","title":"Play Shop","prefix":"SHOP"},{"id":"price-detective","title":"Price Detective","prefix":"CLUE"}],"access":{"requireAccessCode":true,"hashes":{"coin-sorter":["09efc35465112c278366fa55160b495a565c45ae27365905d98fbd70301089f9","c2559e31b43e253f001e28a5b484c02ba547134b25b63e126775079d0e36508a","88d47d9c2c16fd82f9df086a281b5f264c5aa2eace8dbdac1be3978c737e7a87","240d7010d83181dd6a26ae0928a67c80fd61b5f9ef771124225ec32b8e756aca","a7a75441f2d1b1f7648359e656af3032b4a170f86051cc9319b91d84bf5afed0","14f12956b4ed06acadc0f4f92499862cf5b0a1c4ed3a5ad166a99cf451f72b55","eede2cf5a790ec582057d5de840004b0469e22ba51c33960c24a9de0b1cb3548","6d11f68eb4d06290178bed073de34c1eb711a199665e619158b6736139920321","8ba1c850676bf74f13b26850bff10e9b1a51b6dac67488f822fc87e89b53ea15","8ed9ff6991bacd5eeae149bc55cd7e17fb765b3342cdd96a1f23fbcdc6464809"],"party-planner":["195c03847cf3a302e41ed0637b16e978f24cdd1c051563ba7d23e62f1668b1e8","a4fd3d5b2a733e241212350e3f8397d4072c9feb8c7c555281067aa48da2c2a4","46f6dae075b508c7917532e6f6b9b3c1526c735d06d21762ab1c29f750de71c1","9b0b7ba1c6011c1818c8f3452dd49fe51a0f56db9e3744690ab4df8f0e57d81c","45d24bd6254412c85b0c96bf423111c0f913ad94b619d99111d40d2d998342bb","bbe6fe2c6fa5946c74eefddb58d598cef8359c8448b4873b631ed2f06ac32993","1ed7c3244df9b18e53337b5032d498bc84c833688cda8f764f3ecd4aaa39cc77","13dce02eb60a9549d7cb10032c847e5159751e66485716d050d6c454e04b06fe","d5d69d74daa162a14cbdf08e149697f06c00cf2390981f001e5e54462b2cb691","12eb40164d6945272aa91749b98e1fae16461d436fb35b9112b3360f2644a00e"],"play-shop":["386674190f3950fa413e6ae0741ef82c5d80d5d79e9fc42015d0d1a29b93ccef","524eaad8a75a4d1b2082a46599cf07ea9731b188f9cebc2d8f3075943d0a3958","1eb600d989acca75e5d6241583f9e41356d7901a4c5c093c4d0554f0f92378b8","52dafefbdaedf8e67cc1ba380b290a604aa5a221179d1d1ec97178466132e31b","93531b7ba8dad6db6bae4605c437d2769fcc751efec81c23fa5eac622da2082d","3b919818415f5b5c408728718479b9aabfb1635917ae00812fa444f6cfdfdd06","271b6d9c9cf6a53b0e9338ca298e8bfd97e9e88111d41f0006d1c958ce234bfd","9311af0df851d8172fc77c1c72367d051d4a02235791e09302f535550aa0066e","ae5ba3d5c9f71153ad725f81396b878281160defdf92d1036a2b3917504b550f","3895bacb303b007859e8abf0fb6c34bef490ac23480a1103b1132d3ecd02cf57"],"price-detective":["a8695500c6d9d7ea86f952236b6f6f88f4b3dbf5557b95281406dd46a2fc32e9","5bc4a4e11b2ec3d3f8089fbe443e30f67d1e668dbe90d0a3425044c05494e262","2188ae905edf12088cd6de0dfd63153055c585af6a4e2404721e2adb7cfcc37e","12efb3a09b040beb8592307a806d8c3af1b3b02cf710ea76bbc4d18505dba27d","39ec6e04b7aec61dd5e71f784f5b7a3e1b43c438e064c38a9230953d2f380606","13954cf1f04628e874ed9876a032385999b2a4d16e5bceec1e75fc6352c55518","87da893e94dac70a2263f42f040b387da5ff5d83d37116d7d2ca80d44d1ae2a2","af0ed0e28bdddada99d3a5ce122b9e175750493b1c60ee6661b08f4e0ecda355","1b9258a2eb5fd7b615254f911ac4d2cb7a9eacfc447b235a3101f72e8dfdf150","872a686ee27deffb75c130862eae9145ce46c8593e6e0b88e3209c153a1489d9"]}}};
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

// The skin tones and hair colours for the games' characters (Play Shop's
// shopkeeper, Party Planner's birthday child), so every child can see someone
// like them, and the characters look like one family across the series.
// Each game picks a look with its own seeded random numbers.
(function (KMG) {
  'use strict';

  KMG.looks = {
    SKINS: ['#f7d7c4', '#e3ad84', '#b97b52', '#7b4a2e'],
    HAIR_COLOURS: ['#2e1f17', '#6b4226', '#b8622d', '#e3c06e'],
  };
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
    // A rubber stamp landing: a soft low "thunk" and a light paper tap.
    stamp: [
      { frequency: 180, slideTo: 90, length: 0.12, volume: 0.18, type: 'triangle' },
      { frequency: 620, start: 0.01, length: 0.05, volume: 0.04, type: 'triangle' },
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
//   KMG.money.number(500)  "five hundred"   (any whole number from 0 to 1,000)
(function (KMG) {
  'use strict';

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  // 0 to 1,000 in words, the UK way: "twenty-three", "five hundred",
  // "two hundred and fifty", "one thousand". Amounts of money only ever use
  // 0 to 99 here (pence, and pounds up to £99), so they read as before.
  function number(n) {
    if (n === 1000) return 'one thousand';
    if (n >= 100) {
      const rest = n % 100;
      const hundreds = `${ONES[Math.floor(n / 100)]} hundred`;
      return rest ? `${hundreds} and ${number(rest)}` : hundreds;
    }
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

  KMG.money = { format, words, parse, number };
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
      // data-count lets the stylesheet lay out a game with more levels
      el('div', { class: 'level-grid', 'data-count': options.levels.length },
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
//     practise,        { title, item(key), include(key)? }: what the child finds
//                      hardest, from the mistakes counted per key (a coin, a
//                      price, ...). include(key), if given, leaves some keys out
//     notes(data)?,    optional lines under that list, for anything else the
//                      game counts (Price Detective's big pack trick)
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

    const include = options.practise.include || (() => true);
    const confused = store.confused(data, Infinity).filter(([key]) => include(key)).slice(0, PRACTISE_LIMIT);
    const practise = confused.length
      ? el('ul', { class: 'confused' }, confused.map(([key, count]) => el('li', { 'data-confused': key },
        options.practise.item(key),
        count === 1 ? '1 mistake' : `${count} mistakes`)))
      : el('p', { class: 'parent-note', 'data-confused-none': true }, 'No mistakes yet.');

    return section('Progress', el('ul', { class: 'progress-list' }, rows), el('h3', {}, options.practise.title), practise,
      ...(options.notes ? options.notes(data) : []));
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

// Party Planner's party items, drawn as simple SVG on a 120 by 120 canvas, in
// the same flat pastel style and soft outline as the other games' art.
// Original and unbranded: no shop, brand or licensed party theme.
//
// Each item belongs to a line of the party list:
//   needs   food, drinks, cake, bags: enough for every guest
//   wishes  balloons, bunting, hats, game, facepaints, magician, castle
// A need is sold in packs that serve a number of people ("6 slices"); a wish
// is bought once.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  KMG.pp = KMG.pp || {};

  // The soft outline every drawing uses
  const LINE = 'stroke="#24324a" stroke-opacity="0.22" stroke-width="3" stroke-linejoin="round"';
  const INK = '#24324a';

  const CORAL = '#ff9d8a';
  const SUN = '#ffd56b';
  const SKY = '#9cc9f5';
  const LILAC = '#cfc8f2';
  const MINT = '#8fd3c7';
  const CLOUD = '#f4f7fb';
  const LEAF = '#9ad48a';
  const ORANGE = '#ffb35c';
  const CRUST = '#e8b77a';
  const TOMATO = '#e8665a';

  const DRAWINGS = {
    sandwiches: `
      <ellipse cx="60" cy="94" rx="52" ry="14" fill="${CLOUD}" ${LINE}/>
      <path d="M18 88 L52 38 L62 88 Z" fill="#f6e3c8" ${LINE}/>
      <path d="M26 82 L52 46 L55 54 L33 84 Z" fill="${LEAF}"/>
      <path d="M58 88 L74 34 L104 88 Z" fill="#fff8ec" ${LINE}/>
      <path d="M66 82 L75 46 L80 52 L73 84 Z" fill="${CORAL}"/>`,

    pizza: `
      <circle cx="60" cy="62" r="48" fill="${CRUST}" ${LINE}/>
      <circle cx="60" cy="62" r="39" fill="${CORAL}"/>
      <g fill="#ffe28f"><circle cx="44" cy="48" r="9"/><circle cx="76" cy="56" r="10"/><circle cx="54" cy="80" r="9"/><circle cx="80" cy="82" r="7"/></g>
      <g fill="${TOMATO}"><circle cx="62" cy="40" r="6"/><circle cx="38" cy="70" r="6"/><circle cx="70" cy="72" r="5"/></g>
      <path d="M60 23 L60 101 M21 62 L99 62 M33 35 L87 89 M87 35 L33 89" stroke="#c98a4a" stroke-opacity="0.5" stroke-width="2"/>`,

    'sausage-rolls': `
      <ellipse cx="60" cy="96" rx="52" ry="13" fill="${CLOUD}" ${LINE}/>
      <rect x="16" y="66" width="44" height="22" rx="11" fill="${CRUST}" ${LINE}/>
      <rect x="60" y="66" width="44" height="22" rx="11" fill="${CRUST}" ${LINE}/>
      <rect x="38" y="44" width="44" height="22" rx="11" fill="#f0c48a" ${LINE}/>
      <g fill="#c9715a"><ellipse cx="18" cy="77" rx="4" ry="8"/><ellipse cx="102" cy="77" rx="4" ry="8"/><ellipse cx="80" cy="55" rx="4" ry="8"/></g>`,

    fruit: `
      <circle cx="44" cy="54" r="15" fill="${ORANGE}" ${LINE}/>
      <g fill="#b48fd8"><circle cx="70" cy="50" r="7"/><circle cx="80" cy="50" r="7"/><circle cx="75" cy="40" r="7"/><circle cx="85" cy="60" r="7"/><circle cx="74" cy="61" r="7"/></g>
      <path d="M48 68 Q60 40 96 50 Q90 60 60 70 Z" fill="${SUN}" ${LINE}/>
      <path d="M14 66 L106 66 Q100 102 60 102 Q20 102 14 66 Z" fill="${MINT}" ${LINE}/>`,

    juice: `
      <rect x="20" y="40" width="36" height="58" rx="5" fill="${CLOUD}" ${LINE}/>
      <rect x="20" y="56" width="36" height="26" fill="${ORANGE}"/>
      <path d="M48 40 L52 18 L60 16" fill="none" stroke="${CORAL}" stroke-width="4" stroke-linecap="round"/>
      <rect x="64" y="44" width="36" height="58" rx="5" fill="${CLOUD}" ${LINE}/>
      <rect x="64" y="60" width="36" height="26" fill="${LEAF}"/>
      <path d="M92 44 L96 22 L104 20" fill="none" stroke="${SKY}" stroke-width="4" stroke-linecap="round"/>`,

    squash: `
      <rect x="49" y="8" width="22" height="14" rx="4" fill="${CORAL}" ${LINE}/>
      <path d="M49 22 L71 22 L71 34 Q90 42 90 60 L90 102 Q90 110 82 110 L38 110 Q30 110 30 102 L30 60 Q30 42 49 34 Z" fill="#ffe2dc" ${LINE}/>
      <path d="M32 62 L88 62 L88 102 Q88 108 82 108 L38 108 Q32 108 32 102 Z" fill="${CORAL}"/>
      <circle cx="60" cy="84" r="11" fill="${CLOUD}"/>`,

    lemonade: `
      <rect x="49" y="8" width="22" height="14" rx="4" fill="${MINT}" ${LINE}/>
      <path d="M49 22 L71 22 L71 34 Q90 42 90 60 L90 102 Q90 110 82 110 L38 110 Q30 110 30 102 L30 60 Q30 42 49 34 Z" fill="#effbe3" ${LINE}/>
      <path d="M32 56 L88 56 L88 102 Q88 108 82 108 L38 108 Q32 108 32 102 Z" fill="#ddf3a4"/>
      <g fill="#ffffff"><circle cx="46" cy="90" r="4"/><circle cx="62" cy="76" r="3"/><circle cx="74" cy="94" r="5"/><circle cx="54" cy="66" r="3"/></g>`,

    cake: `
      <path d="M44 28 L44 14 M60 26 L60 10 M76 28 L76 14" stroke="${SKY}" stroke-width="5" stroke-linecap="round"/>
      <g fill="${SUN}"><ellipse cx="44" cy="9" rx="4" ry="6"/><ellipse cx="60" cy="5" rx="4" ry="6"/><ellipse cx="76" cy="9" rx="4" ry="6"/></g>
      <rect x="18" y="34" width="84" height="66" rx="12" fill="#ffe2ec" ${LINE}/>
      <path d="M18 46 Q18 34 30 34 L90 34 Q102 34 102 46 L102 54 Q94 64 86 54 Q78 64 70 54 Q62 64 54 54 Q46 64 38 54 Q30 64 22 54 Q18 52 18 54 Z" fill="${CLOUD}"/>
      <path d="M18 76 L102 76" stroke="${CORAL}" stroke-width="6"/>
      <ellipse cx="60" cy="102" rx="52" ry="8" fill="${CLOUD}" ${LINE}/>`,

    cupcakes: `
      <path d="M14 66 L50 66 L46 102 L18 102 Z" fill="${SKY}" ${LINE}/>
      <path d="M12 66 Q12 42 32 42 Q52 42 52 66 Z" fill="#ffe2ec" ${LINE}/>
      <circle cx="32" cy="38" r="6" fill="${TOMATO}"/>
      <path d="M68 66 L104 66 L100 102 L72 102 Z" fill="${LILAC}" ${LINE}/>
      <path d="M66 66 Q66 42 86 42 Q106 42 106 66 Z" fill="#fff3c4" ${LINE}/>
      <circle cx="86" cy="38" r="6" fill="${TOMATO}"/>`,

    'bags-plain': `
      <path d="M44 40 Q44 22 60 22 Q76 22 76 40" fill="none" stroke="#7b6fbf" stroke-width="5" stroke-linecap="round"/>
      <path d="M26 40 L94 40 L100 106 Q100 110 96 110 L24 110 Q20 110 20 106 Z" fill="${LILAC}" ${LINE}/>
      <circle cx="60" cy="74" r="12" fill="${CLOUD}"/>`,

    'bags-filled': `
      <path d="M44 40 Q44 22 60 22 Q76 22 76 40" fill="none" stroke="#2a8580" stroke-width="5" stroke-linecap="round"/>
      <path d="M38 40 L44 14 L50 40 Z" fill="${SUN}" ${LINE}/>
      <path d="M72 40 L74 16" stroke="${INK}" stroke-opacity="0.4" stroke-width="3"/>
      <circle cx="74" cy="14" r="8" fill="${CORAL}" ${LINE}/>
      <path d="M26 40 L94 40 L100 106 Q100 110 96 110 L24 110 Q20 110 20 106 Z" fill="${MINT}" ${LINE}/>
      <path d="M60 64 L64 74 L75 75 L67 82 L69 93 L60 87 L51 93 L53 82 L45 75 L56 74 Z" fill="${SUN}"/>`,

    balloons: `
      <path d="M36 70 Q40 92 58 112 M60 64 Q60 90 58 112 M84 68 Q78 92 58 112" fill="none" stroke="${INK}" stroke-opacity="0.4" stroke-width="2"/>
      <ellipse cx="36" cy="44" rx="20" ry="25" fill="${CORAL}" ${LINE}/>
      <ellipse cx="84" cy="42" rx="20" ry="25" fill="${SKY}" ${LINE}/>
      <ellipse cx="60" cy="36" rx="20" ry="25" fill="${SUN}" ${LINE}/>
      <g fill="#ffffff" opacity="0.6"><ellipse cx="29" cy="34" rx="4" ry="7"/><ellipse cx="53" cy="26" rx="4" ry="7"/><ellipse cx="77" cy="32" rx="4" ry="7"/></g>`,

    bunting: `
      <path d="M6 30 Q60 58 114 30" fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="3"/>
      <path d="M12 33 L28 39 L16 64 Z" fill="${CORAL}" ${LINE}/>
      <path d="M34 41 L52 45 L40 72 Z" fill="${SUN}" ${LINE}/>
      <path d="M58 45 L76 44 L67 74 Z" fill="${MINT}" ${LINE}/>
      <path d="M82 42 L98 37 L94 68 Z" fill="${LILAC}" ${LINE}/>
      <path d="M102 35 L112 31 L114 58 Z" fill="${SKY}" ${LINE}/>`,

    hats: `
      <path d="M14 104 L40 32 L66 104 Z" fill="${SKY}" ${LINE}/>
      <path d="M22 82 L56 76 M30 60 L48 57" stroke="${CLOUD}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="40" cy="30" r="7" fill="${SUN}" ${LINE}/>
      <path d="M54 104 L80 32 L106 104 Z" fill="${CORAL}" ${LINE}/>
      <path d="M62 82 L96 76 M70 60 L88 57" stroke="${CLOUD}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="80" cy="30" r="7" fill="${MINT}" ${LINE}/>`,

    game: `
      <rect x="18" y="44" width="84" height="62" rx="8" fill="${SUN}" ${LINE}/>
      <rect x="54" y="44" width="12" height="62" fill="${CORAL}"/>
      <rect x="18" y="68" width="84" height="12" fill="${CORAL}"/>
      <path d="M60 44 Q36 22 34 40 Q40 52 60 44 Q84 22 86 40 Q80 52 60 44 Z" fill="${CORAL}" ${LINE}/>`,

    facepaints: `
      <path d="M14 70 Q12 34 56 30 Q104 28 106 62 Q106 90 74 92 Q66 92 66 100 Q64 110 50 108 Q16 104 14 70 Z" fill="${CLOUD}" ${LINE}/>
      <g><circle cx="38" cy="52" r="9" fill="${CORAL}"/><circle cx="62" cy="46" r="9" fill="${SKY}"/><circle cx="86" cy="54" r="9" fill="${SUN}"/><circle cx="36" cy="78" r="9" fill="${LEAF}"/><circle cx="84" cy="76" r="8" fill="${LILAC}"/></g>
      <path d="M66 66 L104 104" stroke="#9b7653" stroke-width="6" stroke-linecap="round"/>
      <path d="M62 62 L68 68" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,

    magician: `
      <path d="M86 40 L108 18" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M104 22 L110 16" stroke="${CLOUD}" stroke-width="6" stroke-linecap="round"/>
      <rect x="30" y="30" width="56" height="62" rx="6" fill="#3a4766" ${LINE}/>
      <rect x="30" y="74" width="56" height="10" fill="${CORAL}"/>
      <ellipse cx="58" cy="94" rx="44" ry="10" fill="#3a4766" ${LINE}/>
      <path d="M16 30 L19 38 L27 38 L21 43 L23 51 L16 46 L9 51 L11 43 L5 38 L13 38 Z" fill="${SUN}"/>
      <path d="M100 56 L102 61 L107 61 L103 64 L104 69 L100 66 L96 69 L97 64 L93 61 L98 61 Z" fill="${SUN}"/>`,

    castle: `
      <rect x="14" y="58" width="92" height="44" rx="10" fill="${SKY}" ${LINE}/>
      <rect x="10" y="30" width="22" height="72" rx="10" fill="${CORAL}" ${LINE}/>
      <rect x="88" y="30" width="22" height="72" rx="10" fill="${CORAL}" ${LINE}/>
      <circle cx="21" cy="28" r="12" fill="${SUN}" ${LINE}/>
      <circle cx="99" cy="28" r="12" fill="${SUN}" ${LINE}/>
      <path d="M44 102 L44 76 Q60 62 76 76 L76 102 Z" fill="${LILAC}" ${LINE}/>
      <rect x="8" y="100" width="104" height="10" rx="5" fill="${MINT}" ${LINE}/>`,
  };

  // The party list: the needs, served per person, and the wishes, bought once.
  // `one` and `many` say an item ("a pizza", "two pizzas"); `serves` words its
  // pack: "serves 4", "6 slices", "makes 8 cups"; `packs` are the sizes it
  // comes in. Each line's `label` heads its row in the shop.
  const LINES = [
    { id: 'food', kind: 'need', label: 'Food', spoken: 'food' },
    { id: 'drinks', kind: 'need', label: 'Drinks', spoken: 'drinks' },
    { id: 'cake', kind: 'need', label: 'Cake', spoken: 'cake' },
    { id: 'bags', kind: 'need', label: 'Party bags', spoken: 'party bags' },
    { id: 'wish', kind: 'wish', label: 'Wishes', spoken: 'wishes' },
  ];

  const ITEMS = [
    { id: 'sandwiches', line: 'food', name: 'Sandwiches', one: 'a plate of sandwiches', many: 'plates of sandwiches', serves: (n) => `serves ${n}`, servesWords: (w) => `serves ${w}`, packs: [4, 6, 8] },
    { id: 'pizza', line: 'food', name: 'Pizza', one: 'a pizza', many: 'pizzas', serves: (n) => `${n} slices`, servesWords: (w) => `${w} slices`, packs: [4, 6, 8] },
    { id: 'sausage-rolls', line: 'food', name: 'Sausage rolls', one: 'a pack of sausage rolls', many: 'packs of sausage rolls', serves: (n) => `${n} rolls`, servesWords: (w) => `${w} rolls`, packs: [4, 6, 10] },
    { id: 'fruit', line: 'food', name: 'Fruit platter', one: 'a fruit platter', many: 'fruit platters', serves: (n) => `serves ${n}`, servesWords: (w) => `serves ${w}`, packs: [4, 6, 8] },
    { id: 'juice', line: 'drinks', name: 'Juice cartons', one: 'a pack of juice cartons', many: 'packs of juice cartons', serves: (n) => `${n} cartons`, servesWords: (w) => `${w} cartons`, packs: [4, 6, 8] },
    { id: 'squash', line: 'drinks', name: 'Squash', one: 'a bottle of squash', many: 'bottles of squash', serves: (n) => `makes ${n} cups`, servesWords: (w) => `makes ${w} cups`, packs: [6, 8, 10] },
    { id: 'lemonade', line: 'drinks', name: 'Lemonade', one: 'a bottle of lemonade', many: 'bottles of lemonade', serves: (n) => `${n} cups`, servesWords: (w) => `${w} cups`, packs: [4, 6, 8] },
    { id: 'cake', line: 'cake', name: 'Birthday cake', one: 'a birthday cake', many: 'birthday cakes', serves: (n) => `serves ${n}`, servesWords: (w) => `serves ${w}`, packs: [8, 12] },
    { id: 'cupcakes', line: 'cake', name: 'Cupcakes', one: 'a box of cupcakes', many: 'boxes of cupcakes', serves: (n) => `${n} cupcakes`, servesWords: (w) => `${w} cupcakes`, packs: [4, 6, 8] },
    { id: 'bags-plain', line: 'bags', name: 'Party bags', one: 'a pack of party bags', many: 'packs of party bags', serves: (n) => `${n} bags`, servesWords: (w) => `${w} bags`, packs: [4, 5, 6, 8] },
    { id: 'bags-filled', line: 'bags', name: 'Filled party bags', one: 'a pack of filled party bags', many: 'packs of filled party bags', serves: (n) => `${n} bags`, servesWords: (w) => `${w} bags`, packs: [4, 5, 6, 8] },
    { id: 'balloons', line: 'wish', name: 'Balloons', one: 'balloons', size: 'small' },
    { id: 'bunting', line: 'wish', name: 'Bunting', one: 'bunting', size: 'small' },
    { id: 'hats', line: 'wish', name: 'Party hats', one: 'party hats', size: 'small' },
    { id: 'game', line: 'wish', name: 'Pass the parcel', one: 'a pass the parcel game', size: 'small' },
    { id: 'facepaints', line: 'wish', name: 'Face paints', one: 'face paints', size: 'small' },
    { id: 'magician', line: 'wish', name: 'A magician', one: 'a magician', size: 'big' },
    { id: 'castle', line: 'wish', name: 'Bouncy castle', one: 'a bouncy castle', size: 'big' },
  ];

  const byId = (id) => ITEMS.find((item) => item.id === id);
  const lineById = (id) => LINES.find((line) => line.id === id);
  const inLine = (lineId) => ITEMS.filter((item) => item.line === lineId);

  // The drawing alone, for placing inside a bigger picture (the party scene)
  const drawing = (id) => DRAWINGS[id];

  function svg(id) {
    return `<svg class="pp-item-svg" viewBox="0 0 120 120" role="img" aria-label="${byId(id).name}">${DRAWINGS[id]}</svg>`;
  }

  // An item at any size: the element fills whatever box the stylesheet gives it.
  const element = (id, className = 'pp-item') => el('span', { class: className, 'data-item': id, html: svg(id) });
  const mini = (id) => element(id, 'pp-item-mini');

  KMG.pp.items = { ALL: ITEMS, LINES, byId, lineById, inLine, drawing, svg, element, mini };
})(window.KMG);

// The birthday child: a simple, friendly character seen from the chest up,
// drawn as SVG on a 200 by 200 canvas from a dozen rounded shapes, the same
// way as Play Shop's shopkeeper. Younger-looking, with a party hat and a
// birthday badge. Original and unbranded, with no name: it is "my party".
//
// Looks change from party to party (picked by the seeded random numbers), so
// every child can see someone like them: the shared skin tones and hair
// colours (src/shared/looks.js) and 3 hair shapes. Four expressions, all
// friendly, never cross or sad:
//   idle      a smile
//   talking   the mouth opens and closes while a line is spoken
//   excited   happy-arc eyes, a big grin and a small jump, when the party happens
//   thinking  a head tilt, one raised eyebrow and a finger to the chin, for
//             "Hmm, what could we swap?"
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { SKINS, HAIR_COLOURS } = KMG.looks;

  const INK = '#24324a';
  const LINE = 'stroke="#24324a" stroke-opacity="0.2" stroke-width="3" stroke-linejoin="round"';
  const MOUTH = '#8a3b44';
  const SHIRTS = ['#ffd56b', '#8fd3c7', '#cfc8f2', '#9cc9f5'];
  const HATS = [['#ff9d8a', '#ffd56b'], ['#9cc9f5', '#ff9d8a'], ['#8fd3c7', '#cfc8f2']];

  const HAIR_SHAPES = ['short', 'bunches', 'curly'];
  const EXPRESSIONS = ['idle', 'talking', 'excited', 'thinking'];

  // One look for a party, from the game's seeded random numbers.
  function lookFor(rng) {
    return {
      skin: rng.pick(SKINS),
      hair: rng.pick(HAIR_COLOURS),
      shape: rng.pick(HAIR_SHAPES),
      shirt: rng.pick(SHIRTS),
      hat: rng.int(HATS.length),
    };
  }

  // Hair behind the head (bunches) and in front of it (the fringe or curls)
  function hairBehind(look) {
    if (look.shape !== 'bunches') return '';
    return `<circle cx="44" cy="96" r="17" fill="${look.hair}" ${LINE}/><circle cx="156" cy="96" r="17" fill="${look.hair}" ${LINE}/>`;
  }

  function hairFront(look) {
    if (look.shape === 'curly') {
      const curls = [[56, 76, 13], [60, 56, 14], [78, 44, 15], [100, 40, 15], [122, 44, 15], [140, 56, 14], [144, 76, 13]];
      return curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${look.hair}"/>`).join('');
    }
    return `<path d="M52 86 Q48 38 100 36 Q152 38 148 86 Q142 62 122 58 Q100 70 78 58 Q58 62 52 86 Z" fill="${look.hair}"/>`;
  }

  // A cone party hat with stripes and a pompom, tipped a little to one side
  function hat(look) {
    const [colour, stripe] = HATS[look.hat];
    return `<g transform="rotate(-8 100 46)">
      <path d="M76 50 L100 2 L124 50 Z" fill="${colour}" ${LINE}/>
      <path d="M84 36 L116 36 M91 22 L109 22" stroke="${stripe}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="100" cy="4" r="7" fill="${stripe}" ${LINE}/>
    </g>`;
  }

  function face(expression) {
    const brows = expression === 'thinking'
      ? `<path d="M76 70 Q84 66 92 68 M108 64 Q116 58 124 64" fill="none" stroke="${INK}" stroke-opacity="0.65" stroke-width="3.5" stroke-linecap="round"/>`
      : `<path d="M76 74 Q84 69 92 72 M108 72 Q116 69 124 74" fill="none" stroke="${INK}" stroke-opacity="0.65" stroke-width="3.5" stroke-linecap="round"/>`;
    const eyes = expression === 'excited'
      ? `<path d="M77 90 Q84 82 91 90 M109 90 Q116 82 123 90" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
      : `<circle cx="84" cy="88" r="5.5" fill="${INK}"/><circle cx="116" cy="88" r="5.5" fill="${INK}"/>`;
    const smile = `<path d="M86 106 Q100 117 114 106" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    let mouth = smile;
    if (expression === 'excited') {
      mouth = `<path d="M82 103 Q100 128 118 103 Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    } else if (expression === 'talking') {
      // Two mouths; the stylesheet shows one, then the other.
      mouth = `<g class="pp-mouth-shut">${smile}</g>` +
        `<g class="pp-mouth-open"><ellipse cx="100" cy="109" rx="10" ry="8" fill="${MOUTH}" stroke="${INK}" stroke-width="3"/></g>`;
    } else if (expression === 'thinking') {
      // Pursed to one side: wondering, never worried.
      mouth = `<path d="M96 110 Q106 112 114 106" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    }
    const cheeks = `<ellipse cx="70" cy="104" rx="8" ry="5" fill="#ff9d8a" opacity="0.45"/><ellipse cx="130" cy="104" rx="8" ry="5" fill="#ff9d8a" opacity="0.45"/>`;
    return brows + eyes + cheeks + mouth;
  }

  function svg(look, expression) {
    // Thinking: a hand comes up, one finger at the chin.
    const hand = expression === 'thinking'
      ? `<path d="M128 200 L128 150" stroke="${look.shirt}" stroke-width="22"/>
         <circle cx="128" cy="150" r="11" fill="${look.shirt}"/>
         <circle cx="124" cy="132" r="13" fill="${look.skin}" ${LINE}/>
         <path d="M118 124 L112 118" stroke="${look.skin}" stroke-width="7" stroke-linecap="round"/>`
      : '';
    return `<svg class="pp-child-svg" viewBox="0 0 200 200" aria-hidden="true">
      <path d="M34 200 Q34 146 100 142 Q166 146 166 200 Z" fill="${look.shirt}" ${LINE}/>
      <circle cx="68" cy="176" r="13" fill="#ffffff" ${LINE}/>
      <path d="M68 168 L70.5 173.5 L76.5 174 L72 178 L73.5 184 L68 181 L62.5 184 L64 178 L59.5 174 L65.5 173.5 Z" fill="#e8a917"/>
      <g class="pp-child-head">
        <rect x="88" y="120" width="24" height="26" rx="8" fill="${look.skin}"/>
        ${hairBehind(look)}
        <circle cx="52" cy="92" r="9" fill="${look.skin}" ${LINE}/>
        <circle cx="148" cy="92" r="9" fill="${look.skin}" ${LINE}/>
        <circle cx="100" cy="88" r="48" fill="${look.skin}" ${LINE}/>
        ${hairFront(look)}
        ${hat(look)}
        ${face(expression)}
      </g>
      ${hand}
    </svg>`;
  }

  // The birthday child on screen. setExpression swaps the face, and the
  // stylesheet animates by expression (.pp-child[data-expression="..."]).
  function element(look, expression = 'idle') {
    const node = el('div', {
      class: 'pp-child',
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

  KMG.pp.child = { lookFor, element, svg, EXPRESSIONS, HAIR_SHAPES };
})(window.KMG);

// The party scene: a room drawn as SVG on a 400 by 260 canvas that fills with
// what was bought. Food, drinks and the cake go on the table, the party bags in
// a row on the floor, and each wish in its own place: balloons on the wall,
// bunting across the top, the bouncy castle outside the window, the magician's
// hat on a stand. A wish not bought is simply absent, never shown as missing.
// The birthday child is drawn by the play screen, in front of the room.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { items } = KMG.pp;

  const LINE = 'stroke="#24324a" stroke-opacity="0.18" stroke-width="3" stroke-linejoin="round"';

  // Where each item goes: x, y and size, in the room's 400 by 260 canvas.
  // Needs go by their line (whichever choice was bought), wishes by item.
  const SPOTS = {
    food: [92, 104, 62],
    cake: [168, 92, 70],
    drinks: [246, 104, 62],
    bags: [18, 200, 52],
    balloons: [8, 18, 86],
    bunting: [96, 0, 200],
    castle: [300, 34, 72],
    magician: [338, 150, 56],
    hats: [116, 202, 50],
    game: [176, 206, 46],
    facepaints: [226, 206, 46],
  };

  const place = (id, [x, y, size]) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 120 120">${items.drawing(id)}</svg>`;

  // `bought` is the list of item ids in the basket, needs and wishes.
  function svg(bought) {
    const has = (id) => bought.includes(id);
    const needIn = (line) => bought.find((id) => items.byId(id).line === line);
    const things = [];
    ['food', 'cake', 'drinks', 'bags'].forEach((line) => {
      const id = needIn(line);
      if (id) things.push(place(id, SPOTS[line]));
    });
    ['hats', 'game', 'facepaints'].forEach((id) => { if (has(id)) things.push(place(id, SPOTS[id])); });

    return `<svg class="pp-scene-svg" viewBox="0 0 400 260" role="img" aria-label="The party">
      <rect x="0" y="0" width="400" height="196" fill="#fdf3e7"/>
      <rect x="0" y="196" width="400" height="64" fill="#e9d3b4"/>
      <rect x="290" y="26" width="92" height="88" rx="8" fill="#dff1fb" ${LINE}/>
      ${has('castle') ? place('castle', SPOTS.castle) : ''}
      <path d="M336 26 L336 114 M290 70 L382 70" stroke="#ffffff" stroke-width="5"/>
      <rect x="290" y="26" width="92" height="88" rx="8" fill="none" stroke="#c9a77f" stroke-width="5"/>
      ${has('balloons') ? place('balloons', SPOTS.balloons) : ''}
      ${has('bunting') ? place('bunting', SPOTS.bunting) : ''}
      ${has('magician') ? place('magician', SPOTS.magician) : ''}
      <rect x="80" y="160" width="240" height="14" rx="6" fill="#ff9d8a" ${LINE}/>
      <path d="M96 174 L96 214 M304 174 L304 214" stroke="#c98a6a" stroke-width="7" stroke-linecap="round"/>
      ${things.join('')}
    </svg>`;
  }

  const element = (bought) => el('div', { class: 'pp-scene', 'data-scene': bought.join(' '), html: svg(bought) });

  KMG.pp.scene = { svg, element, SPOTS };
})(window.KMG);

// What each Party Planner level asks for, and the sums behind a plan. Plain
// logic with no drawing: `build` turns a level and the parent's settings into
// one round, a list of parties, and `check` says what is wrong with a basket.
//
// A party:
//   { level, budget, friends, people, surprise, look, lines }
//   budget    whole pence
//   people    the friends plus the birthday child; `surprise` more arrive at
//             level 5, the first time the basket has enough of every need
//   lines     the party list, each { id, kind, choices }: the four needs
//             (food, drinks, cake, bags), then the wishes
//   a choice  { key, item, price, pack, offer }: a need's pack serves `pack`
//             people; a wish has no pack. `offer` is null, '3for2' or 'half'
// A basket is { [choice key]: number of packs }.
//
// Every party can be planned within budget with every need met for the final
// number of people and a wish still affordable (the spec's "Number rules").
(function (KMG) {
  'use strict';

  const { money, pp } = KMG;
  const { items } = pp;

  const LEVELS = [
    { id: 1, kind: 'party', text: 'Shopping list', spoken: 'Plan my party! Stay within the money.' },
    { id: 2, kind: 'party', text: 'Pounds and pence', spoken: 'Plan my party! Keep an eye on the money left.' },
    { id: 3, kind: 'party', text: 'Enough for everyone', spoken: 'Plan my party! Buy enough for everyone.' },
    { id: 4, kind: 'party', text: 'Needs and wishes', spoken: 'Plan my party! Needs first, then wishes.' },
    { id: 5, kind: 'party', text: 'The big party', spoken: 'Plan my big party!' },
  ];

  const levelById = (id) => LEVELS.find((level) => level.id === id);

  // Each level's rules, from the spec. Prices in pence; `step` is what every
  // price is a multiple of. `cover` means one pack of any choice serves
  // everyone. `choices` is how many choices each need has (where the line has
  // that many items). `needsShare`: the cheapest way to meet the needs costs at
  // least this share of the budget, so the money is always a real limit.
  const CONFIG = {
    1: { budget: 1000, friends: [3], cover: true, step: 100, needPrice: [100, 600], choices: 2, small: 1, big: 0, smallPrice: [100, 300], dearOver: true },
    2: { budget: 1500, friends: [5], cover: true, step: 5, needPrice: [80, 500], choices: 2, small: 2, big: 0, smallPrice: [100, 300], dearOver: true },
    3: { budget: 2000, friends: [6, 7], cover: false, step: 5, needPrice: [80, 450], choices: 2, small: 2, big: 0, smallPrice: [100, 300], needsShare: 0.5 },
    4: { budget: 3000, friends: [7], cover: false, step: 5, needPrice: [80, 450], choices: 3, small: 3, big: 2, smallPrice: [100, 450], bigPrice: [800, 1500], bigClash: true, needsShare: 0.5 },
    5: { budget: 5000, friends: [9], cover: false, step: 10, needPrice: [100, 600], choices: 3, small: 3, big: 2, smallPrice: [100, 500], bigPrice: [1000, 1800], offer: true, surprise: 2, needsShare: 0.4, change: true },
  };

  const NEEDS = ['food', 'drinks', 'cake', 'bags'];
  const MOST_PRICE = 2000;
  const SURPRISE = 2;

  const between = (rng, low, high) => low + rng.int(high - low + 1);
  // A price from `range`, a multiple of `step`
  const priceIn = (rng, [low, high], step) => step * between(rng, Math.ceil(low / step), Math.floor(high / step));

  // Keeps calling `make` until it returns something, a few hundred times at
  // most. The rules always leave a way through, so running out means a rule
  // has been changed so that it cannot be met: stop loudly rather than hang.
  function attempt(make) {
    for (let tries = 0; tries < 2000; tries++) {
      const result = make();
      if (result) return result;
    }
    throw new Error('Party Planner could not make a party that keeps the rules');
  }

  // ---- The sums ----

  // What `count` packs of a choice cost, with any offer
  function cost(choice, count) {
    if (choice.offer === '3for2') return choice.price * (count - Math.floor(count / 3));
    if (choice.offer === 'half') return (choice.price / 2) * count;
    return choice.price * count;
  }

  // How many packs of a need's choice serve everyone
  const packsFor = (choice, people) => Math.ceil(people / choice.pack);

  const choicesOf = (party) => [].concat(...party.lines.map((line) => line.choices));
  const lineOf = (party, id) => party.lines.find((line) => line.id === id);

  function spent(party, basket) {
    return choicesOf(party).reduce((sum, choice) => sum + cost(choice, basket[choice.key] || 0), 0);
  }

  // How many people a need's packs in the basket serve
  function servings(party, basket, lineId) {
    return lineOf(party, lineId).choices.reduce((sum, choice) => sum + choice.pack * (basket[choice.key] || 0), 0);
  }

  // The wishes in the basket
  const extras = (party, basket) => lineOf(party, 'wish').choices.filter((choice) => basket[choice.key] > 0).length;

  // Whether every need serves `people`
  const needsMet = (party, basket, people) => NEEDS.every((id) => servings(party, basket, id) >= people);

  // What "Party time!" finds, one problem at a time, over budget first:
  //   { problem: 'over-budget', over }
  //   { problem: 'missing', line }                 none of a need at all
  //   { problem: 'not-enough', line, have }        some, but not for everyone
  //   { problem: null, left, extras }              the party happens
  function check(party, basket, people) {
    const total = spent(party, basket);
    if (total > party.budget) return { problem: 'over-budget', over: total - party.budget };
    for (const id of NEEDS) {
      const have = servings(party, basket, id);
      if (have === 0) return { problem: 'missing', line: id };
      if (have < people) return { problem: 'not-enough', line: id, have };
    }
    return { problem: null, left: party.budget - total, extras: extras(party, basket) };
  }

  // The cheapest and dearest way to meet every need for `people`, buying one
  // choice per need, as many packs as it takes
  function needsCost(party, people, pick) {
    return NEEDS.reduce((sum, id) => sum + pick(lineOf(party, id).choices.map((choice) => cost(choice, packsFor(choice, people)))), 0);
  }
  const cheapestNeeds = (party, people) => needsCost(party, people, (list) => Math.min(...list));
  const dearestNeeds = (party, people) => needsCost(party, people, (list) => Math.max(...list));

  // ---- Making a party ----

  function needLine(rng, config, id, people, lineIndex) {
    const options = rng.shuffle(items.inLine(id)).slice(0, config.choices);
    const choices = options.map((item, i) => {
      // Levels 1 and 2: one pack serves everyone. Later: any of its pack sizes.
      const pack = config.cover ? item.packs.find((size) => size >= people) : rng.pick(item.packs);
      return { key: `${id}-${i}`, item: item.id, price: priceIn(rng, config.needPrice, config.step), pack, offer: null };
    });
    return { id, kind: 'need', index: lineIndex, choices };
  }

  function wishLine(rng, config) {
    const small = rng.shuffle(items.ALL.filter((item) => item.line === 'wish' && item.size === 'small')).slice(0, config.small);
    const big = rng.shuffle(items.ALL.filter((item) => item.line === 'wish' && item.size === 'big')).slice(0, config.big);
    const choices = small.map((item) => ({ item: item.id, price: priceIn(rng, config.smallPrice, config.step) }))
      .concat(big.map((item) => ({ item: item.id, price: priceIn(rng, config.bigPrice, config.step) })))
      .map((choice, i) => Object.assign(choice, { key: `wish-${i}`, pack: 0, offer: null }));
    return { id: 'wish', kind: 'wish', choices };
  }

  // Whether a party keeps its level's rules
  function keepsRules(party, config) {
    const finalPeople = party.people + party.surprise;
    const needLines = party.lines.filter((line) => line.kind === 'need');
    const wishes = lineOf(party, 'wish').choices;
    const prices = choicesOf(party).map((choice) => choice.price);
    if (prices.some((price) => price > MOST_PRICE)) return false;
    // No two choices in a row cost the same
    if (party.lines.some((line) => new Set(line.choices.map((c) => c.price)).size !== line.choices.length)) return false;
    // From level 3, every need has a choice that takes more than one pack
    if (!config.cover && !needLines.every((line) => line.choices.some((c) => c.pack < party.people))) return false;
    const cheapest = cheapestNeeds(party, finalPeople);
    if (cheapest + Math.min(...wishes.map((w) => w.price)) > party.budget) return false;
    if (config.dearOver && dearestNeeds(party, party.people) <= party.budget) return false;
    // From level 3, the needs alone take a real share of the money
    if (config.needsShare && cheapest < party.budget * config.needsShare) return false;
    if (config.bigClash) {
      const big = wishes.filter((w) => items.byId(w.item).size === 'big').map((w) => w.price);
      if (cheapest + big[0] + big[1] <= party.budget) return false;
      if (cheapest + Math.min(...big) > party.budget) return false;
    }
    return true;
  }

  function party(levelId, rng) {
    const config = CONFIG[levelId];
    const friends = rng.pick(config.friends);
    const people = friends + 1;
    const look = pp.child.lookFor(rng);
    return attempt(() => {
      const lines = NEEDS.map((id, i) => needLine(rng, config, id, people, i)).concat([wishLine(rng, config)]);
      const made = { level: levelId, budget: config.budget, friends, people, surprise: config.surprise || 0, look, lines };
      // Level 5: one need's choice is on offer. Half price needs an even price.
      if (config.offer) {
        const choice = rng.pick([].concat(...lines.filter((l) => l.kind === 'need').map((l) => l.choices)));
        choice.offer = rng.pick(['3for2', 'half']);
        if (choice.offer === 'half' && choice.price % 10 !== 0) return null;
      }
      return keepsRules(made, config) ? made : null;
    });
  }

  // `partiesPerRound` parties for one round
  function build(levelId, { partiesPerRound, rng }) {
    const parties = Array.from({ length: partiesPerRound }, () => party(levelId, rng));
    return { kind: 'party', parties, total: parties.length };
  }

  // ---- Words: on screen and spoken ----

  const itemOf = (choice) => items.byId(choice.item);

  // "6 slices", "serves 4", "makes 8 cups"; a wish has none
  const packText = (choice) => (choice.pack ? itemOf(choice).serves(choice.pack) : '');
  const packWords = (choice) => (choice.pack ? itemOf(choice).servesWords(money.number(choice.pack)) : '');

  const OFFER_TEXT = { '3for2': '3 for 2', half: 'Half price' };
  const OFFER_WORDS = { '3for2': 'three for the price of two', half: 'half price' };
  const offerText = (choice) => (choice.offer ? OFFER_TEXT[choice.offer] : '');

  // What the offer saves on a basket line, so the child sees the meter count
  // it: "1 free" once a third pack of a "3 for 2" is in, "Half price" always.
  // Empty when there is nothing to say.
  function offerNote(choice, count) {
    if (choice.offer === 'half') return { text: 'Half price', spoken: 'half price' };
    const free = choice.offer === '3for2' ? Math.floor(count / 3) : 0;
    if (!free) return { text: '', spoken: '' };
    return { text: `${free} free`, spoken: `${money.number(free)} free` };
  }

  // What a price tag says aloud: "Pizza, six slices, three pounds fifty"
  function choiceWords(choice) {
    const parts = [itemOf(choice).name, packWords(choice), money.words(choice.price), choice.offer && OFFER_WORDS[choice.offer]];
    return parts.filter(Boolean).join(', ');
  }

  // The party card, on screen and said by the birthday child
  function cardLine(party) {
    const friends = `${party.friends} friends are coming`;
    return {
      text: `It's my party! ${money.format(party.budget)} to spend, and ${friends}.`,
      spoken: `It's my party! I've got ${money.words(party.budget)} to spend, and ${money.number(party.friends)} friends are coming.`,
    };
  }

  // A party list line's heading: "Food for 8", "Wishes"
  function lineText(line, people) {
    const label = items.lineById(line.id).label;
    return line.kind === 'need' ? `${label} for ${people}` : `${label}, if there's money left`;
  }

  // What the birthday child says about a check (see `check` above), never harsh:
  //   over budget   "Hmm, that's £1.50 too much. What could we swap?"
  //   missing       "We haven't got any drinks yet!"
  //   not enough    "Not enough drinks for 8! We have drinks for 6." Short,
  //                 so the bubble stays small on phones; the list's heading
  //                 says "Drinks for 8" too
  //   all good      "Hooray! We had £2.40 left!"
  function feedback(result, people) {
    if (result.problem === 'over-budget') {
      return {
        text: `Hmm, that's ${money.format(result.over)} too much. What could we swap?`,
        spoken: `Hmm, that's ${money.words(result.over)} too much. What could we swap?`,
      };
    }
    if (result.problem) {
      const what = items.lineById(result.line).spoken;
      if (result.problem === 'missing') {
        return { text: `We haven't got any ${what} yet!`, spoken: `We haven't got any ${what} yet!` };
      }
      return {
        text: `Not enough ${what} for ${people}! We have ${what} for ${result.have}.`,
        spoken: `Not enough ${what} for ${money.number(people)}! We have ${what} for ${money.number(result.have)}.`,
      };
    }
    if (result.left === 0) return { text: 'Hooray! We spent it all, exactly!', spoken: 'Hooray! We spent it all, exactly!' };
    return {
      text: `Hooray! We had ${money.format(result.left)} left!`,
      spoken: `Hooray! We had ${money.words(result.left)} left!`,
    };
  }

  // Level 5's surprise, said by the birthday child, excited:
  //   "2 more friends are coming! Now we need enough for 12."
  function surpriseLine(more, people) {
    const howMany = money.number(more);
    return {
      text: `${more} more friends are coming! Now we need enough for ${people}.`,
      spoken: `${howMany[0].toUpperCase()}${howMany.slice(1)} more friends are coming! Now we need enough for ${money.number(people)}.`,
    };
  }

  // Level 5's change from the whole budget, paid as one note: the money left
  // by another name. "You paid with £50. Your change is £6.30."
  function changeLine(budget, left) {
    if (left === 0) {
      return {
        text: `You paid with ${money.format(budget)}. No change: it's all spent!`,
        spoken: `You paid with ${money.words(budget)}. No change: it's all spent!`,
      };
    }
    return {
      text: `You paid with ${money.format(budget)}. Your change is ${money.format(left)}.`,
      spoken: `You paid with ${money.words(budget)}. Your change is ${money.words(left)}.`,
    };
  }

  pp.levels = {
    LEVELS, CONFIG, NEEDS, SURPRISE, MOST_PRICE, levelById, build,
    cost, packsFor, spent, servings, extras, needsMet, check, cheapestNeeds, dearestNeeds,
    packText, packWords, offerText, offerNote, choiceWords, cardLine, lineText, feedback, surpriseLine, changeLine,
  };
})(window.KMG);

// A choice in the shop: a card with the item's picture, name and pack size,
// which adds a pack to the basket when tapped, and a price tag beside it,
// which says the item aloud (as Price Detective's shelf labels do). They are
// two buttons, so a child can hear a price without buying.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { money, pp } = KMG;

  // `onAdd` and `onTag` are what tapping the card and the tag do.
  function element(choice, { onAdd = null, onTag = null } = {}) {
    const item = pp.items.byId(choice.item);
    const pack = pp.levels.packText(choice);
    const offer = pp.levels.offerText(choice);
    return el('div', {
      class: 'pp-card',
      'data-choice': choice.key,
      'data-item': choice.item,
      'data-price': choice.price,
      'data-pack': choice.pack,
      'data-offer': choice.offer || '',
    },
    // How many packs of it are in the basket, shown once there are some
    el('span', { class: 'pp-card-count', 'data-count': 0, 'aria-hidden': 'true' }),
    el('button', {
        class: 'pp-card-pick',
        'data-action': 'add',
        'aria-label': `Add ${item.name}${pack ? `, ${pack}` : ''}`,
        onclick: onAdd,
      },
      pp.items.element(choice.item),
      el('span', { class: 'pp-card-name' }, item.name),
      pack && el('span', { class: 'pp-card-pack' }, pack)),
      el('button', {
        class: 'pp-tag',
        'data-price': choice.price,
        'data-action': 'read-price',
        'aria-label': `${pp.levels.choiceWords(choice)}. Hear it again`,
        onclick: onTag,
      },
      el('span', { class: 'pp-tag-price' }, money.format(choice.price)),
      offer && el('span', { class: 'pp-tag-offer', 'data-offer': choice.offer }, offer)));
  }

  // A price tag with a few words on it, for the home screen's cards
  const mini = (text) => el('span', { class: 'pp-tag-mini' }, text);

  pp.card = { element, mini };
})(window.KMG);

// Party Planner's saved data: the shared progress store
// (src/shared/progress-store.js) with this game's settings. Mistakes are
// counted per kind ("over-budget", "not-enough", "missing"). `leftover` keeps
// the money left at the end of every party, added up, and how many parties
// there were, for the grown-ups' "money left, on average".
(function (KMG) {
  'use strict';

  const { pp } = KMG;

  const PARTIES_PER_ROUND = [1, 2, 3];
  const MISTAKES = ['over-budget', 'not-enough', 'missing'];

  const isCount = (value) => Number.isInteger(value) && value >= 0;

  const store = KMG.progressStore({
    key: 'party-planner',
    levels: () => pp.levels.LEVELS,
    settings: () => ({ partiesPerRound: 2, showLeft: true, leftover: { total: 0, parties: 0 } }),
    // The money left is the child's record, not a setting: a reset clears it.
    keepOnReset: ['partiesPerRound', 'showLeft'],
    isMistakeKey: (key) => MISTAKES.includes(key),
    checkSettings(data, clean) {
      const { partiesPerRound, showLeft, leftover } = data;
      if (PARTIES_PER_ROUND.indexOf(partiesPerRound) === -1) return false;
      if (typeof showLeft !== 'boolean') return false;
      if (!leftover || !isCount(leftover.total) || !isCount(leftover.parties)) return false;
      Object.assign(clean, { partiesPerRound, showLeft, leftover: { total: leftover.total, parties: leftover.parties } });
      return true;
    },
  });

  // Adds one finished party's money left
  function recordLeftover(pence) {
    const data = store.load();
    data.leftover = { total: data.leftover.total + pence, parties: data.leftover.parties + 1 };
    store.save(data);
  }

  pp.progress = Object.assign(store, { PARTIES_PER_ROUND, MISTAKES, recordLeftover });
})(window.KMG);

// Party Planner's play screen: the party shop. The shared frame
// (src/shared/play-screen.js) holds the level's name; under it:
//   header   the birthday child, who reads the party card in a speech bubble
//   shop     one row per line of the party list ("Food for 8"), each with its
//            choices as cards (card.js): tapping a card adds a pack, tapping
//            its price tag says it aloud
//   basket   what has been bought, a line per choice ("2 × Pizza"); tapping a
//            line takes one pack back out
//   meter    spent and money left, always in £ and p; over budget, "Over by"
//            and how much, in words as well as colour
//   "Party time!", which checks the plan (levels.check):
//     over budget, or a need missing or short: one mistake, and the birthday
//       child says what to fix, thinking, never cross
//     all good: the party happens in the party scene, with the money left
//       (and at level 5 the change from the note), then the next party, or
//       the stars
//     all good at level 5, the first time: the surprise instead. "2 more
//       friends are coming!", the list's numbers go up, and the child tops up
//       what is now short. Not a mistake.
// At levels 1 and 2 each need is ticked as soon as there is enough; from level
// 3 the child works out "enough for everyone", and the ticks only appear when
// the plan is checked. The play screen's tray is not needed.
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { money, audio, speech, effects, pp } = KMG;

  // How long the birthday child keeps an expression after speaking
  const TALK_MS = 2400;
  // How long a party is shown before the next one, or the stars
  const PARTY_MS = 4200;
  // The most packs of one choice the basket takes, so it stays readable
  const MOST_PACKS = 9;

  // "£0" rather than "0p" for nothing at all, which reads oddly on a meter
  const amount = (pence) => (pence === 0 ? '£0' : money.format(pence));

  function play(levelId, context) {
    const level = pp.levels.levelById(levelId);
    const saved = pp.progress.load();
    const round = pp.levels.build(levelId, { partiesPerRound: saved.partiesPerRound, rng: context.rng });
    const liveTicks = levelId <= 2;

    const screen = KMG.playScreen.build({
      levelId,
      kind: round.kind,
      total: round.total,
      text: level.text,
      spoken: level.spoken,
      onBack: () => context.home(),
    });
    screen.tray.remove();

    let alive = true;
    // Busy while a party is being shown. Shown as data-busy on the screen, so
    // tests can wait for it.
    let busy = false;
    const setBusy = (value) => {
      busy = value;
      screen.main.dataset.busy = String(value);
    };
    let index = 0;
    const party = () => round.parties[index];
    // How many people the party is for (level 5's surprise guests add to it)
    let people = 0;
    // Whether this party's surprise guests have arrived
    let surprised = false;
    // { [choice key]: packs }
    let basket = {};
    let mistakes = 0;
    const mistakesByKind = {};
    const later = (callback, ms) => window.setTimeout(() => {
      if (alive) callback();
    }, ms);

    const header = el('div', { class: 'pp-header' });
    const shop = el('div', { class: 'pp-shop', 'data-shop': true });
    const basketList = el('div', { class: 'pp-basket', 'data-basket': true });
    const spentValue = el('span', { class: 'pp-meter-value', 'data-spent': true });
    const leftLabel = el('span', { class: 'pp-meter-label' }, 'Money left');
    const leftValue = el('span', { class: 'pp-meter-value', 'data-left': true });
    const leftPart = el('div', { class: 'pp-meter-part pp-meter-left', hidden: !saved.showLeft }, leftLabel, leftValue);
    const meter = el('div', { class: 'pp-meter', 'data-meter': true },
      el('div', { class: 'pp-meter-part' }, el('span', { class: 'pp-meter-label' }, 'Spent'), spentValue),
      leftPart);
    const go = el('button', { class: 'btn btn-primary pp-go', 'data-action': 'party-time', onclick: partyTime }, 'Party time!');
    const side = el('div', { class: 'pp-side' }, basketList, meter, go);
    const planner = el('div', { class: 'pp-planner', 'data-planner': true }, header, shop, side);
    const partyView = el('div', { class: 'pp-party', 'data-party': true, hidden: true });
    screen.zones.append(planner, partyView);

    // The birthday child and what they say
    let child = null;
    const bubble = el('div', { class: 'pp-bubble', role: 'status' });
    let talkTimer = null;
    function say(text, spoken, expression = 'talking') {
      bubble.textContent = text;
      child.setExpression(expression);
      speech.say(spoken);
      window.clearTimeout(talkTimer);
      const speaker = child;
      talkTimer = window.setTimeout(() => {
        if (alive && speaker.node.dataset.expression === expression) speaker.setExpression('idle');
      }, TALK_MS);
    }

    // Everything the birthday child might say during this party, at its
    // longest: the party card, each need missing or short for the most people
    // there will be, the dearest over budget, and level 5's surprise.
    function possibleLines() {
      const p = party();
      const most = p.people + p.surprise;
      const { levels } = pp;
      const lines = [levels.cardLine(p).text, levels.feedback({ problem: 'over-budget', over: 99999 }, most).text];
      if (p.surprise) lines.push(levels.surpriseLine(p.surprise, most).text);
      levels.NEEDS.forEach((id) => {
        lines.push(levels.feedback({ problem: 'missing', line: id }, most).text);
        lines.push(levels.feedback({ problem: 'not-enough', line: id, have: most - 1 }, most).text);
      });
      return lines;
    }

    // Keeps the header tall enough for the longest thing the birthday child
    // might say, so the shop never jumps under a finger when a longer line
    // wraps onto more rows (as happens on upright phones). Measured, not set,
    // because how many rows a line takes depends on the screen; measured again
    // when the screen turns.
    function reserveHeader() {
      if (!alive || planner.hidden) return;
      const shown = bubble.textContent;
      header.style.minHeight = '';
      let tallest = 0;
      possibleLines().forEach((text) => {
        bubble.textContent = text;
        tallest = Math.max(tallest, header.offsetHeight);
      });
      bubble.textContent = shown;
      header.style.minHeight = `${tallest}px`;
    }

    const choices = () => party().lines.flatMap((line) => line.choices);
    const row = (lineId) => shop.querySelector(`[data-row="${lineId}"]`);

    // The meter: spent, and money left or how much over
    function refreshMeter() {
      const total = pp.levels.spent(party(), basket);
      const over = total - party().budget;
      spentValue.textContent = amount(total);
      meter.dataset.total = total;
      if (over > 0) {
        // In words as well as colour: "Over by £1.50"
        leftLabel.textContent = 'Over by';
        leftValue.textContent = money.format(over);
        leftPart.dataset.over = over;
      } else {
        leftLabel.textContent = 'Money left';
        leftValue.textContent = amount(-over);
        delete leftPart.dataset.over;
      }
    }

    function refreshBasket() {
      basketList.textContent = '';
      const bought = choices().filter((choice) => basket[choice.key] > 0);
      if (!bought.length) basketList.appendChild(el('p', { class: 'pp-basket-empty' }, 'Tap things in the shop to add them.'));
      bought.forEach((choice) => {
        const name = pp.items.byId(choice.item).name;
        const count = basket[choice.key];
        // Level 5's offer, so the child sees why the line costs less
        const note = pp.levels.offerNote(choice, count);
        basketList.appendChild(el('button', {
          class: 'pp-line',
          'data-line': choice.key,
          'aria-label': `${count} ${name}${note.spoken ? `, ${note.spoken}` : ''}. Tap to take one out`,
          onclick: () => remove(choice),
        },
        pp.items.mini(choice.item),
        el('span', { class: 'pp-line-name' }, `${count} × ${name}`,
          note.text && el('span', { class: 'pp-line-offer', 'data-offer-note': note.text }, note.text)),
        el('span', { class: 'pp-line-cost' }, money.format(pp.levels.cost(choice, count)))));
      });
      // Each card shows how many of it are in the basket
      shop.querySelectorAll('.pp-card').forEach((card) => {
        const count = basket[card.dataset.choice] || 0;
        const badge = card.querySelector('.pp-card-count');
        badge.dataset.count = count;
        badge.textContent = count ? `× ${count}` : '';
      });
    }

    // Ticks on the party list: live at levels 1 and 2, otherwise only when
    // the plan is checked (`checked`). Any change to the basket clears the
    // marks from the last check.
    function refreshTicks(checked = false) {
      pp.levels.NEEDS.forEach((id) => {
        const line = row(id);
        delete line.dataset.short;
        if (liveTicks || checked) line.dataset.done = String(pp.levels.servings(party(), basket, id) >= people);
        else delete line.dataset.done;
      });
    }

    function changed() {
      refreshBasket();
      refreshMeter();
      refreshTicks();
    }

    function wobble(node) {
      node.classList.remove('wobble');
      void node.offsetWidth;
      node.classList.add('wobble');
    }

    function add(choice, card) {
      if (busy || !alive) return;
      const count = basket[choice.key] || 0;
      // A wish is bought once; a need up to MOST_PACKS packs
      const most = choice.pack ? MOST_PACKS : 1;
      if (count >= most) {
        wobble(card);
        return;
      }
      basket[choice.key] = count + 1;
      audio.play('pickup');
      changed();
    }

    function remove(choice) {
      if (busy || !alive || !basket[choice.key]) return;
      basket[choice.key] -= 1;
      if (!basket[choice.key]) delete basket[choice.key];
      audio.play('pickup');
      changed();
    }

    function mistake(result) {
      mistakes++;
      mistakesByKind[result.problem] = (mistakesByKind[result.problem] || 0) + 1;
      audio.play('wrong');
      if (result.problem === 'over-budget') wobble(meter);
      else row(result.line).dataset.short = 'true';
      const { text, spoken } = pp.levels.feedback(result, people);
      say(text, spoken, 'thinking');
    }

    function partyTime() {
      if (busy || !alive) return;
      const result = pp.levels.check(party(), basket, people);
      if (!result.problem && party().surprise && !surprised) {
        surprise();
        return;
      }
      refreshTicks(true);
      if (result.problem) mistake(result);
      else celebrateParty(result);
    }

    // Level 5: a good plan, but more friends are coming. The list's numbers
    // go up and the ticks show what is now short. The plan was good, so this
    // is never a mistake.
    function surprise() {
      surprised = true;
      const more = party().surprise;
      setPeople(people + more);
      audio.play('correct');
      refreshTicks(true);
      const { text, spoken } = pp.levels.surpriseLine(more, people);
      say(text, spoken, 'excited');
      wobble(bubble);
    }

    // How many people the party is for, on the list's headings and the screen
    function setPeople(count) {
      people = count;
      screen.main.dataset.people = people;
      party().lines.forEach((line) => {
        const name = row(line.id) && row(line.id).querySelector('.pp-row-name');
        if (name) name.textContent = pp.levels.lineText(line, people);
      });
    }

    // The party happens: the room fills with what was bought, the birthday
    // child cheers, and the money left is shown and said.
    function celebrateParty(result) {
      setBusy(true);
      audio.play('till');
      pp.progress.recordLeftover(result.left);
      const bought = choices().filter((choice) => basket[choice.key] > 0).map((choice) => choice.item);
      const cheer = pp.child.element(party().look, 'excited');
      const { text, spoken } = pp.levels.feedback(result, people);
      // Level 5: the change from the note, the money left by another name
      const change = pp.levels.CONFIG[levelId].change ? pp.levels.changeLine(party().budget, result.left) : null;
      partyView.textContent = '';
      partyView.append(
        pp.scene.element(bought),
        el('div', { class: 'pp-party-cheer' }, cheer.node,
          el('div', { class: 'pp-party-words' },
            el('p', { class: 'pp-party-left', 'data-party-left': result.left }, text),
            change && el('p', { class: 'pp-party-change', 'data-change': result.left }, change.text),
            result.extras > 0 && el('p', { class: 'pp-party-extras', 'data-extras': result.extras },
              result.extras === 1 ? '1 party extra' : `${result.extras} party extras`))));
      planner.hidden = true;
      partyView.hidden = false;
      speech.say(change ? `${spoken} ${change.spoken}` : spoken);
      const box = partyView.getBoundingClientRect();
      effects.sparkle(box.left + box.width / 2, box.top + box.height / 3);
      later(nextParty, PARTY_MS);
    }

    function finishRound() {
      const stars = KMG.stars.forMistakes(mistakes);
      pp.progress.recordRound(levelId, { stars, mistakes: mistakesByKind, stage: 0, lastStage: 0 });
      const next = pp.levels.levelById(levelId + 1) ? () => play(levelId + 1, context) : null;
      KMG.celebrate(screen.main, {
        stars,
        onAgain: () => play(levelId, context),
        onNext: next,
        onHome: () => context.home(),
      });
    }

    function nextParty() {
      index++;
      screen.setDone(index);
      if (index === round.total) {
        finishRound();
        return;
      }
      showParty();
      setBusy(false);
    }

    function showParty() {
      const p = party();
      basket = {};
      people = p.people;
      surprised = false;
      screen.main.dataset.people = people;
      meter.dataset.budget = p.budget;
      child = pp.child.element(p.look, 'idle');
      header.textContent = '';
      header.append(child.node, bubble);

      shop.textContent = '';
      p.lines.forEach((line) => {
        shop.appendChild(el('section', { class: 'pp-row', 'data-row': line.id, 'data-kind': line.kind },
          el('h2', { class: 'pp-row-title' },
            el('span', { class: 'pp-row-name' }, pp.levels.lineText(line, people)),
            line.kind === 'need' && el('span', { class: 'pp-row-tick', 'aria-hidden': 'true' })),
          el('div', { class: 'pp-row-cards' }, line.choices.map((choice) => {
            const card = pp.card.element(choice, {
              onTag: () => speech.say(pp.levels.choiceWords(choice)),
            });
            card.querySelector('.pp-card-pick').addEventListener('click', () => add(choice, card));
            return card;
          }))));
      });
      partyView.hidden = true;
      planner.hidden = false;
      changed();
      const card = pp.levels.cardLine(p);
      say(card.text, card.spoken);
      reserveHeader();
    }

    window.addEventListener('resize', reserveHeader);
    screen.main.onleave = () => {
      alive = false;
      speech.stop();
      window.clearTimeout(talkTimer);
      window.removeEventListener('resize', reserveHeader);
    };

    setBusy(false);
    show(screen.main);
    showParty();
  }

  KMG.pp.play = play;
})(window.KMG);

// Party Planner's grown-ups area: the shared one (src/shared/parent-area.js)
// with this game's settings, the mistakes to practise, and the money left at
// the end of a party, on average.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { money, pp, parentArea } = KMG;

  // How each kind of mistake is named in the list of things to practise
  const PRACTISE_NAMES = {
    'over-budget': 'Went over budget',
    'not-enough': 'Not enough for everyone',
    missing: 'Missed something on the list',
  };

  // Under the list: the money left at the end of a party, on average, and
  // over how many parties, so a grown-up can tell one party from twenty
  function leftoverNote(data) {
    const { total, parties } = data.leftover;
    const average = Math.round(total / parties);
    const over = parties === 1 ? '1 party' : `${parties} parties`;
    const text = parties
      ? `Money left at the end of a party, on average: ${average === 0 ? '£0' : money.format(average)}, over ${over}.`
      : 'No parties planned yet.';
    return [
      el('h3', {}, 'Money left over'),
      el('p', { class: 'parent-note', 'data-leftover': parties ? average : '' }, text),
    ];
  }

  // Changes one saved setting.
  function saveSetting(name, value) {
    const saved = pp.progress.load();
    saved[name] = value;
    pp.progress.save(saved);
  }

  function settings(data) {
    return [
      parentArea.choices({
        title: 'Parties in a round',
        values: pp.progress.PARTIES_PER_ROUND,
        current: data.partiesPerRound,
        label: (count) => (count === 1 ? '1 party' : `${count} parties`),
        attr: 'round',
        onPick: (count) => saveSetting('partiesPerRound', count),
      }),
      parentArea.section('Money left',
        parentArea.toggle('Show the money left as they shop', 'left', data.showLeft,
          (on) => saveSetting('showLeft', on))),
    ];
  }

  function parent(context) {
    parentArea.show({
      gameName: 'Party Planner',
      store: pp.progress,
      fileName: 'party-planner-progress.json',
      levels: pp.levels.LEVELS,
      settings,
      practise: {
        title: 'Things to practise',
        item: (key) => el('span', { class: 'pp-practise' }, PRACTISE_NAMES[key] || key),
      },
      notes: leftoverNote,
      onDone: () => context.home(),
    });
  }

  pp.parent = parent;
})(window.KMG);

// Party Planner's home screen: the shared level picker
// (src/shared/level-picker.js) with a party item and a price tag on each
// level's card.
(function (KMG) {
  'use strict';

  const { pp } = KMG;

  const item = (id) => pp.items.mini(id);
  const tag = (text) => pp.card.mini(text);

  const LEVEL_ART = {
    1: () => [item('sandwiches'), tag('£10')],
    2: () => [item('juice'), tag('£2.50')],
    3: () => [item('pizza'), tag('× 2')],
    4: () => [item('castle'), item('balloons')],
    5: () => [item('cake'), tag('£50')],
  };

  function home(context) {
    KMG.levelPicker.show({
      title: 'Party Planner',
      levels: pp.levels.LEVELS,
      art: (level) => LEVEL_ART[level.id](),
      store: pp.progress,
      onPlay: (levelId) => pp.play(levelId, context),
      onParent: () => pp.parent(context),
      exit: context.exit,
    });
  }

  pp.home = home;
})(window.KMG);

// Party Planner's entry point: registers the game with the hub or standalone boot.
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { pp } = KMG;

  // ?debug=1&items=1 shows every party item, the birthday child in several
  // looks and every expression, and the party scene empty and full, for
  // checking the artwork.
  function gallery(context) {
    const all = pp.items.ALL.map((item) => el('figure', { class: 'pp-gallery-item' },
      pp.items.element(item.id),
      el('figcaption', {}, item.name)));

    const looks = [1, 2, 3, 4, 5, 6].map((seed) => {
      const child = pp.child.element(pp.child.lookFor(KMG.rng.create(seed)));
      return el('figure', { class: 'pp-gallery-item', 'data-look-seed': seed }, child.node, el('figcaption', {}, `Seed ${seed}`));
    });

    const look = pp.child.lookFor(context.rng);
    const expressions = pp.child.EXPRESSIONS.map((name) => el('figure', { class: 'pp-gallery-item', 'data-expression-sample': name },
      pp.child.element(look, name).node, el('figcaption', {}, name)));

    const full = ['pizza', 'cake', 'juice', 'bags-filled', 'balloons', 'bunting', 'hats', 'game', 'facepaints', 'magician', 'castle'];
    const scenes = [['Needs only', ['sandwiches', 'cupcakes', 'squash', 'bags-plain']], ['Everything', full]]
      .map(([name, bought]) => el('figure', { class: 'pp-gallery-scene', 'data-scene-sample': name },
        pp.scene.element(bought), el('figcaption', {}, name)));

    show(el('main', { class: 'pp-gallery', 'data-screen': 'gallery' },
      el('h2', {}, 'Party items'), el('div', { class: 'pp-gallery-grid' }, all),
      el('h2', {}, 'Birthday child looks'), el('div', { class: 'pp-gallery-grid' }, looks),
      el('h2', {}, 'Expressions'), el('div', { class: 'pp-gallery-grid' }, expressions),
      el('h2', {}, 'The party scene'), el('div', { class: 'pp-gallery-scenes' }, scenes)));
  }

  KMG.registerGame('party-planner', {
    // Called once before any of this game's art is drawn. Nothing to set up:
    // the drawings carry everything they need.
    prepare() {},

    // The picture on the hub tile.
    art: () => [pp.items.mini('cake'), pp.items.mini('balloons'), pp.items.mini('pizza')],

    open(exit) {
      const context = { exit, rng: KMG.rng.create(KMG.debug.seed) };
      context.home = () => pp.home(context);

      if (KMG.debug.flag('items')) gallery(context);
      else if (KMG.debug.level) pp.play(KMG.debug.level, context);
      else context.home();
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

  // Shared with Party Planner's birthday child (src/shared/looks.js)
  const { SKINS, HAIR_COLOURS } = KMG.looks;
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
//
// The till is a button on a white card. With coins on the mat and nothing
// moved for READY_MS, it glows (data-ready) until the child acts, so a child
// who has finished paying sees where to press. It glows whatever the coins add
// up to, so it never gives the answer away.
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
  // How long the coins on the mat stay untouched before the till glows
  const READY_MS = 2500;
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

    // The till's glow. calmTill() stops it, for whenever the child is busy or
    // has just pressed the till. settleTill() starts the wait again after the
    // mat changes; nothing glows with an empty mat, while the shopkeeper is
    // busy, or while level 4's piles are out. Pressing the till only calms it,
    // so after a wrong payment it waits for the coins to change rather than
    // inviting the same payment again.
    let readyTimer = null;
    function calmTill() {
      window.clearTimeout(readyTimer);
      delete till.dataset.ready;
    }
    function settleTill() {
      calmTill();
      const waiting = () => alive && !busy && !choosing && matCoins().length > 0;
      if (!waiting()) return;
      readyTimer = later(() => {
        if (waiting()) till.dataset.ready = 'true';
      }, READY_MS);
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
        settleTill();
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
          calmTill();
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
          settleTill();
        },
        onCancel() {
          node.classList.remove('dragging');
          returnToPurse(node);
          settleTill();
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
      calmTill();
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
      calmTill();
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

// Price Detective's twelve groceries, drawn as simple SVG on a 120 by 120
// canvas, in the same flat pastel style and soft outline as Play Shop's toys.
// Original and unbranded: no real shop, brand, logo or packaging design.
//
// Each product is sold in one of three ways, which decides how its packs are
// sized and how its value is worked out (see levels.js):
//   count  eggs, apples ... sold by the number in the pack; worked out per one
//   g      cereal, pasta ... sold by weight; worked out per 100g
//   ml     milk and juice, sold by volume; worked out per 100ml
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  KMG.pd = KMG.pd || {};

  // The soft outline every drawing uses
  const LINE = 'stroke="#24324a" stroke-opacity="0.22" stroke-width="3" stroke-linejoin="round"';
  const SOFT = 'fill="none" stroke="#24324a" stroke-opacity="0.2" stroke-width="3" stroke-linecap="round"';

  const CORAL = '#ff9d8a';
  const SUN = '#ffd56b';
  const SKY = '#9cc9f5';
  const LILAC = '#cfc8f2';
  const MINT = '#8fd3c7';
  const CLOUD = '#f4f7fb';
  const WOOD = '#9b7653';
  const LEAF = '#9ad48a';
  const ORANGE = '#ffb35c';
  const CARD = '#e9d3b4';
  const CRUST = '#e8b77a';

  // A tin of tomatoes, `width` wide from `x`
  function tin(x, width) {
    const mid = x + width / 2;
    return `
      <rect x="${x}" y="30" width="${width}" height="74" rx="7" fill="#dfe5ec"/>
      <rect x="${x}" y="50" width="${width}" height="34" fill="${CORAL}"/>
      <circle cx="${mid}" cy="69" r="${width / 5.5}" fill="#e8665a"/>
      <path d="M${mid - 6} 59 L${mid} 55 L${mid + 6} 59" fill="none" stroke="${LEAF}" stroke-width="3" stroke-linecap="round"/>
      <rect x="${x}" y="30" width="${width}" height="74" rx="7" fill="none" ${LINE}/>
      <ellipse cx="${mid}" cy="32" rx="${width / 2}" ry="7" fill="#eef2f6" ${LINE}/>`;
  }

  // The drawings of a whole pack. A count product sold on its own uses ONE
  // below instead, so one yoghurt never looks like two.
  const DRAWINGS = {
    eggs: `
      <ellipse cx="34" cy="54" rx="14" ry="18" fill="#fff8ec" ${LINE}/>
      <ellipse cx="60" cy="50" rx="14" ry="18" fill="#f6e3c8" ${LINE}/>
      <ellipse cx="86" cy="54" rx="14" ry="18" fill="#fff8ec" ${LINE}/>
      <path d="M12 64 L108 64 L100 98 Q99 104 93 104 L27 104 Q21 104 20 98 Z" fill="${CARD}" ${LINE}/>
      <path d="M30 80 Q36 88 42 80 M54 80 Q60 88 66 80 M78 80 Q84 88 90 80" ${SOFT}/>`,

    apples: `
      <path d="M44 42 Q46 32 51 27" fill="none" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 34 Q60 25 67 33 Q58 41 50 34 Z" fill="${LEAF}"/>
      <circle cx="42" cy="70" r="30" fill="#ff8f7a" ${LINE}/>
      <circle cx="31" cy="58" r="6" fill="#fff" opacity="0.5"/>
      <path d="M80 48 Q81 40 85 36" fill="none" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="80" cy="76" r="27" fill="${LEAF}" ${LINE}/>
      <circle cx="71" cy="65" r="5" fill="#fff" opacity="0.5"/>`,

    bananas: `
      <g transform="translate(12 -10)">
        <path d="M22 40 Q30 96 92 92 Q102 90 100 84 Q60 86 40 40 Q36 32 30 32 Q22 32 22 40 Z" fill="#ffe28f" ${LINE}/>
      </g>
      <path d="M22 40 Q30 96 92 92 Q102 90 100 84 Q60 86 40 40 Q36 32 30 32 Q22 32 22 40 Z" fill="${SUN}" ${LINE}/>
      <path d="M26 33 L31 25 M38 23 L43 15" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>`,

    yoghurts: `
      <path d="M18 44 L58 44 L54 100 Q53 104 49 104 L27 104 Q23 104 22 100 Z" fill="${CLOUD}" ${LINE}/>
      <rect x="21" y="62" width="34" height="16" fill="${CORAL}" opacity="0.85"/>
      <rect x="14" y="36" width="48" height="10" rx="4" fill="${LILAC}" ${LINE}/>
      <path d="M62 44 L102 44 L98 100 Q97 104 93 104 L71 104 Q67 104 66 100 Z" fill="${CLOUD}" ${LINE}/>
      <rect x="65" y="62" width="34" height="16" fill="${SUN}" opacity="0.9"/>
      <rect x="58" y="36" width="48" height="10" rx="4" fill="${MINT}" ${LINE}/>`,

    tins: `${tin(10, 44)}${tin(64, 44)}`,

    cereal: `
      <path d="M92 18 L102 24 L102 104 L92 108 Z" fill="#e9b94a" ${LINE}/>
      <rect x="28" y="12" width="64" height="96" rx="6" fill="${SUN}" ${LINE}/>
      <rect x="38" y="24" width="44" height="14" rx="7" fill="${CORAL}"/>
      <circle cx="48" cy="64" r="5" fill="${ORANGE}"/>
      <circle cx="57" cy="60" r="5" fill="#f0a040"/>
      <circle cx="66" cy="63" r="5" fill="${ORANGE}"/>
      <circle cx="74" cy="60" r="4" fill="#f0a040"/>
      <path d="M38 66 L82 66 Q80 92 60 92 Q40 92 38 66 Z" fill="${CLOUD}" ${LINE}/>`,

    pasta: `
      <path d="M30 20 L90 20 L96 104 Q96 108 92 108 L28 108 Q24 108 24 104 Z" fill="${SKY}" ${LINE}/>
      <path d="M30 20 L90 20 L89 30 L31 30 Z" fill="#7fb3e6"/>
      <rect x="38" y="46" width="44" height="44" rx="14" fill="#fff6dc"/>
      <path d="M46 58 L56 64 M64 54 L70 64 M48 76 L58 72 M66 72 L74 80" stroke="#f0b440" stroke-width="6" stroke-linecap="round"/>`,

    rice: `
      <path d="M34 34 Q30 24 40 22 L80 22 Q90 24 86 34 L96 100 Q96 108 88 108 L32 108 Q24 108 24 100 Z" fill="${CLOUD}" ${LINE}/>
      <path d="M42 31 L78 31" stroke="${CORAL}" stroke-width="6" stroke-linecap="round"/>
      <rect x="32" y="56" width="56" height="26" rx="9" fill="${MINT}"/>
      <g fill="#ffffff">
        <ellipse cx="46" cy="69" rx="4" ry="2.5" transform="rotate(-25 46 69)"/>
        <ellipse cx="58" cy="66" rx="4" ry="2.5" transform="rotate(20 58 66)"/>
        <ellipse cx="70" cy="70" rx="4" ry="2.5" transform="rotate(-10 70 70)"/>
        <ellipse cx="62" cy="75" rx="4" ry="2.5" transform="rotate(30 62 75)"/>
      </g>`,

    cheese: `
      <path d="M14 92 L104 92 Q108 92 108 88 L108 46 Q108 40 102 42 L18 84 Q14 86 14 92 Z" fill="${SUN}" ${LINE}/>
      <path d="M20 84 L102 44" stroke="#e9b94a" stroke-width="6" stroke-linecap="round"/>
      <g fill="#e9b94a">
        <circle cx="82" cy="72" r="7"/>
        <circle cx="60" cy="82" r="5"/>
        <circle cx="96" cy="58" r="4"/>
        <circle cx="40" cy="87" r="3.5"/>
      </g>`,

    bread: `
      <path d="M18 62 Q18 30 60 30 Q102 30 102 62 L102 98 Q102 104 96 104 L24 104 Q18 104 18 98 Z" fill="${CRUST}" ${LINE}/>
      <rect x="24" y="70" width="72" height="28" rx="4" fill="#f6d9a8"/>
      <path d="M40 42 L48 56 M58 38 L66 54 M76 42 L84 56" fill="none" stroke="#c98a4a" stroke-width="3" stroke-linecap="round"/>`,

    milk: `
      <rect x="56" y="9" width="8" height="9" rx="2" fill="${SKY}"/>
      <path d="M34 40 L60 16 L86 40 Z" fill="#dfe5ec" ${LINE}/>
      <rect x="34" y="40" width="52" height="66" rx="4" fill="${CLOUD}" ${LINE}/>
      <rect x="34" y="56" width="52" height="26" fill="${SKY}"/>
      <path d="M60 60 Q68 70 60 77 Q52 70 60 60 Z" fill="${CLOUD}"/>`,

    juice: `
      <rect x="50" y="10" width="20" height="12" rx="4" fill="${MINT}" ${LINE}/>
      <path d="M50 22 L70 22 L70 34 Q88 42 88 60 L88 100 Q88 108 80 108 L40 108 Q32 108 32 100 L32 60 Q32 42 50 34 Z" fill="#ffe6c4" ${LINE}/>
      <path d="M34 58 L86 58 L86 100 Q86 106 80 106 L40 106 Q34 106 34 100 Z" fill="${ORANGE}"/>
      <rect x="40" y="68" width="40" height="22" rx="6" fill="${CLOUD}"/>
      <circle cx="60" cy="79" r="7" fill="${ORANGE}"/>`,
  };

  // One item on its own: an apple, a banana, a yoghurt, a tin
  const ONE = {
    apples: `
      <path d="M60 38 Q62 28 67 23" fill="none" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>
      <path d="M66 30 Q76 21 83 29 Q74 37 66 30 Z" fill="${LEAF}"/>
      <circle cx="60" cy="72" r="34" fill="#ff8f7a" ${LINE}/>
      <circle cx="47" cy="58" r="7" fill="#fff" opacity="0.5"/>`,

    bananas: `
      <g transform="translate(6 0)">
        <path d="M22 40 Q30 96 92 92 Q102 90 100 84 Q60 86 40 40 Q36 32 30 32 Q22 32 22 40 Z" fill="${SUN}" ${LINE}/>
        <path d="M26 33 L31 25" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>
      </g>`,

    yoghurts: `
      <path d="M38 40 L82 40 L78 102 Q77 106 73 106 L47 106 Q43 106 42 102 Z" fill="${CLOUD}" ${LINE}/>
      <rect x="41" y="60" width="38" height="18" fill="${CORAL}" opacity="0.85"/>
      <rect x="34" y="31" width="52" height="11" rx="4" fill="${LILAC}" ${LINE}/>`,

    tins: tin(34, 52),
  };

  // `one` and `many` name a count product's items ("4 apples"); `name` is how
  // a weight or volume is said ("500 grams of pasta"). `packs` are the numbers
  // a count product comes in; `sizes` are the grams or millilitres the others
  // come in, always in whole hundreds up to 1,000.
  const PRODUCTS = [
    { id: 'eggs', unit: 'count', one: 'egg', many: 'eggs', packs: [6, 10, 12] },
    { id: 'apples', unit: 'count', one: 'apple', many: 'apples', packs: [1, 3, 5, 10] },
    { id: 'bananas', unit: 'count', one: 'banana', many: 'bananas', packs: [1, 2, 5] },
    { id: 'yoghurts', unit: 'count', one: 'yoghurt', many: 'yoghurts', packs: [1, 2, 4] },
    { id: 'tins', unit: 'count', one: 'tin of tomatoes', many: 'tins of tomatoes', packs: [1, 2, 4, 10] },
    { id: 'cereal', unit: 'g', name: 'cereal', sizes: [300, 500, 700] },
    { id: 'pasta', unit: 'g', name: 'pasta', sizes: [300, 500, 1000] },
    { id: 'rice', unit: 'g', name: 'rice', sizes: [400, 500, 1000] },
    { id: 'cheese', unit: 'g', name: 'cheese', sizes: [200, 300, 400] },
    { id: 'bread', unit: 'g', name: 'bread', sizes: [400, 600, 800] },
    { id: 'milk', unit: 'ml', name: 'milk', sizes: [200, 500, 1000] },
    { id: 'juice', unit: 'ml', name: 'juice', sizes: [300, 500, 1000] },
  ];

  const byId = (id) => PRODUCTS.find((product) => product.id === id);
  // The pack sizes or weights a product comes in
  const amountsOf = (product) => (product.unit === 'count' ? product.packs : product.sizes);
  const labelOf = (product) => (product.unit === 'count' ? product.many : product.name);

  // The drawing for a pack: one item on its own where there is one, otherwise the whole pack
  function svg(id, amount) {
    const product = byId(id);
    const drawing = amount === 1 && ONE[id] ? ONE[id] : DRAWINGS[id];
    const name = amount === 1 && product.unit === 'count' ? product.one : labelOf(product);
    return `<svg class="pd-product-svg" viewBox="0 0 120 120" role="img" aria-label="${name}">${drawing}</svg>`;
  }

  // A product at any size: the element fills whatever box the stylesheet gives it.
  // With an `amount`, the picture shows the pack's size: a smaller pack is
  // drawn smaller (--pd-scale), by its place among the sizes the product
  // comes in: 70% for the smallest, full size for the biggest, evenly between,
  // so "2 yoghurts" and "4 yoghurts" never look alike and no pack is tiny.
  // A multipack also wears a sticker with the number in it ("4").
  function element(id, amount = null, className = 'pd-product') {
    const product = byId(id);
    const node = el('span', { class: className, 'data-product': id, html: svg(id, amount) });
    if (amount === null) return node;
    node.dataset.amount = amount;
    const sizes = amountsOf(product);
    const rank = sizes.indexOf(amount) / (sizes.length - 1);
    node.style.setProperty('--pd-scale', (0.7 + 0.3 * rank).toFixed(3));
    if (product.unit === 'count' && amount > 1) {
      node.appendChild(el('span', { class: 'pd-count', 'aria-hidden': 'true' }, String(amount)));
    }
    return node;
  }
  const mini = (id) => element(id, null, 'pd-product-mini');

  KMG.pd.products = { ALL: PRODUCTS, ONE_IDS: Object.keys(ONE), byId, amountsOf, svg, element, mini };
})(window.KMG);

// The detective's kit, drawn in code like the products: a magnifying glass,
// which shows the clue after a wrong pick, and a notebook, which shows the
// working after each case. There is no detective character (see the spec).
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;

  const LINE = 'stroke="#24324a" stroke-opacity="0.22" stroke-width="3" stroke-linejoin="round"';

  const DRAWINGS = {
    magnifier: `
      <path d="M76 76 L106 106" stroke="#9b7653" stroke-width="15" stroke-linecap="round"/>
      <path d="M76 76 L84 84" stroke="#24324a" stroke-width="15" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="33" fill="#e4f3fb" fill-opacity="0.85" stroke="#24324a" stroke-width="9"/>
      <path d="M32 42 Q36 30 48 27" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>`,

    notebook: `
      <rect x="24" y="10" width="78" height="100" rx="10" fill="#ff9d8a" ${LINE}/>
      <rect x="34" y="16" width="62" height="88" rx="6" fill="#f4f7fb" ${LINE}/>
      <path d="M44 38 H86 M44 54 H86 M44 70 H86 M44 86 H72" stroke="#9cc9f5" stroke-width="4" stroke-linecap="round"/>
      <g fill="#24324a" fill-opacity="0.55">
        <rect x="18" y="24" width="14" height="6" rx="3"/>
        <rect x="18" y="46" width="14" height="6" rx="3"/>
        <rect x="18" y="68" width="14" height="6" rx="3"/>
        <rect x="18" y="90" width="14" height="6" rx="3"/>
      </g>`,
  };

  const NAMES = { magnifier: 'magnifying glass', notebook: 'notebook' };

  const svg = (id) => `<svg class="pd-kit-svg" viewBox="0 0 120 120" role="img" aria-label="${NAMES[id]}">${DRAWINGS[id]}</svg>`;
  const element = (id, className = 'pd-kit') => el('span', { class: className, 'data-kit': id, html: svg(id) });
  const mini = (id) => element(id, 'pd-kit-mini');

  KMG.pd.kit = { ITEMS: Object.keys(DRAWINGS), svg, element, mini };
})(window.KMG);

// What each Price Detective level asks for. Plain logic with no drawing:
// `build` turns a level and the parent's settings into one round, a list of
// cases. Each case is one product on the shelf in two or three packs:
//
//   { kind, product, options: [{ amount, price, unit }], best, trick }
//
//   amount  the number in the pack, or its grams or millilitres
//   price   whole pence
//   unit    the price for one, or per 100g or 100ml, in whole pence (levels 3
//           to 5 only, where that is what the child compares)
//   best    the index in `options` of the better value; there is always
//           exactly one, as agreed in the spec
//   trick   level 5: the biggest pack is not the best value
//
// The rounds are made so every division is exact: a price for one or per
// 100g is chosen first, and the pack's price worked out from it.
(function (KMG) {
  'use strict';

  const { money } = KMG;
  const { products } = KMG.pd;

  const LEVELS = [
    { id: 1, kind: 'price', text: 'Which costs less?', spoken: 'Which one costs less?' },
    { id: 2, kind: 'amount', text: 'Which gives more?', spoken: 'They cost the same. Which one gives you more?' },
    { id: 3, kind: 'multipack', text: 'Multipacks', spoken: 'Which is better value? Find the price for one.' },
    { id: 4, kind: 'size', text: 'Bigger or smaller', spoken: 'Which is better value? Find the price for a hundred grams, or a hundred millilitres.' },
    { id: 5, kind: 'label', text: 'Read the label', spoken: 'Which is better value? Read the small print on the labels.' },
  ];

  const levelById = (id) => LEVELS.find((level) => level.id === id);
  const KINDS = LEVELS.map((level) => level.kind);

  // The limits in the spec's "Number rules"
  const RULES = {
    mostPrice: 500,
    level1Prices: [20, 200],
    level1Gap: 5,
    level2Prices: [50, 200],
    level2Ratio: 1.25,
    unitGap: 2,
    eachPrices: [5, 50],
    per100Prices: [5, 90],
  };

  // Level 3's pack sizes: one on its own, or a multipack of 2, 3, 4, 5 or 10
  const MULTIPACKS = [1, 2, 3, 4, 5, 10];

  const between = (rng, low, high) => low + rng.int(high - low + 1);

  // Keeps calling `make` until it returns something, a few hundred times at
  // most. The rules always leave a way through, so running out means a rule
  // has been changed so that it cannot be met: stop loudly rather than hang.
  function attempt(make) {
    for (let tries = 0; tries < 500; tries++) {
      const result = make();
      if (result) return result;
    }
    throw new Error('Price Detective could not make a case that keeps the rules');
  }
  const range = (low, high) => Array.from({ length: high - low + 1 }, (_, i) => low + i);
  // Prices for one are per 1 item; weights and volumes per 100g or 100ml.
  const per = (product) => (product.unit === 'count' ? 1 : 100);
  const unitPrice = (product, option) => (option.price * per(product)) / option.amount;

  // Every pair of a product's amounts, smallest first
  function pairs(list) {
    const found = [];
    list.forEach((a, i) => list.slice(i + 1).forEach((b) => found.push(a < b ? [a, b] : [b, a])));
    return found;
  }

  // Level 2's pairs: the bigger amount is at least a quarter more, and a
  // count product's smaller pack has at least two in it.
  const amountPairs = (product) => pairs(products.amountsOf(product))
    .filter(([a, b]) => b >= a * RULES.level2Ratio && (product.unit !== 'count' || a >= 2));

  // The unit prices a pack can have and stay within the most a pack costs
  function unitChoices(product, amount) {
    const [low, high] = product.unit === 'count' ? RULES.eachPrices : RULES.per100Prices;
    return range(low, high).filter((unit) => (unit * amount) / per(product) <= RULES.mostPrice);
  }

  // Unit prices for the given amounts, all at least RULES.unitGap apart, picked
  // one after another from what is left. Returns null if it runs out, which
  // the caller handles by trying again.
  function spacedUnits(rng, product, amounts) {
    const chosen = [];
    for (const amount of amounts) {
      const left = unitChoices(product, amount).filter((unit) => chosen.every((other) => Math.abs(unit - other) >= RULES.unitGap));
      if (!left.length) return null;
      chosen.push(rng.pick(left));
    }
    return chosen;
  }

  const multipacks = (product) => product.packs.filter((pack) => MULTIPACKS.includes(pack));

  // Which products each level can use
  const ELIGIBLE = {
    price: () => products.ALL,
    amount: () => products.ALL.filter((product) => amountPairs(product).length),
    multipack: () => products.ALL.filter((product) => product.unit === 'count' && multipacks(product).length >= 2),
    size: () => products.ALL.filter((product) => product.unit !== 'count' && product.sizes.length >= 2),
    label: () => products.ALL.filter((product) => product.unit !== 'count' && product.sizes.length >= 3),
  };

  // One case per kind. Each returns the options in shelf order.
  const MAKERS = {
    // Level 1: the same pack at two prices, at least 5p apart
    price(rng, product) {
      const amount = rng.pick(products.amountsOf(product));
      const [low, high] = RULES.level1Prices;
      const first = between(rng, low, high);
      const second = rng.pick(range(low, high).filter((price) => Math.abs(price - first) >= RULES.level1Gap));
      return [{ amount, price: first }, { amount, price: second }];
    },

    // Level 2: two amounts at the same price, a multiple of 5p
    amount(rng, product) {
      const [small, big] = rng.pick(amountPairs(product));
      const price = 5 * between(rng, RULES.level2Prices[0] / 5, RULES.level2Prices[1] / 5);
      return rng.shuffle([{ amount: small, price }, { amount: big, price }]);
    },

    // Level 3: two pack sizes, each with its own whole-pence price for one
    multipack(rng, product) {
      return attempt(() => {
        const amounts = rng.shuffle(rng.pick(pairs(multipacks(product))));
        const units = spacedUnits(rng, product, amounts);
        return units && amounts.map((amount, i) => ({ amount, price: (units[i] * amount) / per(product) }));
      });
    },

    // Level 4: two sizes, each with its own whole-pence price per 100g or 100ml
    size(rng, product) {
      return attempt(() => {
        const amounts = rng.shuffle(rng.pick(pairs(product.sizes)));
        const units = spacedUnits(rng, product, amounts);
        return units && amounts.map((amount, i) => ({ amount, price: (units[i] * amount) / per(product) }));
      });
    },

    // Level 5: three sizes. `trick` says whether the biggest pack must be worse
    // value than one of the others.
    label(rng, product, trick) {
      return attempt(() => {
        const amounts = rng.shuffle(product.sizes).slice(0, 3);
        const units = spacedUnits(rng, product, amounts);
        if (!units) return null;
        const biggest = amounts.indexOf(Math.max(...amounts));
        const cheapest = units.indexOf(Math.min(...units));
        if ((biggest !== cheapest) !== trick) return null;
        return amounts.map((amount, i) => ({ amount, price: (units[i] * amount) / per(product) }));
      });
    },
  };

  // The better value: the lower price, the bigger amount, or the lower unit price
  function bestOf(kind, product, options) {
    const score = {
      price: (option) => option.price,
      amount: (option) => -option.amount,
    }[kind] || ((option) => unitPrice(product, option));
    const scores = options.map(score);
    return scores.indexOf(Math.min(...scores));
  }

  // The products for a round, shuffled, never the same twice in a row. A long
  // round goes through the list again.
  function productOrder(rng, kind, count) {
    const list = ELIGIBLE[kind]().map((product) => product.id);
    const order = [];
    while (order.length < count) {
      const batch = rng.shuffle(list);
      if (batch[0] === order[order.length - 1]) batch.push(batch.shift());
      order.push(...batch);
    }
    return order.slice(0, count);
  }

  // Level 5: which cases are the big pack trick. About half, and at least one.
  function tricks(rng, count) {
    const list = Array.from({ length: count }, () => rng.next() < 0.5);
    if (!list.includes(true)) list[rng.int(count)] = true;
    return list;
  }

  function build(levelId, { roundLength, rng }) {
    const kind = levelById(levelId).kind;
    const trickList = kind === 'label' ? tricks(rng, roundLength) : [];
    const items = productOrder(rng, kind, roundLength).map((id, i) => {
      const product = products.byId(id);
      const options = MAKERS[kind](rng, product, trickList[i]);
      if (kind === 'multipack' || kind === 'size' || kind === 'label') {
        options.forEach((option) => { option.unit = unitPrice(product, option); });
      }
      return { kind, product: id, options, best: bestOf(kind, product, options), trick: Boolean(trickList[i]) };
    });
    return { kind, items, total: items.length };
  }

  // ---- Words: on the labels, spoken, and in the working ----

  // "4 apples", "500g", "1kg", "1 litre"
  function sizeText(productId, amount) {
    const product = products.byId(productId);
    if (product.unit === 'count') return `${amount} ${amount === 1 ? product.one : product.many}`;
    if (amount === 1000) return product.unit === 'g' ? '1kg' : '1 litre';
    return `${amount}${product.unit}`;
  }

  // "four apples", "five hundred grams of pasta", "one litre of milk"
  function sizeWords(productId, amount) {
    const product = products.byId(productId);
    if (product.unit === 'count') return `${money.number(amount)} ${amount === 1 ? product.one : product.many}`;
    const unitName = {
      g: amount === 1000 ? 'one kilogram' : `${money.number(amount)} grams`,
      ml: amount === 1000 ? 'one litre' : `${money.number(amount)} millilitres`,
    }[product.unit];
    return `${unitName} of ${product.name}`;
  }

  // "25p each", "25p per 100g", "25p per 100ml"
  function unitText(productId, unit) {
    const product = products.byId(productId);
    if (product.unit === 'count') return `${money.format(unit)} each`;
    return `${money.format(unit)} per 100${product.unit}`;
  }

  function unitWords(productId, unit) {
    const product = products.byId(productId);
    const each = { count: 'each', g: 'per hundred grams', ml: 'per hundred millilitres' }[product.unit];
    return `${money.words(unit)} ${each}`;
  }

  // What a shelf label says aloud: "four apples for one pound". With
  // `withUnit` (level 5's labels) it goes on to the small print: "..., twenty-
  // five p per hundred grams".
  function labelWords(productId, option, withUnit = false) {
    const words = `${sizeWords(productId, option.amount)} for ${money.words(option.price)}`;
    return withUnit ? `${words}, ${unitWords(productId, option.unit)}` : words;
  }

  // The working shown after a case, in shelf order:
  //   level 1   "45p is less than 60p"
  //   level 2   "10 eggs is more than 6 eggs"
  //   later     "25p each · 30p each"
  function working(item) {
    const best = item.options[item.best];
    const others = item.options.filter((option, i) => i !== item.best);
    if (item.kind === 'price') {
      return {
        text: `${money.format(best.price)} is less than ${money.format(others[0].price)}`,
        spoken: `${money.words(best.price)} is less than ${money.words(others[0].price)}`,
      };
    }
    if (item.kind === 'amount') {
      return {
        text: `${sizeText(item.product, best.amount)} is more than ${sizeText(item.product, others[0].amount)}`,
        spoken: `${sizeWords(item.product, best.amount)} is more than ${sizeWords(item.product, others[0].amount)}`,
      };
    }
    return {
      text: item.options.map((option) => unitText(item.product, option.unit)).join(' · '),
      spoken: item.options.map((option) => unitWords(item.product, option.unit)).join(', '),
    };
  }

  // The clue after a wrong pick: what the magnifying glass shows over each
  // pack, in shelf order, and what is said.
  //   level 1   each price                 "Compare the prices: ..."
  //   level 2   each size                  "They cost the same. Which is more: ..."
  //   later     each price for one or per 100g or 100ml
  function clue(item) {
    const { options, product } = item;
    if (item.kind === 'price') {
      return {
        texts: options.map((option) => money.format(option.price)),
        spoken: `Compare the prices: ${options.map((option) => money.words(option.price)).join(', or ')}.`,
      };
    }
    if (item.kind === 'amount') {
      return {
        texts: options.map((option) => sizeText(product, option.amount)),
        spoken: `They cost the same. Which is more: ${options.map((option) => sizeWords(product, option.amount)).join(', or ')}?`,
      };
    }
    const lead = {
      count: 'Work out the price for one',
      g: 'Work out the price for a hundred grams',
      ml: 'Work out the price for a hundred millilitres',
    }[products.byId(product).unit];
    return {
      texts: options.map((option) => unitText(product, option.unit)),
      spoken: `${lead}: ${options.map((option) => money.words(option.unit)).join(', or ')}.`,
    };
  }

  KMG.pd.levels = {
    LEVELS, KINDS, RULES, levelById, build, unitPrice,
    sizeText, sizeWords, unitText, unitWords, labelWords, working, clue,
  };
})(window.KMG);

// Shelf labels: the white label on the shelf's edge under each product, as
// supermarkets have, though copying no real shop's design. It shows the price
// in large type and the pack size; at level 5 it also prints the unit price
// in small type ("25p per 100g"). Tapping it says it aloud. Choosing a
// product is a tap on the product itself, so a child can hear a label
// without choosing (see DECISIONS.md).
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { money, pd } = KMG;

  // `item` is the case, `option` one of its packs; `showUnit` prints the unit price.
  function element(item, option, { showUnit = false, onTap = null } = {}) {
    const size = pd.levels.sizeText(item.product, option.amount);
    const unit = showUnit ? pd.levels.unitText(item.product, option.unit) : null;
    return el('button', {
      class: 'pd-label',
      'data-price': option.price,
      'data-amount': option.amount,
      'data-action': 'read-label',
      'aria-label': `${size}, ${money.format(option.price)}${unit ? `, ${unit}` : ''}. Hear it again`,
      onclick: onTap,
    },
    el('span', { class: 'pd-label-price' }, money.format(option.price)),
    el('span', { class: 'pd-label-size' }, size),
    unit && el('span', { class: 'pd-label-unit', 'data-unit': option.unit }, unit));
  }

  // A small label with a few words on it, for the home screen and lists
  const mini = (text) => el('span', { class: 'pd-label-mini' }, text);

  pd.label = { element, mini };
})(window.KMG);

// Price Detective's saved data: the shared progress store
// (src/shared/progress-store.js) with this game's settings. Mistakes are
// counted per kind of comparison ("multipack", "size" ...), and "big-pack"
// counts the times a child picked the biggest pack in a big pack trick case.
(function (KMG) {
  'use strict';

  const { pd } = KMG;

  const ROUND_LENGTHS = [5, 8, 10];
  const BIG_PACK = 'big-pack';

  const store = KMG.progressStore({
    key: 'price-detective',
    levels: () => pd.levels.LEVELS,
    settings: () => ({ roundLength: 5, showWorking: true }),
    keepOnReset: ['roundLength', 'showWorking'],
    isMistakeKey: (key) => pd.levels.KINDS.includes(key) || key === BIG_PACK,
    checkSettings(data, clean) {
      const { roundLength, showWorking } = data;
      if (ROUND_LENGTHS.indexOf(roundLength) === -1) return false;
      if (typeof showWorking !== 'boolean') return false;
      Object.assign(clean, { roundLength, showWorking });
      return true;
    },
  });

  pd.progress = Object.assign(store, { ROUND_LENGTHS, BIG_PACK });
})(window.KMG);

// Price Detective's play screen: the shelf. The shared frame
// (src/shared/play-screen.js) holds the level's name, which says the question
// when tapped; under it the products stand on a shelf with their labels on
// its edge, and the notebook below shows the working after each case. The
// play screen's tray is not needed.
//
// Each case is two packs of one product (three at level 5). The child taps the
// product they think is better value; a label only says itself when tapped.
//   right  a "Case solved!" stamp lands on it with a sparkle, the notebook
//          shows the working (unless the parent has switched it off), and
//          the next case comes, or the round ends
//   wrong  one mistake, a gentle wobble, and "Look again, detective": the
//          magnifying glass shows the clue over every pack (each price, size,
//          or price for one or per 100g), and that pack is ruled out, so the
//          same wrong pick cannot cost a second mistake
// At level 5, picking the biggest pack in a big pack trick case is also
// counted under "big-pack", for the grown-ups area, and the notebook says
// "Bigger is not always better value!" instead.
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { audio, speech, effects, pd } = KMG;

  // How long a solved case stays, so the working can be read and heard, and
  // how long without the working
  const SOLVED_MS = 3000;
  const SOLVED_QUICK_MS = 1300;
  // The stamp lands, then the cheerful notes
  const CORRECT_AFTER_MS = 120;

  function play(levelId, context) {
    const level = pd.levels.levelById(levelId);
    const saved = pd.progress.load();
    const round = pd.levels.build(levelId, { roundLength: saved.roundLength, rng: context.rng });

    const screen = KMG.playScreen.build({
      levelId,
      kind: round.kind,
      total: round.total,
      text: level.text,
      spoken: level.spoken,
      onBack: () => context.home(),
    });
    screen.tray.remove();

    let alive = true;
    // Busy while a solved case is showing. Shown as data-busy on the screen,
    // so tests can wait for it.
    let busy = false;
    const setBusy = (value) => {
      busy = value;
      screen.main.dataset.busy = String(value);
    };
    let index = 0;
    let mistakes = 0;
    const mistakesByKind = {};
    const item = () => round.items[index];

    const later = (callback, ms) => window.setTimeout(() => {
      if (alive) callback();
    }, ms);

    // The products stand on the shelf; their labels sit on its edge below.
    const productsRow = el('div', { class: 'pd-products' });
    const edge = el('div', { class: 'pd-edge' });
    const shelf = el('div', { class: 'pd-shelf', 'data-shelf': true }, productsRow, edge);
    const workingText = el('p', { class: 'pd-working', 'data-working': true, 'aria-live': 'polite' });
    const notebook = el('div', { class: 'pd-notebook', 'data-notebook': true, 'data-empty': 'true' },
      pd.kit.element('notebook'), workingText);
    screen.zones.appendChild(el('div', { class: 'pd-scene' }, shelf, notebook));

    // What the notebook says; empty hides it but keeps its space.
    function note(text) {
      workingText.textContent = text;
      notebook.dataset.empty = String(!text);
    }

    const picks = () => Array.from(productsRow.children);

    function showCase(entrance) {
      const it = item();
      productsRow.textContent = '';
      edge.textContent = '';
      delete shelf.dataset.clue;
      shelf.style.setProperty('--pd-count', it.options.length);
      it.options.forEach((option, i) => {
        const size = pd.levels.sizeText(it.product, option.amount);
        const pick = el('button', {
          class: `pd-pick${entrance ? ' pop' : ''}`,
          'data-option': i,
          'data-amount': option.amount,
          'aria-label': `Choose ${size}`,
        }, pd.products.element(it.product, option.amount));
        pick.addEventListener('click', () => choose(i, pick));
        productsRow.appendChild(pick);
        edge.appendChild(pd.label.element(it, option, {
          showUnit: it.kind === 'label',
          onTap: () => speech.say(pd.levels.labelWords(it.product, option, it.kind === 'label')),
        }));
      });
      note('');
    }

    // The magnifying glass passes over each pack in turn, leaving the clue
    // above it. Once per case.
    function showClue() {
      if (shelf.dataset.clue) return;
      shelf.dataset.clue = 'true';
      const { texts } = pd.levels.clue(item());
      picks().forEach((pick, i) => {
        // "85p per 100g" shows as "85p" large with "per 100g" small under it,
        // so it stays small enough not to hide the product on a phone.
        const space = texts[i].indexOf(' ');
        const main = space === -1 ? texts[i] : texts[i].slice(0, space);
        const sub = space === -1 ? '' : texts[i].slice(space + 1);
        pick.appendChild(el('span', { class: 'pd-clue', 'data-clue': texts[i], 'aria-label': texts[i], style: `--i:${i}` },
          pd.kit.mini('magnifier'),
          el('span', { class: 'pd-clue-text' },
            el('span', { class: 'pd-clue-main' }, main),
            sub && el('span', { class: 'pd-clue-sub' }, sub))));
      });
    }

    const count = (key) => {
      mistakesByKind[key] = (mistakesByKind[key] || 0) + 1;
    };

    function wrong(i, pick) {
      const it = item();
      mistakes++;
      count(it.kind);
      const biggest = Math.max(...it.options.map((option) => option.amount));
      // Fell for the big pack trick: say so, as that is the lesson here
      const fooled = it.trick && it.options[i].amount === biggest;
      if (fooled) count(pd.progress.BIG_PACK);

      audio.play('wrong');
      pick.classList.remove('wobble');
      void pick.offsetWidth;
      pick.classList.add('wobble');
      pick.dataset.ruledOut = 'true';
      pick.setAttribute('aria-disabled', 'true');
      showClue();
      if (fooled) {
        note('Bigger is not always better value!');
        speech.say(`Look again, detective. The biggest pack is not always the best value. ${pd.levels.clue(it).spoken}`);
      } else {
        note('Look again, detective.');
        speech.say(`Look again, detective. ${pd.levels.clue(it).spoken}`);
      }
    }

    function solve(pick) {
      setBusy(true);
      const it = item();
      pick.dataset.solved = 'true';
      pick.appendChild(el('span', { class: 'pd-stamp', 'data-stamp': true }, 'Case solved!'));
      audio.play('stamp');
      later(() => audio.play('correct'), CORRECT_AFTER_MS);
      const box = pick.getBoundingClientRect();
      effects.sparkle(box.left + box.width / 2, box.top + box.height / 2);

      if (saved.showWorking) {
        const { text, spoken } = pd.levels.working(it);
        note(text);
        speech.say(`Case solved! ${spoken}.`);
      } else {
        speech.say('Case solved!');
      }
      later(nextCase, saved.showWorking ? SOLVED_MS : SOLVED_QUICK_MS);
    }

    function choose(i, pick) {
      if (busy || !alive || pick.dataset.ruledOut) return;
      if (i === item().best) solve(pick);
      else wrong(i, pick);
    }

    function finishRound() {
      const stars = KMG.stars.forMistakes(mistakes);
      pd.progress.recordRound(levelId, { stars, mistakes: mistakesByKind, stage: 0, lastStage: 0 });
      const next = pd.levels.levelById(levelId + 1) ? () => play(levelId + 1, context) : null;
      KMG.celebrate(screen.main, {
        stars,
        onAgain: () => play(levelId, context),
        onNext: next,
        onHome: () => context.home(),
      });
    }

    function nextCase() {
      index++;
      screen.setDone(index);
      if (index === round.total) {
        finishRound();
        return;
      }
      showCase(true);
      setBusy(false);
    }

    screen.main.onleave = () => {
      alive = false;
      speech.stop();
    };

    showCase(false);
    setBusy(false);
    show(screen.main);
    screen.speak();
  }

  KMG.pd.play = play;
})(window.KMG);

// Price Detective's grown-ups area: the shared one (src/shared/parent-area.js)
// with this game's settings, the kinds of comparison to practise, and how
// often the child fell for level 5's big pack trick.
(function (KMG) {
  'use strict';

  const { el } = KMG.ui;
  const { pd, parentArea } = KMG;

  // How each kind of mistake is named in the list of things to practise
  const PRACTISE_NAMES = {
    price: 'Which costs less',
    amount: 'Which gives more',
    multipack: 'Multipacks',
    size: 'Bigger and smaller packs',
    label: 'Reading the label',
  };

  // Under the list: the big pack trick, counted apart from the comparisons
  // because it is about a habit (trusting the bigger pack), not a kind of sum.
  function bigPackNote(data) {
    const count = data.mistakes[pd.progress.BIG_PACK] || 0;
    const played = pd.progress.levelRecord(data, 5).plays > 0;
    let text;
    if (count) text = `Picked the bigger pack when it cost more: ${count === 1 ? 'once' : `${count} times`}.`;
    else if (played) text = 'Has never picked the bigger pack when it cost more.';
    else text = 'Level 5 has not been played yet.';
    return [
      el('h3', {}, 'The big pack trick'),
      el('p', { class: 'parent-note', 'data-big-pack': count }, text),
    ];
  }

  // Changes one saved setting.
  function saveSetting(name, value) {
    const saved = pd.progress.load();
    saved[name] = value;
    pd.progress.save(saved);
  }

  function settings(data) {
    return [
      parentArea.choices({
        title: 'Round length',
        values: pd.progress.ROUND_LENGTHS,
        current: data.roundLength,
        label: (length) => `${length} cases`,
        attr: 'round',
        onPick: (length) => saveSetting('roundLength', length),
      }),
      parentArea.section('Working',
        parentArea.toggle('Show the working after each case', 'working', data.showWorking,
          (on) => saveSetting('showWorking', on))),
    ];
  }

  function parent(context) {
    parentArea.show({
      gameName: 'Price Detective',
      store: pd.progress,
      fileName: 'price-detective-progress.json',
      levels: pd.levels.LEVELS,
      settings,
      practise: {
        title: 'Comparisons to practise',
        item: (key) => el('span', { class: 'pd-practise' }, PRACTISE_NAMES[key] || key),
        include: (key) => key !== pd.progress.BIG_PACK,
      },
      notes: bigPackNote,
      onDone: () => context.home(),
    });
  }

  pd.parent = parent;
})(window.KMG);

// Price Detective's home screen: the shared level picker
// (src/shared/level-picker.js) with a product and a label on each level's card.
(function (KMG) {
  'use strict';

  const { pd } = KMG;

  const product = (id) => pd.products.mini(id);
  const label = (text) => pd.label.mini(text);

  const LEVEL_ART = {
    1: () => [product('apples'), label('45p')],
    2: () => [product('eggs'), label('£1')],
    3: () => [product('yoghurts'), label('4 for £1')],
    4: () => [product('pasta'), label('500g')],
    5: () => [product('juice'), pd.kit.mini('magnifier')],
  };

  function home(context) {
    KMG.levelPicker.show({
      title: 'Price Detective',
      levels: pd.levels.LEVELS,
      art: (level) => LEVEL_ART[level.id](),
      store: pd.progress,
      onPlay: (levelId) => pd.play(levelId, context),
      onParent: () => pd.parent(context),
      exit: context.exit,
    });
  }

  pd.home = home;
})(window.KMG);

// Price Detective's entry point: registers the game with the hub or standalone boot.
(function (KMG) {
  'use strict';

  const { el, show } = KMG.ui;
  const { pd } = KMG;

  // Labels for the gallery: each way a pack is sized and priced
  const SAMPLE_LABELS = [
    { product: 'apples', option: { amount: 1, price: 30, unit: 30 } },
    { product: 'yoghurts', option: { amount: 4, price: 100, unit: 25 } },
    { product: 'pasta', option: { amount: 500, price: 125, unit: 25 } },
    { product: 'rice', option: { amount: 1000, price: 180, unit: 18 } },
    { product: 'juice', option: { amount: 300, price: 90, unit: 30 } },
    { product: 'milk', option: { amount: 1000, price: 95, unit: 10 } },
  ];

  // ?debug=1&products=1 shows every product, the shelf labels with and without
  // the unit price, and the detective's kit, for checking the artwork.
  function gallery() {
    const items = pd.products.ALL.map((product) => el('figure', { class: 'pd-gallery-item' },
      pd.products.element(product.id),
      el('figcaption', {}, product.id)));

    // Packs of different sizes: single items, multipack stickers, and
    // weights drawn smaller for smaller packs
    const packs = [['apples', 1], ['yoghurts', 1], ['bananas', 1], ['tins', 1], ['yoghurts', 4], ['eggs', 12],
      ['rice', 400], ['rice', 1000], ['milk', 200], ['milk', 1000]].map(([id, amount]) => el('figure', {
      class: 'pd-gallery-item', 'data-pack-sample': `${id}-${amount}`,
    }, pd.products.element(id, amount), el('figcaption', {}, pd.levels.sizeText(id, amount))));

    const labels = SAMPLE_LABELS.map(({ product, option }, i) => el('figure', { class: 'pd-gallery-item', 'data-label-sample': i },
      pd.label.element({ product }, option, { showUnit: i % 2 === 1 }),
      el('figcaption', {}, pd.levels.labelWords(product, option))));

    const kit = pd.kit.ITEMS.map((id) => el('figure', { class: 'pd-gallery-item' },
      pd.kit.element(id), el('figcaption', {}, id)));

    show(el('main', { class: 'pd-gallery', 'data-screen': 'gallery' },
      el('h2', {}, 'Products'), el('div', { class: 'pd-gallery-grid' }, items),
      el('h2', {}, 'Pack sizes'), el('div', { class: 'pd-gallery-grid' }, packs),
      el('h2', {}, 'Shelf labels'), el('div', { class: 'pd-gallery-grid' }, labels),
      el('h2', {}, "Detective's kit"), el('div', { class: 'pd-gallery-grid' }, kit)));
  }

  KMG.registerGame('price-detective', {
    // Called once before any of this game's art is drawn. Nothing to set up:
    // the drawings carry everything they need.
    prepare() {},

    // The picture on the hub tile.
    art: () => [pd.products.mini('cereal'), pd.kit.mini('magnifier'), pd.products.mini('juice')],

    open(exit) {
      const context = { exit, rng: KMG.rng.create(KMG.debug.seed) };
      context.home = () => pd.home(context);

      if (KMG.debug.flag('products')) gallery();
      else if (KMG.debug.level) pd.play(KMG.debug.level, context);
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
      // data-count lets the stylesheet arrange four games as two by two
      el('div', { class: 'hub-tiles', 'data-count': KMG.build.games.length }, KMG.build.games.map(tile)),
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
