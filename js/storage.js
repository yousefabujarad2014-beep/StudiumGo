/* StudiumGo — lokale opslag: voortgang, spaced repetition, streaks, instellingen. */
(function () {
  "use strict";

  var KEY = "studium.v1";
  var DAY = 86400000;
  var activeId = null;

  // Per account een eigen opslagruimte; zonder account = gastprofiel.
  function storageKey() { return activeId ? "studium.user." + activeId : KEY; }
  function setActive(id) { activeId = id || null; }
  function getActive() { return activeId; }

  function defaults() {
    return {
      version: 1,
      reviews: {},
      stats: { studied: 0, correct: 0, wrong: 0, sessions: 0, minutes: 0, bestAccuracy: 0 },
      streak: { count: 0, best: 0, lastDay: 0, totalDays: 0 },
      achievements: {},
      errors: [],
      custom: [],
      settings: {
        theme: "dark",
        macrons: true,
        sound: true,
        direction: "both",
        pageSize: 15,
        minutes: 5,
        weakOnly: false,
        year: 1,
        book: "pegasus-1",
        from: 1,
        to: 12
      }
    };
  }

  function read() {
    var base = defaults();
    var raw = null;
    try { raw = localStorage.getItem(storageKey()); } catch (e) { return base; }
    if (!raw) return base;
    try {
      var data = JSON.parse(raw);
      if (data && typeof data === "object") {
        if (data.reviews && typeof data.reviews === "object") base.reviews = data.reviews;
        if (data.stats) Object.assign(base.stats, data.stats);
        if (data.streak) Object.assign(base.streak, data.streak);
        if (data.achievements && typeof data.achievements === "object") base.achievements = data.achievements;
        if (Array.isArray(data.errors)) base.errors = data.errors.slice(-200);
        if (Array.isArray(data.custom)) base.custom = data.custom;
        if (data.settings) Object.assign(base.settings, data.settings);
      }
    } catch (e) { /* corrupt: begin opnieuw */ }
    return base;
  }

  function write(data) {
    try { localStorage.setItem(storageKey(), JSON.stringify(data)); } catch (e) { /* volle opslag */ }
    return data;
  }

  function dayNumber() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
  }

  function getSettings() { return read().settings; }

  function setSetting(key, value) {
    var data = read();
    data.settings[key] = value;
    write(data);
    return value;
  }

  function getStats() { return read().stats; }

  function getReview(id) {
    var r = read().reviews[id];
    return r || { ease: 2.5, interval: 0, due: 0, reps: 0, lapses: 0, last: 0 };
  }

  function getReviews() { return read().reviews; }

  // Eenvoudige SM-2-achtige herhaling.
  function review(id, correct) {
    var data = read();
    var r = data.reviews[id] || { ease: 2.5, interval: 0, due: 0, reps: 0, lapses: 0, last: 0 };
    var now = Date.now();

    if (correct) {
      r.reps += 1;
      r.ease = Math.min(3.0, r.ease + 0.05);
      if (r.reps === 1) r.interval = 1;
      else if (r.reps === 2) r.interval = 3;
      else r.interval = Math.max(1, Math.round(r.interval * r.ease));
      r.due = now + r.interval * DAY;
      data.stats.correct += 1;
    } else {
      r.lapses += 1;
      r.reps = 0;
      r.interval = 0;
      r.ease = Math.max(1.3, r.ease - 0.2);
      r.due = now;
      data.stats.wrong += 1;
      var found = false;
      for (var i = 0; i < data.errors.length; i++) {
        if (data.errors[i].id === id) { data.errors[i].count += 1; data.errors[i].last = now; found = true; break; }
      }
      if (!found) data.errors.push({ id: id, count: 1, last: now });
    }
    r.last = now;
    data.reviews[id] = r;
    data.stats.studied += 1;
    write(data);
    return r;
  }

  function isMastered(id) {
    var r = getReview(id);
    return r.reps >= 3 && r.interval >= 7;
  }

  function masteredCount(ids) {
    var reviews = read().reviews;
    var n = 0;
    for (var i = 0; i < ids.length; i++) {
      var r = reviews[ids[i]];
      if (r && r.reps >= 3 && r.interval >= 7) n++;
    }
    return n;
  }

  function dueCount(ids) {
    var reviews = read().reviews;
    var now = Date.now();
    var n = 0;
    for (var i = 0; i < ids.length; i++) {
      var r = reviews[ids[i]];
      if (!r || r.due <= now) n++;
    }
    return n;
  }

  function finishSession(seconds, accuracy) {
    var data = read();
    data.stats.sessions += 1;
    data.stats.minutes += Math.round(seconds / 60);
    if (accuracy > data.stats.bestAccuracy) data.stats.bestAccuracy = accuracy;
    var day = dayNumber();
    if (data.streak.lastDay !== day) {
      data.streak.count = data.streak.lastDay === day - 1 ? data.streak.count + 1 : 1;
      data.streak.lastDay = day;
      data.streak.totalDays += 1;
      if (data.streak.count > data.streak.best) data.streak.best = data.streak.count;
    }
    write(data);
    return data.streak;
  }

  function getStreak() { return read().streak; }

  function getErrors() { return read().errors; }

  function clearErrors() {
    var data = read();
    data.errors = [];
    write(data);
  }

  function getCustom() { return read().custom; }

  function addCustom(latin, dutch, caput) {
    var data = read();
    data.custom.push({ id: "c-" + Date.now() + "-" + Math.floor(Math.random() * 1000), latin: latin, dutch: dutch, caput: caput || 99 });
    write(data);
  }

  function removeCustom(id) {
    var data = read();
    data.custom = data.custom.filter(function (c) { return c.id !== id; });
    delete data.reviews[id];
    write(data);
  }

  var ACHIEVEMENTS = [
    { id: "eerste", ico: "🌱", title: "Eerste pas", desc: "Rond je eerste sessie af" },
    { id: "tien", ico: "🔟", title: "Tien woorden", desc: "Beheers 10 woorden" },
    { id: "vijftig", ico: "🏛️", title: "Vijftig woorden", desc: "Beheers 50 woorden" },
    { id: "honderd", ico: "🏆", title: "Honderd woorden", desc: "Beheers 100 woorden" },
    { id: "perfect", ico: "💯", title: "Foutloos", desc: "Haal 100% in een sessie" },
    { id: "streak3", ico: "🔥", title: "Drie dagen", desc: "Studieer 3 dagen op rij" },
    { id: "streak7", ico: "🌟", title: "Week lang", desc: "Studieer 7 dagen op rij" },
    { id: "stamtijd", ico: "⚔️", title: "Stamtijden", desc: "Oefen je eerste stamtijd" },
    { id: "eigen", ico: "✍️", title: "Eigen woord", desc: "Voeg een eigen woord toe" },
    { id: "caput", ico: "📖", title: "Caput gesloten", desc: "Beheers een heel caput" }
  ];

  function getAchievements() { return read().achievements; }

  function unlock(id) {
    var data = read();
    if (data.achievements[id]) return null;
    data.achievements[id] = Date.now();
    write(data);
    for (var i = 0; i < ACHIEVEMENTS.length; i++) if (ACHIEVEMENTS[i].id === id) return ACHIEVEMENTS[i];
    return null;
  }

  function exportData() { return JSON.stringify(read(), null, 2); }

  function importData(json) {
    var data = JSON.parse(json);
    if (!data || typeof data !== "object") throw new Error("Ongeldig bestand");
    write(data);
  }

  function reset() {
    try { localStorage.removeItem(storageKey()); } catch (e) {}
  }

  window.StudiumStorage = {
    KEY: KEY,
    DAY: DAY,
    ACHIEVEMENTS: ACHIEVEMENTS,
    setActive: setActive,
    getActive: getActive,
    read: read,
    write: write,
    dayNumber: dayNumber,
    getSettings: getSettings,
    setSetting: setSetting,
    getStats: getStats,
    getReview: getReview,
    getReviews: getReviews,
    review: review,
    isMastered: isMastered,
    masteredCount: masteredCount,
    dueCount: dueCount,
    finishSession: finishSession,
    getStreak: getStreak,
    getErrors: getErrors,
    clearErrors: clearErrors,
    getCustom: getCustom,
    addCustom: addCustom,
    removeCustom: removeCustom,
    getAchievements: getAchievements,
    unlock: unlock,
    exportData: exportData,
    importData: importData,
    reset: reset
  };
})();
