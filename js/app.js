/* StudiumGo — applicatielogica: sessies, flashcards, herhaling, schermen. */
(function () {
  "use strict";

  var Data = window.StudiumData;
  var Store = window.StudiumStorage;
  var Accounts = window.StudiumAccounts;
  var Audio = window.StudiumAudio;

  function $(id) { return document.getElementById(id); }

  var state = {
    screen: "home",
    setup: { year: 1, book: "pegasus-1", caput: "all", from: 1, to: 12, wordFrom: 1, wordTo: 0, direction: "both", size: 15, minutes: 5, weak: false },
    session: null,
    grammar: "cases",
    guide: "basis",
    accountMode: "login",
    accountYear: 1,
    timer: 0,
    toastTimer: 0
  };

  /* ---------------------------------------------------------------- */
  /* Algemeen                                                         */
  /* ---------------------------------------------------------------- */

  function say(msg) { if ($("live")) $("live").textContent = msg; }

  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  function show(name) {
    state.screen = name;
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    var s = $("screen-" + name);
    if (s) s.classList.add("active");
    window.scrollTo && window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------------- */
  /* Accounts                                                         */
  /* ---------------------------------------------------------------- */

  function applyAccount() {
    var account = Accounts.current();
    Store.setActive(account ? account.id : null);
    if (account) Store.write(Store.read());
    var btn = $("btn-user");
    if (btn) {
      btn.textContent = "👤";
      btn.title = account ? "Account: " + account.name : "Account maken of kiezen";
    }
    return account;
  }

  function yearButtonsHtml(year) {
    return Data.YEARS.map(function (y) {
      return '<button type="button" data-year="' + y.n + '"' +
        (y.n === Number(year) ? ' class="active"' : "") + '>' + y.label + '</button>';
    }).join("");
  }

  function useAccount(account) {
    var settings = Store.getSettings();
    var year = Number(account && account.year) || Number(settings.year) || 1;
    if (!Data.findYear(year)) year = 1;
    state.setup.year = year;
    state.setup.book = "pegasus-" + year; // altijd Pegasus Novus
    state.accountYear = year;
    Store.setSetting("year", year);
    Store.setSetting("book", state.setup.book);
  }

  function renderAccountScreen() {
    var tabs = $("account-tabs").querySelectorAll("button");
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle("active", tabs[i].getAttribute("data-account-tab") === state.accountMode);
    $("account-submit").textContent = state.accountMode === "login" ? "Inloggen" : "Account maken";
    $("account-error").textContent = "";

    $("account-year-wrap").classList.toggle("hidden", state.accountMode !== "register");
    $("account-year").innerHTML = yearButtonsHtml(state.accountYear);
    $("account-book").textContent = "Boek: Pegasus Novus " + state.accountYear;

    var users = Accounts.list();
    $("account-existing").innerHTML = users.length
      ? '<p class="muted">Bestaande profielen op dit apparaat:</p>' + users.map(function (a) {
          return '<button class="account-user" type="button" data-user="' + a.id + '">👤 ' + a.name +
            '<small>' + new Date(a.created).toLocaleDateString("nl-NL") + '</small></button>';
        }).join("")
      : "";
  }

  function handleDeepLink() {
    var params = new URLSearchParams(location.search);
    if (params.get("stems") === "1") startSession("stems", { size: 10, minutes: 0 });
    else if (params.get("dict") === "1") { renderDict(); show("dict"); }
    else if (params.get("analysis") === "1") { renderAnalysis(); show("analysis"); }
    else if (params.get("leaderboard") === "1") { renderLeaderboard(); show("leaderboard"); }
    else if (params.get("guide") === "1") { renderGuide(); show("guide"); }
  }

  function afterLogin(account) {
    $("account-password").value = "";
    applyAccount();
    useAccount(account);
    renderSettings();
    renderSetup();
    updateHome();
    show("home");
    toast("Welkom, " + account.name + "!");
    say("Ingelogd als " + account.name + ".");
    handleDeepLink();
  }

  function submitAccount() {
    var name = $("account-name").value.trim();
    var pw = $("account-password").value;
    var err = $("account-error");
    try {
      var account = state.accountMode === "login"
        ? Accounts.login(name, pw)
        : Accounts.create(name, pw, state.accountYear);
      if (!account) { err.textContent = "Onbekende naam of verkeerd wachtwoord."; return; }
      afterLogin(account);
    } catch (e) {
      err.textContent = e.message;
    }
  }

  function gotoAccount() {
    var current = Accounts.current();
    if (current) state.accountYear = Number(current.year) || 1;
    $("account-name").value = "";
    $("account-password").value = "";
    renderAccountScreen();
    show("account");
  }

  function stripMarks(str) {
    return String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function normLatin(str) { return stripMarks(str).toLowerCase().replace(/[^a-z]/g, ""); }

  function normDutch(str) {
    return stripMarks(str).toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function displayLatin(str) {
    return Store.getSettings().macrons ? String(str || "") : stripMarks(str);
  }

  function allWords() {
    var out = Data.WORDS.slice();
    Store.getCustom().forEach(function (c) {
      out.push({
        id: c.id, key: normLatin(c.latin), latin: c.latin, dutch: c.dutch,
        caput: c.caput || 99, pos: "zn.", custom: true
      });
    });
    return out;
  }

  function findById(id) {
    var list = allWords();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    var stems = Data.STEMS;
    for (var j = 0; j < stems.length; j++) if (stems[j].id === id) return stems[j];
    return null;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------------------------------------------------------------- */
  /* Kaarten bouwen                                                   */
  /* ---------------------------------------------------------------- */

  function dutchAnswers(value) {
    return String(value || "").split(/[\/,]| of /i).map(normDutch).filter(Boolean);
  }

  function caputList(opts) {
    var cap = String(opts.caput || "all");
    if (cap === "all") return null;
    if (cap.indexOf("-") >= 0) {
      var parts = cap.split("-");
      var out = [];
      for (var i = Number(parts[0]); i <= Number(parts[1]); i++) out.push(i);
      return out;
    }
    return [Number(cap)];
  }

  function resolveBook(opts) {
    opts = opts || state.setup;
    if (opts.book) return Data.findBook(opts.book);
    if (opts.method) return Data.findBook(Data.findMethod(opts.method).id + "-" + (Number(opts.year) || 1));
    return Data.findBook(state.setup.book);
  }

  function selectedWords(opts) {
    opts = opts || state.setup;
    var book = resolveBook(opts);
    var list = caputList(opts);
    var words = [];
    var seen = {};
    function add(w, caput) {
      if (seen[w.id]) return;
      seen[w.id] = true;
      words.push(Object.assign({}, w, { displayCaput: caput || w.caput }));
    }
    if (!list) {
      Data.byBookCaput(book.id, "all").forEach(function (w) { add(w, book.assign(w)); });
      Store.getCustom().forEach(function (w) { add(w, w.caput || 99); });
    } else {
      list.forEach(function (n) {
        Data.byBookCaput(book.id, n).forEach(function (w) { add(w, n); });
      });
      Store.getCustom().forEach(function (c) {
        if (list.indexOf(c.caput) >= 0) add({
          id: c.id, key: normLatin(c.latin), latin: c.latin, dutch: c.dutch,
          caput: c.caput, pos: "zn.", custom: true
        }, c.caput);
      });
    }

    var from = Number(opts.wordFrom) || 1;
    var to = Number(opts.wordTo) || 0;
    if (from > 1 || to > 0) {
      words = words.filter(function (w) {
        if (!w.number) return true; // eigen woorden hebben geen boeknummer
        return w.number >= from && (!to || w.number <= to);
      });
    }
    return words;
  }

  function buildVocabCards(opts) {
    opts = opts || state.setup;
    if (!opts.book && !opts.method) opts.book = state.setup.book;
    var words = selectedWords(opts);

    if (opts.weak) {
      words = words.filter(function (w) {
        var r = Store.getReview(w.id);
        return r.lapses > 0 || r.reps < 3 || r.due <= Date.now();
      });
    }

    var now = Date.now();
    var due = [], fresh = [], known = [];
    words.forEach(function (w) {
      var r = Store.getReview(w.id);
      if (r.reps > 0 && r.due <= now) due.push(w);
      else if (r.reps === 0) fresh.push(w);
      else known.push(w);
    });
    var ordered = shuffle(due).concat(shuffle(fresh), shuffle(known));
    var picked = ordered.slice(0, opts.size);

    return shuffle(picked).map(function (w) {
      var dir = opts.direction === "both" ? (Math.random() < 0.5 ? "lat-nl" : "nl-lat") : opts.direction;
      var lat = normLatin(w.latin);
      var expected = dir === "lat-nl" ? dutchAnswers(w.dutch) : [lat];
      return {
        kind: "vocab",
        id: w.id,
        word: w,
        direction: dir,
        prompt: dir === "lat-nl" ? displayLatin(w.latin) : w.dutch,
        answerText: dir === "lat-nl" ? w.dutch : displayLatin(w.latin),
        accepted: expected,
        label: dir === "lat-nl" ? "Latijn → Nederlands" : "Nederlands → Latijn",
        meta: (w.displayCaput === 99 ? "Eigen woord" : "Caput " + (w.displayCaput || w.caput)) +
          (w.number ? " · woord " + w.number : "") + " · " + w.pos
      };
    });
  }

  function buildStemCards(size) {
    var stems = shuffle(Data.STEMS.slice()).slice(0, Math.min(size || 10, 10));
    return stems.map(function (s) {
      return {
        kind: "stem",
        id: s.id,
        stem: s,
        prompt: displayLatin(s.present) + ", " + displayLatin(s.infinitive),
        answerText: displayLatin(s.perfect),
        accepted: [normLatin(s.perfect)],
        label: "Stamtijden · perfectum",
        meta: s.dutch + " · voltooid verleden tijd"
      };
    });
  }

  /* ---------------------------------------------------------------- */
  /* Sessie                                                           */
  /* ---------------------------------------------------------------- */

  function startSession(kind, opts) {
    clearInterval(state.timer);
    var cards;
    if (kind === "stems") cards = buildStemCards(opts && opts.size ? opts.size : 10);
    else cards = buildVocabCards(opts || state.setup);

    if (!cards.length) {
      toast("Geen woorden gevonden — kies een ander caput of zet de filter uit.");
      return;
    }

    state.session = {
      kind: kind,
      queue: cards,
      index: 0,
      total: cards.length,
      correct: 0,
      answered: 0,
      score: 0,
      seconds: 0,
      limit: (opts && typeof opts.minutes === "number" ? opts.minutes : state.setup.minutes) * 60,
      current: null,
      pending: false,
      hinted: false,
      finished: false
    };

    show("session");
    renderCard();
    state.timer = setInterval(tick, 1000);
  }

  function tick() {
    var s = state.session;
    if (!s || s.finished || state.screen !== "session") return;
    s.seconds += 1;
    if (s.limit > 0 && s.seconds >= s.limit) {
      finishSession(true);
      return;
    }
    var t = $("sess-time");
    if (t) {
      t.textContent = s.limit > 0 ? formatTime(s.limit - s.seconds) : formatTime(s.seconds);
      t.style.color = s.limit > 0 && s.limit - s.seconds <= 15 ? "var(--red)" : "";
    }
  }

  function updateSessionBar() {
    var s = state.session;
    if (!s) return;
    var done = Math.min(s.index, s.total);
    var pct = s.total ? Math.round((done / s.total) * 100) : 0;
    var bar = $("sess-progress");
    if (bar) bar.style.width = pct + "%";
    var count = $("sess-count");
    if (count) count.textContent = Math.min(s.index + 1, s.total) + " / " + s.total;
    var score = $("sess-score");
    if (score) score.textContent = s.score + " punten";
    var time = $("sess-time");
    if (time) time.textContent = s.limit > 0 ? formatTime(s.limit - s.seconds) : formatTime(s.seconds);
  }

  function renderCard() {
    var s = state.session;
    if (!s) return;
    if (s.index >= s.queue.length) { finishSession(false); return; }
    s.current = s.queue[s.index];
    s.pending = false;
    s.hinted = false;

    $("sess-label").textContent = s.current.label;
    $("sess-prompt").textContent = s.current.prompt;
    $("sess-meta").textContent = s.current.meta || "";
    $("sess-feedback").textContent = "";
    $("sess-feedback").className = "feedback";
    $("sess-hint").textContent = "";
    var input = $("sess-input");
    input.value = "";
    input.className = "";
    input.placeholder = s.current.direction === "nl-lat" ? "Typ het Latijnse woord…" : "Typ de Nederlandse betekenis…";
    $("sess-check").textContent = "Controleer ↵";
    input.focus();
    updateSessionBar();
  }

  function isCorrect(value, card) {
    var v = card.kind === "stem" || card.direction === "nl-lat" ? normLatin(value) : normDutch(value);
    for (var i = 0; i < card.accepted.length; i++) {
      var a = card.kind === "stem" || card.direction === "nl-lat" ? normLatin(card.accepted[i]) : normDutch(card.accepted[i]);
      if (v && v === a) return true;
    }
    return false;
  }

  function checkAnswer() {
    var s = state.session;
    if (!s || s.finished || state.screen !== "session") return;
    if (s.pending) { nextCard(); return; }

    var input = $("sess-input");
    var value = input.value.trim();
    if (!value) { toast("Typ eerst een antwoord."); input.focus(); return; }

    var ok = isCorrect(value, s.current);
    s.answered += 1;
    Store.review(s.current.id, ok);

    var fb = $("sess-feedback");
    if (ok) {
      s.correct += 1;
      var bonus = s.hinted ? 5 : 10;
      s.score += bonus;
      fb.textContent = "✅ Goed! +" + bonus + " punten";
      fb.className = "feedback good";
      input.className = "good";
      Audio.play("correct");
      Audio.haptic(12);
    } else {
      fb.textContent = "❌ Niet helemaal. Juist: " + s.current.answerText;
      fb.className = "feedback bad";
      input.className = "bad";
      Audio.play("wrong");
      Audio.haptic(50);
      if (!s.current.repeat) {
        var again = Object.assign({}, s.current, { repeat: true });
        s.queue.splice(Math.min(s.index + 3, s.queue.length), 0, again);
        s.total = Math.max(s.total, s.queue.length);
      }
    }
    s.pending = true;
    $("sess-check").textContent = "Volgende ↵";
    updateSessionBar();
    say(ok ? "Goed." : "Fout. Juist antwoord: " + s.current.answerText);
  }

  function nextCard() {
    var s = state.session;
    if (!s) return;
    s.index += 1;
    renderCard();
  }

  function skipCard() {
    var s = state.session;
    if (!s || s.pending) return;
    s.index += 1;
    renderCard();
  }

  function useHint() {
    var s = state.session;
    if (!s || s.pending) return;
    var answer = s.current.answerText;
    var first = answer.charAt(0);
    $("sess-hint").textContent = "💡 Begint met “" + first + "” · " + normLatin(answer).length + " letters";
    s.hinted = true;
    Audio.play("flip");
  }

  function stopSession() {
    if (!state.session || state.session.finished) return;
    if (!window.confirm("Sessie stoppen? Je voortgang wordt opgeslagen.")) return;
    finishSession(false);
  }

  function finishSession(timedOut) {
    var s = state.session;
    if (!s || s.finished) return;
    clearInterval(state.timer);
    s.finished = true;
    var accuracy = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
    var streak = Store.finishSession(s.seconds, accuracy);

    var unlocked = [];
    function grant(id) {
      var a = Store.unlock(id);
      if (a) unlocked.push(a);
    }
    grant("eerste");
    var ids = allWords().map(function (w) { return w.id; });
    var mastered = Store.masteredCount(ids);
    if (mastered >= 10) grant("tien");
    if (mastered >= 50) grant("vijftig");
    if (mastered >= 100) grant("honderd");
    if (accuracy === 100 && s.answered >= 5) grant("perfect");
    if (streak.count >= 3) grant("streak3");
    if (streak.count >= 7) grant("streak7");
    if (s.kind === "stems") grant("stamtijd");
    Data.CAPITULA.forEach(function (c) {
      var list = Data.byBookCaput(state.setup.book, c.n);
      if (list.length && Store.masteredCount(list.map(function (w) { return w.id; })) === list.length) grant("caput");
    });
    unlocked.forEach(function (a, i) {
      setTimeout(function () { toast(a.ico + " Prestatie: " + a.title); Audio.play("star"); }, 250 + i * 700);
    });
    Audio.play("done");

    $("summary-title").textContent = timedOut ? "Tijd om!" : "Sessie afgerond!";
    $("summary-sub").textContent = s.kind === "stems" ? "Je stamtijden zijn weer scherper." : "Elk woord dat je nu goed had, komt later minder vaak terug.";
    $("summary-score").textContent = s.score;
    $("summary-accuracy").textContent = accuracy + "%";
    $("summary-words").textContent = s.answered;
    $("summary-time").textContent = formatTime(s.seconds);
    $("summary-streak").textContent = streak.count > 1 ? "🔥 " + streak.count + " dagen op rij!" : "";
    $("summary-achievements").innerHTML = unlocked.map(function (a) {
      return '<div class="ach-item"><span class="ico">' + a.ico + '</span><span><strong>' + a.title + '</strong><small>' + a.desc + '</small></span></div>';
    }).join("");
    show("summary");
    updateHome();
    say("Sessie klaar. " + accuracy + " procent goed.");
  }

  /* ---------------------------------------------------------------- */
  /* Home                                                             */
  /* ---------------------------------------------------------------- */

  function todayReviewed() {
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var t = start.getTime();
    var reviews = Store.getReviews();
    var n = 0;
    Object.keys(reviews).forEach(function (id) {
      if (reviews[id].last >= t) n++;
    });
    return n;
  }

  function updateHome() {
    var st = Store.getStats();
    var streak = Store.getStreak();
    var total = st.correct + st.wrong;
    var ids = allWords().map(function (w) { return w.id; });
    var mastered = Store.masteredCount(ids);

    $("stat-streak").textContent = streak.count;
    $("stat-mastered").textContent = mastered;
    $("stat-accuracy").textContent = (total ? Math.round((st.correct / total) * 100) : 0) + "%";
    $("stat-sessions").textContent = st.sessions;

    var today = Math.min(10, todayReviewed());
    $("goal-text").textContent = today + " / 10 woorden";
    $("goal-fill").style.width = (today * 10) + "%";

    var book = Data.findBook(state.setup.book);
    $("home-years").innerHTML = yearButtonsHtml(state.setup.year);
    $("method-note").textContent = book.name + " · " + book.note;

    $("home-capits").innerHTML = Data.CAPITULA.map(function (c) {
      var list = Data.byBookCaput(book.id, c.n);
      var done = Store.masteredCount(list.map(function (w) { return w.id; }));
      var pct = list.length ? Math.round((done / list.length) * 100) : 0;
      return '<button class="caput" type="button" data-caput="' + c.n + '">' +
        '<strong>Caput ' + c.n + ' · ' + c.title + '</strong>' +
        '<small>' + done + ' / ' + list.length + ' beheerst</small>' +
        '<span class="mini-bar"><i style="width:' + pct + '%"></i></span></button>';
    }).join("");
  }

  /* ---------------------------------------------------------------- */
  /* Setup                                                            */
  /* ---------------------------------------------------------------- */

  function renderSetup() {
    var s = state.setup;
    var book = Data.findBook(s.book);

    $("setup-years").innerHTML = yearButtonsHtml(s.year);

    $("setup-capits").innerHTML = [{ n: "all", title: "Alle capita" }].concat(Data.CAPITULA).map(function (c) {
      var label = c.n === "all" ? "Alle" : c.n + ". " + c.title;
      return '<button class="chip' + (String(s.caput) === String(c.n) ? " active" : "") +
        '" type="button" data-caput="' + c.n + '">' + label + '</button>';
    }).join("");

    [["from", "range-from"], ["to", "range-to"]].forEach(function (pair) {
      var key = pair[0], el = $(pair[1]);
      var html = "";
      for (var n = 1; n <= 12; n++) {
        html += '<option value="' + n + '"' + (s[key] === n ? " selected" : "") + '>Caput ' + n + '</option>';
      }
      el.innerHTML = html;
    });

    $("word-from").value = s.wordFrom > 1 ? s.wordFrom : "";
    $("word-to").value = s.wordTo > 0 ? s.wordTo : "";

    [["direction", "setup-direction"], ["size", "setup-size"], ["minutes", "setup-minutes"]].forEach(function (pair) {
      var key = pair[0], id = pair[1];
      var btns = $(id).querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var attr = btns[i].getAttribute("data-" + key);
        var val = key === "size" || key === "minutes" ? Number(attr) : attr;
        btns[i].classList.toggle("active", val === s[key]);
      }
    });
    $("setup-weak").checked = !!s.weak;
  }

  function openSetup(caput) {
    if (caput) state.setup.caput = caput;
    renderSetup();
    show("setup");
  }

  /* ---------------------------------------------------------------- */
  /* Woordenboek                                                      */
  /* ---------------------------------------------------------------- */

  function renderDict() {
    var q = normLatin($("dict-search").value).replace(/[^a-z]/g, "");
    var words = allWords().filter(function (w) {
      if (!q) return true;
      return normLatin(w.latin).indexOf(q) >= 0 || normDutch(w.dutch).indexOf(normDutch(q)) >= 0;
    });
    $("dict-count").textContent = words.length + " woorden gevonden";
    var reviews = Store.getReviews();
    $("dict-list").innerHTML = words.slice(0, 300).map(function (w) {
      var r = reviews[w.id];
      var badge = r && r.reps >= 3 && r.interval >= 7 ? '<span class="badge">beheerst</span>' : "";
      return '<div class="dict-row"><span class="lat">' + displayLatin(w.latin) + '</span>' +
        '<span class="nl">' + w.dutch + '</span>' + badge +
        '<span class="tag">' + (w.caput === 99 ? "eigen" : "caput " + Data.findBook(state.setup.book).assign(w)) + '</span></div>';
    }).join("") || '<p class="muted">Geen woorden gevonden.</p>';
  }

  /* ---------------------------------------------------------------- */
  /* Grammatica                                                       */
  /* ---------------------------------------------------------------- */

  var GRAMMAR_TEXT = {
    cases: "De vijf naamvallen: nominatief (onderwerp), genitief (bezit), datief (aan/voor), accusatief (voorwerp) en ablativus (door/met/uit).",
    declensions: "Een zelfstandig naamwoord krijgt een uitgang per naamval en per getal. Let op het geslacht: -us is meestal mannelijk, -um onzijdig, -a vrouwelijk.",
    conjugations: "De vervoeging bepaalt de infinitiefuitgang. Bij het perfectum valt vaak de stamverdubbeling of een veranderde klinker op.",
    stems: "De vier stamtijden zijn: praesens, infinitief, perfectum en supinum. Bijna alle andere vormen zijn hieruit af te leiden.",
    tijden: "In de bovenbouw komen imperfectum, plusquamperfectum en de twee futura erbij. Het imperfectum beschrijft wat bezig was of gebruikelijk; het perfectum vertelt wat afgerond is.",
    syntaxis: "Vanaf 4e middelbaar verschuift de nadruk van losse vormen naar zinsbouw: de accusativus cum infinitivo, ablativus absolutus, participia en bijzinnen."
  };

  function renderGrammar() {
    var kind = state.grammar;
    var D = Data;
    var html = '<p class="gram-note">' + GRAMMAR_TEXT[kind] + '</p>';

    if (kind === "cases") {
      [0, 5].forEach(function (offset) {
        html += '<h3>' + (offset === 0 ? "Enkelvoud" : "Meervoud") + '</h3><div class="table-wrap"><table><thead><tr><th>Naamval</th>' +
          D.DECLENSIONS.map(function (d) { return '<th>' + d.name + '</th>'; }).join("") + '</tr></thead><tbody>';
        D.CASES.forEach(function (c, i) {
          html += '<tr><td>' + c + '</td>' + D.DECLENSIONS.map(function (d) {
            return '<td>' + displayLatin(d.forms[offset + i]) + '</td>';
          }).join("") + '</tr>';
        });
        html += '</tbody></table></div>';
      });
    } else if (kind === "declensions") {
      html += '<div class="table-wrap"><table><thead><tr><th>Verbuiging</th><th>Uitgang</th><th>Voorbeeld</th></tr></thead><tbody>';
      D.DECLENSIONS.forEach(function (d) {
        html += '<tr><td>' + d.name + '</td><td>' + d.ending + '</td><td>' + displayLatin(d.example) + '</td></tr>';
      });
      html += '</tbody></table></div>';
      D.DECLENSIONS.forEach(function (d) {
        html += '<h3>' + d.name + '</h3><p class="gram-note">' + d.forms.map(displayLatin).join(" · ") + '</p>';
      });
    } else if (kind === "conjugations") {
      D.CONJUGATIONS.forEach(function (c) {
        html += '<h3>' + c.name + ' (' + c.infinitive + ')</h3><div class="table-wrap"><table><thead><tr><th></th>' +
          ["ik", "jij", "hij/zij", "wij", "jullie", "zij"].map(function (p) { return '<th>' + p + '</th>'; }).join("") + '</tr></thead><tbody>' +
          '<tr><td>Praesens</td>' + c.present.map(function (v) { return '<td>' + displayLatin(v) + '</td>'; }).join("") + '</tr>' +
          '<tr><td>Perfectum</td>' + c.perfect.map(function (v) { return '<td>' + displayLatin(v) + '</td>'; }).join("") + '</tr>' +
          '</tbody></table></div>';
      });
    } else {
      html += '<div class="table-wrap"><table><thead><tr><th>Praesens</th><th>Infinitief</th><th>Perfectum</th><th>Supinum</th><th>Nederlands</th></tr></thead><tbody>';
      D.STEMS.forEach(function (s) {
        html += '<tr><td>' + displayLatin(s.present) + '</td><td>' + displayLatin(s.infinitive) + '</td><td>' +
          displayLatin(s.perfect) + '</td><td>' + displayLatin(s.supine) + '</td><td>' + s.dutch + '</td></tr>';
      });
      html += '</tbody></table></div>';
    } else if (kind === "tijden") {
      html += '<div class="table-wrap"><table><thead><tr><th>Tijd</th><th>Van amāre</th><th>Nederlands</th><th>Gebruik</th></tr></thead><tbody>' +
        '<tr><td>Praesens</td><td>amō</td><td>ik houd van</td><td>nu / algemeen</td></tr>' +
        '<tr><td>Imperfectum</td><td>amābam</td><td>ik hield van / was aan het houden</td><td>bezig of gewoonte in het verleden</td></tr>' +
        '<tr><td>Perfectum</td><td>amāvī</td><td>ik heb gehouden / hield</td><td>afgerond verleden, verhaaltijd</td></tr>' +
        '<tr><td>Plusquamperfectum</td><td>amāveram</td><td>ik had gehouden</td><td>eerder verleden</td></tr>' +
        '<tr><td>Futurum I</td><td>amābō</td><td>ik zal houden</td><td>toekomst</td></tr>' +
        '<tr><td>Futurum II</td><td>amāverō</td><td>ik zal gehouden hebben</td><td>voltooide toekomst</td></tr>' +
        '</tbody></table></div>' +
        '<h3>Passief, conjunctief en supinum</h3><p class="gram-note">Passief: <em>amātur</em> (hij wordt bemind), <em>amātus est</em> (hij is bemind). Conjunctief: <em>amet</em> (dat hij beminne), vaak na <em>ut</em>, <em>nē</em> of <em>cum</em>. Het supinum op <em>-um</em> staat na beweging (<em>vēnī amātum</em>); op <em>-ū</em> na een bijvoeglijk naamwoord (<em>iūcundum audītū</em>).</p>';
    } else if (kind === "syntaxis") {
      html += '<h3>Accusativus cum infinitivo (AcI)</h3><p class="gram-note">Na werkwoorden van zeggen, zien, weten en willen staat het onderwerp van de bijzin in de accusatief en het gezegde in de infinitief: <em>dīcit mē venīre</em> — hij zegt dat ik kom. Met een perfectum infinitief: <em>dīcit mē vēnisse</em> — hij zegt dat ik kwam.</p>' +
        '<h3>Ablativus absolutus (AbA)</h3><p class="gram-note">Een bijzin zonder voegwoord, met beide leden in de ablativus: <em>urbe captā, hostēs discessērunt</em> — nadat de stad was ingenomen, vertrokken de vijanden. Het deelwoord hoort bij het zelfstandig naamwoord in dezelfde ablativus.</p>' +
        '<h3>Participia</h3><p class="gram-note"><em>portāns</em> (dragend), <em>portātus</em> (gedragen), <em>portātūrus</em> (zullend dragen) en <em>portandus</em> (te dragen). Ze gedragen zich als bijvoeglijk naamwoord: gelijk in naamval, geslacht en getal.</p>' +
        '<h3>Overige bouwstenen</h3><p class="gram-note"><strong>Relatief:</strong> <em>quī, quae, quod</em> (die / wat). <strong>Voorwaarde:</strong> <em>sī</em> met indicatief (werkelijk) of conjunctief (mogelijk). <strong>Doel en gevolg:</strong> <em>ut</em> + conjunctief. <strong>Gerundium:</strong> <em>ad portandum</em> (om te dragen). <strong>Locatief:</strong> <em>Rōmae</em> (in Rome), <em>Rōmā</em> (uit Rome).</p>';
    }
    $("grammar-content").innerHTML = html;
  }

  /* ---------------------------------------------------------------- */
  /* Analyse, ranglijst en studiegids                                 */
  /* ---------------------------------------------------------------- */

  function renderAnalysis() {
    var book = Data.findBook(state.setup.book);
    var reviews = Store.getReviews();
    var st = Store.getStats();
    var streak = Store.getStreak();
    var total = st.correct + st.wrong;
    var accuracy = total ? Math.round((st.correct / total) * 100) : 0;

    var html = '<p class="muted">' + book.name + ' · ' + Data.findYear(state.setup.year).label + '</p>' +
      '<div class="result-grid">' +
      '<div><span>' + accuracy + '%</span><small>goed geteld</small></div>' +
      '<div><span>' + st.sessions + '</span><small>sessies</small></div>' +
      '<div><span>' + st.minutes + '</span><small>minuten</small></div>' +
      '<div><span>' + streak.best + '</span><small>beste streak</small></div>' +
      '</div><h3>Capita</h3>';

    html += Data.CAPITULA.map(function (c) {
      var list = Data.byBookCaput(book.id, c.n);
      var ids = list.map(function (w) { return w.id; });
      var done = Store.masteredCount(ids);
      var now = Date.now();
      var due = ids.filter(function (id) {
        var r = reviews[id];
        return !r || r.due <= now;
      }).length;
      var pct = list.length ? Math.round((done / list.length) * 100) : 0;
      return '<div class="analysis-row"><div class="analysis-top"><strong>Caput ' + c.n + ' · ' + c.title +
        '</strong><span>' + done + '/' + list.length + ' beheerst' + (due ? ' · ' + due + ' te herhalen' : '') +
        '</span></div><div class="mini-bar wide-bar"><i style="width:' + pct + '%"></i></div></div>';
    }).join("");

    var weak = [];
    Object.keys(reviews).forEach(function (id) {
      var r = reviews[id];
      if (r.lapses > 0 && (!r.reps || r.reps < 3)) weak.push({ id: id, lapses: r.lapses });
    });
    weak.sort(function (a, b) { return b.lapses - a.lapses; });
    html += '<h3>Lastige woorden</h3>';
    html += weak.slice(0, 8).map(function (item) {
      var w = findById(item.id);
      return '<div class="dict-row"><span class="lat">' + displayLatin(w ? w.latin : item.id) + '</span>' +
        '<span class="nl">' + (w ? w.dutch : "") + '</span><span class="badge">' + item.lapses + '× fout</span></div>';
    }).join("") || '<p class="muted">Nog geen lastige woorden. Mooi!</p>';

    $("analysis-content").innerHTML = html;
  }

  function renderLeaderboard() {
    var restore = Store.getActive();
    var current = Accounts.current();
    var rows = Accounts.list().map(function (a) {
      Store.setActive(a.id);
      var data = Store.read();
      return {
        name: a.name,
        score: data.stats.correct * 10,
        streak: data.streak.best || data.streak.count || 0,
        mastered: Store.masteredCount(Data.WORDS.map(function (w) { return w.id; })),
        current: !!current && current.id === a.id
      };
    });
    Store.setActive(restore);

    rows.sort(function (a, b) { return b.score - a.score || b.mastered - a.mastered; });
    $("leaderboard-list").innerHTML = rows.length
      ? rows.map(function (r, i) {
          return '<div class="ach-item' + (r.current ? ' lead-current' : '') + '">' +
            '<span class="ico">' + (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤") + '</span>' +
            '<span><strong>' + (i + 1) + '. ' + r.name + (r.current ? " (jij)" : "") + '</strong>' +
            '<small>' + r.score + ' punten · ' + r.mastered + ' woorden beheerst · beste streak ' + r.streak + '</small></span></div>';
        }).join("")
      : '<p class="muted">Nog geen profielen. Maak een account om mee te doen.</p>';
  }

  var GUIDE = {
    basis: {
      title: "Latijn leren: de basis",
      html: "<p>Latijn is een taal met uitgangen. Eén woord kan dus meerdere vormen hebben: <em>puella</em> (het meisje), <em>puellae</em> (van het meisje), <em>puellam</em> (het meisje als voorwerp).</p>" +
        "<h3>Drie dingen om altijd te doen</h3><ol><li>Leer het woord <em>samen met</em> zijn betekenis en woordsoort.</li><li>Kijk naar de stam: die blijft gelijk in alle vormen.</li><li>Herhaal kort en vaak — liever 5 minuten per dag dan één uur per week.</li></ol>" +
        "<p>In StudiumGo oefen je per caput en in beide richtingen. Zo leer je niet alleen te vertalen, maar ook het Latijn zelf te gebruiken.</p>"
    },
    toets: {
      title: "De avond voor je toets",
      html: "<p>Je hoeft niet alles opnieuw te leren. Maak een plan van 20 minuten:</p>" +
        "<ol><li>5 min: bekijk je <strong>foutenoverzicht</strong> (📕).</li><li>10 min: oefen het caput van de toets in de richting NL → Latijn.</li><li>5 min: controleer je <strong>stamtijden</strong> (⚔️) en de naamvallen.</li></ol>" +
        "<p>Gebruik de optie ‘Alleen lastige & vervallen woorden’ zodat je tijd gaat naar wat je nog niet kent. Sluit af met een korte ronde zonder hint.</p>"
    },
    stamtijden: {
      title: "Stamtijden: vier vormen om te weten",
      html: "<p>Bij Latijnse werkwoorden leer je vier hoofdvormen:</p><ul><li><strong>Praesens</strong> — ik doe nu (<em>amō</em>)</li><li><strong>Infinitief</strong> — doen (<em>amāre</em>)</li><li><strong>Perfectum</strong> — ik deed / heb gedaan (<em>amāvī</em>)</li><li><strong>Supinum</strong> — gedaan (<em>amātum</em>)</li></ul>" +
        "<p>Uit deze vier vormen haal je bijna alle andere tijden. Oefen ze in StudiumGo via ⚔️ Stamtijden of het tabblad Stamtijden in Grammatica.</p>"
    },
    tips: {
      title: "Slim leren met StudiumGo",
      html: "<ul><li><strong>Gemengd oefenen</strong> dwingt je geheugen harder te werken dan één richting.</li><li><strong>Lengtetekens</strong> helpen je de klinker te zien; zet ze desnoods tijdelijk uit als je boek ze niet gebruikt.</li><li><strong>Spaced repetition</strong>: goede woorden komen later terug, foute woorden sneller. Vertrouw gerust op het systeem.</li><li><strong>Woordnummers</strong>: kies in de sessie-instellingen exact woord 1 t/m 20 als je les die avond maar een deel van het caput behandelt.</li><li><strong>Analyse</strong> laat zien welke capita al bijna af zijn — daar haal je het meeste rendement.</li></ul>"
    }
  };

  function renderGuide() {
    var item = GUIDE[state.guide] || GUIDE.basis;
    $("guide-content").innerHTML = '<h3>' + item.title + '</h3>' + item.html;
    var tabs = $("guide-tabs").querySelectorAll("button");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("active", tabs[i].getAttribute("data-guide") === state.guide);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Fouten                                                           */
  /* ---------------------------------------------------------------- */

  function errorRows() {
    return Store.getErrors().map(function (e) {
      var item = findById(e.id);
      if (!item) return null;
      var latin = item.latin || item.present;
      var dutch = item.dutch || "";
      return { id: e.id, latin: latin, dutch: dutch, count: e.count, last: e.last };
    }).filter(Boolean).sort(function (a, b) { return b.count - a.count || b.last - a.last; });
  }

  function renderErrors() {
    var rows = errorRows();
    $("errors-intro").textContent = rows.length
      ? "Deze " + rows.length + " woorden wil je nog even extra oefenen."
      : "Nog geen fouten — mooi zo!";
    $("errors-list").innerHTML = rows.map(function (r) {
      return '<div class="dict-row"><span class="lat">' + displayLatin(r.latin) + '</span><span class="nl">' + r.dutch +
        '</span><span class="badge">' + r.count + '× fout</span></div>';
    }).join("");
  }

  function printErrors() {
    var rows = errorRows();
    var sheet = $("print-sheet");
    sheet.innerHTML = '<h1>StudiumGo — mijn fouten</h1><p>' + new Date().toLocaleDateString("nl-NL") +
      ' · ' + rows.length + ' woorden</p><table><thead><tr><th>Latijn</th><th>Nederlands</th><th>Fout</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + displayLatin(r.latin) + '</td><td>' + r.dutch + '</td><td>' + r.count + '</td></tr>';
      }).join("") + '</tbody></table>';
    window.print();
  }

  function exportErrorsCsv() {
    var rows = errorRows();
    var csv = "Latijn;Nederlands;Aantal fouten\n" + rows.map(function (r) {
      return [r.latin, r.dutch, r.count].map(function (v) {
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(";");
    }).join("\n");
    download("studium-fouten.csv", "\ufeff" + csv, "text/csv;charset=utf-8");
  }

  /* ---------------------------------------------------------------- */
  /* Prestaties & instellingen                                        */
  /* ---------------------------------------------------------------- */

  function renderAchievements() {
    var done = Store.getAchievements();
    var list = Store.ACHIEVEMENTS;
    var count = 0;
    $("ach-count").textContent = Object.keys(done).filter(function (k) { return done[k]; }).length + " van " + list.length + " ontgrendeld";
    $("ach-list").innerHTML = list.map(function (a) {
      var on = !!done[a.id];
      if (on) count++;
      return '<div class="ach-card' + (on ? " unlocked" : "") + '"><span class="ico">' + (on ? a.ico : "🔒") +
        '</span><span><strong>' + a.title + '</strong><small>' + a.desc + '</small></span></div>';
    }).join("");
    return count;
  }

  function renderSettings() {
    var s = Store.getSettings();
    var account = Accounts.current();
    $("account-info").textContent = account
      ? "Ingelogd als " + account.name + " · " + Data.findYear(account.year || state.setup.year).label +
        " · " + Data.findBook(state.setup.book).name + ". Je voortgang staat apart op dit apparaat."
      : "Account verplicht · maak eerst een profiel aan.";
    $("settings-years").innerHTML = yearButtonsHtml(state.setup.year);
    var del = $("btn-delete-account");
    if (del) del.classList.toggle("hidden", !account);
    $("set-macrons").checked = !!s.macrons;
    $("set-sound").checked = !!s.sound;
    Audio.setMuted(!s.sound);
    $("btn-mute").textContent = s.sound ? "🔊" : "🔇";
    document.body.setAttribute("data-theme", s.theme || "dark");
    $("btn-theme").textContent = s.theme === "light" ? "☀️" : "🌙";

    $("custom-list").innerHTML = Store.getCustom().map(function (c) {
      return '<div class="custom-row"><span class="lat">' + displayLatin(c.latin) + '</span><span>' + c.dutch +
        '</span><button type="button" data-remove="' + c.id + '" title="Verwijderen">✕</button></div>';
    }).join("") || '<p class="muted">Nog geen eigen woorden.</p>';
  }

  function addCustom() {
    var latin = $("custom-latin").value.trim();
    var dutch = $("custom-dutch").value.trim();
    if (!latin || !dutch) { toast("Vul beide velden in."); return; }
    var key = normLatin(latin);
    if (allWords().some(function (w) { return w.key === key; })) { toast("Dit woord staat al in het woordenboek."); return; }
    Store.addCustom(latin, dutch, 99);
    $("custom-latin").value = "";
    $("custom-dutch").value = "";
    var a = Store.unlock("eigen");
    if (a) toast(a.ico + " Prestatie: " + a.title);
    Audio.play("star");
    renderSettings();
    updateHome();
    say("Eigen woord toegevoegd.");
  }

  /* ---------------------------------------------------------------- */
  /* Bindingen                                                        */
  /* ---------------------------------------------------------------- */

  function bind(id, fn) {
    var el = $(id);
    if (el) el.addEventListener("click", function (e) { e.preventDefault(); Audio.ensure(); Audio.play("click"); fn(); });
  }

  function bindSegments(id, attr, key, numeric) {
    var wrap = $(id);
    if (!wrap) return;
    var btns = wrap.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault(); Audio.ensure(); Audio.play("click");
          var raw = btn.getAttribute("data-" + attr);
          state.setup[key] = numeric ? Number(raw) : raw;
          renderSetup();
        });
      })(btns[i]);
    }
  }

  function bindAll() {
    bind("btn-user", gotoAccount);
    bind("btn-switch-account", gotoAccount);
    bind("account-submit", submitAccount);

    var accountTabs = $("account-tabs").querySelectorAll("button");
    for (var t = 0; t < accountTabs.length; t++) {
      (function (tab) {
        tab.addEventListener("click", function () {
          state.accountMode = tab.getAttribute("data-account-tab");
          renderAccountScreen();
        });
      })(accountTabs[t]);
    }

    $("account-year").addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-year]") : null;
      if (!btn) return;
      state.accountYear = Number(btn.getAttribute("data-year"));
      renderAccountScreen();
    });

    $("account-existing").addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-user]") : null;
      if (!btn) return;
      var id = btn.getAttribute("data-user");
      var found = Accounts.list().filter(function (a) { return a.id === id; })[0];
      if (!found) return;
      state.accountMode = "login";
      state.accountYear = Number(found.year) || 1;
      $("account-name").value = found.name;
      $("account-password").value = "";
      renderAccountScreen();
      $("account-password").focus();
    });

    $("account-name").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); $("account-password").focus(); }
    });
    $("account-password").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submitAccount(); }
    });

    bind("btn-delete-account", function () {
      var account = Accounts.current();
      if (!account) { gotoAccount(); return; }
      if (!window.confirm("Account " + account.name + " met al zijn voortgang verwijderen?")) return;
      Accounts.remove(account.id);
      applyAccount();
      renderSettings();
      renderSetup();
      updateHome();
      gotoAccount();
      toast("Account verwijderd.");
    });

    bind("btn-go-setup", function () { openSetup(); });
    bind("setup-back", function () { show("home"); });
    bind("btn-start", function () { startSession("vocab", state.setup); });
    bind("btn-quick-stems", function () { startSession("stems", { size: 10, minutes: 0 }); });
    bind("grammar-practice", function () { startSession("stems", { size: 10, minutes: 0 }); });

    bind("btn-quick-dict", function () { renderDict(); show("dict"); });
    bind("dict-back", function () { show("home"); });
    bind("btn-quick-grammar", function () { renderGrammar(); show("grammar"); });
    bind("grammar-back", function () { show("home"); });
    bind("btn-quick-errors", function () { renderErrors(); show("errors"); });
    bind("errors-back", function () { show("home"); });
    bind("btn-quick-ach", function () { renderAchievements(); show("ach"); });
    bind("ach-back", function () { show("home"); });
    bind("btn-quick-settings", function () { renderSettings(); show("settings"); });
    bind("settings-back", function () { show("home"); });
    bind("btn-quick-analysis", function () { renderAnalysis(); show("analysis"); });
    bind("analysis-back", function () { show("home"); });
    bind("btn-quick-leaderboard", function () { renderLeaderboard(); show("leaderboard"); });
    bind("leaderboard-back", function () { show("home"); });
    bind("btn-quick-guide", function () { renderGuide(); show("guide"); });
    bind("guide-back", function () { show("home"); });

    $("guide-tabs").addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-guide]") : null;
      if (!btn) return;
      Audio.ensure(); Audio.play("click");
      state.guide = btn.getAttribute("data-guide");
      renderGuide();
    });

    bind("sess-check", checkAnswer);
    bind("sess-skip", skipCard);
    bind("sess-hint-btn", useHint);
    bind("sess-stop", stopSession);
    bind("summary-home", function () { show("home"); });
    bind("summary-again", function () { startSession(state.session ? state.session.kind : "vocab", state.setup); });
    bind("summary-errors", function () { renderErrors(); show("errors"); });

    bind("errors-print", printErrors);
    bind("errors-csv", exportErrorsCsv);
    bind("errors-clear", function () {
      if (window.confirm("Alle fouten wissen?")) { Store.clearErrors(); renderErrors(); }
    });

    bind("custom-add", addCustom);
    bind("data-export", function () {
      download("studium-gegevens.json", Store.exportData(), "application/json");
      toast("Gegevens gedownload.");
    });
    bind("data-reset", function () {
      if (window.confirm("Alles wissen? Je voortgang kan niet terugkomen.")) { Store.reset(); location.reload(); }
    });

    bind("btn-theme", function () {
      var next = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
      Store.setSetting("theme", next);
      renderSettings();
    });
    bind("btn-mute", function () {
      var next = !Store.getSettings().sound;
      Store.setSetting("sound", next);
      renderSettings();
    });

    bindSegments("setup-direction", "direction", "direction", false);
    bindSegments("setup-size", "size", "size", true);
    bindSegments("setup-minutes", "minutes", "minutes", true);

    $("setup-weak").addEventListener("change", function (e) {
      state.setup.weak = !!e.target.checked;
      Store.setSetting("weakOnly", state.setup.weak);
    });

    $("set-macrons").addEventListener("change", function (e) {
      Store.setSetting("macrons", !!e.target.checked);
      renderGrammar(); renderDict(); renderErrors();
    });
    $("set-sound").addEventListener("change", function (e) {
      Store.setSetting("sound", !!e.target.checked);
      renderSettings();
      Audio.play("click");
    });

    $("custom-list").addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-remove]") : null;
      if (!btn) return;
      Store.removeCustom(btn.getAttribute("data-remove"));
      renderSettings(); updateHome(); renderDict();
    });

    $("dict-search").addEventListener("input", renderDict);

    var gTabs = $("grammar-tabs").querySelectorAll("button");
    for (var g = 0; g < gTabs.length; g++) {
      (function (tab) {
        tab.addEventListener("click", function () {
          state.grammar = tab.getAttribute("data-grammar");
          for (var i = 0; i < gTabs.length; i++) gTabs[i].classList.toggle("active", gTabs[i] === tab);
          renderGrammar();
        });
      })(gTabs[g]);
    }

    $("data-import").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { Store.importData(String(reader.result)); location.reload(); }
        catch (err) { toast("Kon dit bestand niet lezen."); }
      };
      reader.readAsText(file);
    });

    $("sess-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); checkAnswer(); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.screen === "session") stopSession();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && state.screen === "session" && state.session && !state.session.finished) {
        clearInterval(state.timer);
      } else if (!document.hidden && state.screen === "session" && state.session && !state.session.finished) {
        clearInterval(state.timer);
        state.timer = setInterval(tick, 1000);
      }
    });

    function persistYear() {
      var acc = Accounts.current();
      if (acc) Accounts.setYear(acc.id, state.setup.year);
      Store.setSetting("year", state.setup.year);
      Store.setSetting("book", state.setup.book);
    }

    function chooseYear(n) {
      var year = Number(n) || 1;
      state.setup.year = year;
      state.setup.book = "pegasus-" + year; // altijd Pegasus Novus
      state.accountYear = year;
      persistYear();
      renderSetup();
      updateHome();
      renderSettings();
    }

    ["home-years", "setup-years", "settings-years"].forEach(function (id) {
      $(id).addEventListener("click", function (e) {
        var btn = e.target && e.target.closest ? e.target.closest("[data-year]") : null;
        if (!btn) return;
        Audio.ensure(); Audio.play("click");
        chooseYear(btn.getAttribute("data-year"));
      });
    });

    ["range-from", "range-to"].forEach(function (id) {
      $(id).addEventListener("change", function (e) {
        state.setup[id === "range-from" ? "from" : "to"] = Number(e.target.value);
      });
    });
    bind("btn-range", function () {
      var a = Math.min(state.setup.from, state.setup.to);
      var b = Math.max(state.setup.from, state.setup.to);
      state.setup.from = a;
      state.setup.to = b;
      state.setup.caput = a + "-" + b;
      Store.setSetting("from", a);
      Store.setSetting("to", b);
      renderSetup();
      toast("Caput " + a + " t/m " + b + " geselecteerd.");
    });

    ["word-from", "word-to"].forEach(function (id) {
      $(id).addEventListener("change", function (e) {
        state.setup[id === "word-from" ? "wordFrom" : "wordTo"] = Math.max(0, Number(e.target.value) || 0);
      });
    });
    bind("btn-words", function () {
      var a = Math.max(1, Number($("word-from").value) || 1);
      var b = Math.max(0, Number($("word-to").value) || 0);
      state.setup.wordFrom = a;
      state.setup.wordTo = b && b >= a ? b : 0;
      $("word-from").value = a > 1 ? a : "";
      $("word-to").value = state.setup.wordTo || "";
      toast(state.setup.wordTo
        ? "Woord " + a + " t/m " + state.setup.wordTo + " geselecteerd."
        : "Vanaf woord " + a + " geselecteerd.");
    });

    var homeCapits = $("home-capits");
    homeCapits.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-caput]") : null;
      if (!btn) return;
      Audio.ensure(); Audio.play("click");
      openSetup(btn.getAttribute("data-caput"));
    });
    $("setup-capits").addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-caput]") : null;
      if (!btn) return;
      Audio.ensure(); Audio.play("click");
      state.setup.caput = btn.getAttribute("data-caput");
      renderSetup();
    });

    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      state.deferredPrompt = e;
      $("btn-install").classList.remove("hidden");
    });
    bind("btn-install", function () {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      state.deferredPrompt = null;
    });
  }

  function boot() {
    var account = Accounts.current();
    Store.setActive(account ? account.id : null);

    var settings = Store.getSettings();
    state.setup.direction = settings.direction || "both";
    state.setup.size = settings.pageSize || 15;
    state.setup.minutes = typeof settings.minutes === "number" ? settings.minutes : 5;
    state.setup.weak = !!settings.weakOnly;
    state.setup.year = Number(settings.year) || 1;
    state.setup.book = "pegasus-" + state.setup.year;
    state.accountYear = account && account.year ? Number(account.year) : state.setup.year;
    state.setup.from = settings.from || 1;
    state.setup.to = settings.to || 12;
    useAccount(account);

    bindAll();
    renderSettings();
    renderSetup();
    renderGrammar();
    updateHome();

    var btn = $("btn-user");
    if (btn) {
      btn.textContent = "👤";
      btn.title = account ? "Account: " + account.name : "Account maken of kiezen";
    }

    if (account) {
      show("home");
      handleDeepLink();
    } else {
      gotoAccount();
    }
  }

  // Test-hook voor geautomatiseerde controles.
  window.__studium = {
    state: state,
    show: show,
    startSession: startSession,
    checkAnswer: checkAnswer,
    nextCard: nextCard,
    buildVocabCards: buildVocabCards,
    selectedWords: selectedWords,
    buildStemCards: buildStemCards,
    renderCard: renderCard,
    finishSession: finishSession,
    normLatin: normLatin,
    normDutch: normDutch
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
