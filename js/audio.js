/* StudiumGo — kleine geluiden via Web Audio, geen bestanden nodig. */
(function () {
  "use strict";

  var ctx = null;
  var master = null;
  var muted = false;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, when, vol) {
    var c = ensure();
    if (!c) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  var SOUNDS = {
    click: function () { tone(520, 0.08, "sine", 0, 0.12); },
    correct: function () { tone(660, 0.11, "sine", 0, 0.2); tone(880, 0.16, "sine", 0.09, 0.18); },
    wrong: function () { tone(220, 0.16, "triangle", 0, 0.2); tone(165, 0.2, "triangle", 0.1, 0.16); },
    flip: function () { tone(440, 0.07, "sine", 0, 0.1); tone(560, 0.07, "sine", 0.06, 0.1); },
    done: function () { tone(523, 0.12, "sine", 0, 0.18); tone(659, 0.12, "sine", 0.1, 0.18); tone(784, 0.24, "sine", 0.2, 0.2); },
    star: function () { tone(880, 0.1, "sine", 0, 0.18); tone(1175, 0.18, "sine", 0.08, 0.18); }
  };

  window.StudiumAudio = {
    ensure: ensure,
    setMuted: function (m) { muted = !!m; if (master) master.gain.value = muted ? 0 : 0.35; },
    isMuted: function () { return muted; },
    play: function (name) { if (!muted && SOUNDS[name]) SOUNDS[name](); },
    haptic: function (pattern) {
      try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
    }
  };
})();
