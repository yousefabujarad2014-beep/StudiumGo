/* StudiumGo — lokale accounts/profielen.
   Dit zijn apparaatgebonden profielen, géén online accounts: de gegevens
   blijven in localStorage op dit apparaat. */
(function () {
  "use strict";

  var KEY = "studium.accounts.v1";
  var ACTIVE = "studium.active.v1";

  function readList() {
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function writeList(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  function hash(pw, salt) {
    var h = 2166136261;
    var s = String(salt || "") + String(pw || "");
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(16);
  }

  function salt() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function currentId() {
    try { return localStorage.getItem(ACTIVE) || null; } catch (e) { return null; }
  }

  function setCurrentId(id) {
    try {
      if (id) localStorage.setItem(ACTIVE, id);
      else localStorage.removeItem(ACTIVE);
    } catch (e) {}
  }

  function list() { return readList(); }

  function find(name) {
    var n = String(name || "").trim().toLowerCase();
    var all = readList();
    for (var i = 0; i < all.length; i++) {
      if (all[i].name.toLowerCase() === n) return all[i];
    }
    return null;
  }

  function create(name, password, year) {
    var username = String(name || "").trim();
    var pw = String(password || "");
    var leerjaar = Number(year) || 1;
    if (username.length < 2) throw new Error("Gebruikersnaam moet minstens 2 tekens zijn.");
    if (pw.length < 4) throw new Error("Wachtwoord moet minstens 4 tekens zijn.");
    if (find(username)) throw new Error("Die gebruikersnaam bestaat al.");
    var s = salt();
    var account = {
      id: "a-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 100000).toString(36),
      name: username,
      year: leerjaar,
      salt: s,
      hash: hash(pw, s),
      created: Date.now()
    };
    var all = readList();
    all.push(account);
    writeList(all);
    setCurrentId(account.id);
    return account;
  }

  function login(name, password) {
    var account = find(name);
    if (!account) return null;
    if (hash(password, account.salt) !== account.hash) return null;
    setCurrentId(account.id);
    return account;
  }

  function current() {
    var id = currentId();
    if (!id) return null;
    var all = readList();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function logout() { setCurrentId(null); }

  function setYear(id, year) {
    var all = readList();
    var n = Number(year) || 1;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) { all[i].year = n; writeList(all); return n; }
    }
    return null;
  }

  function remove(id) {
    writeList(readList().filter(function (a) { return a.id !== id; }));
    try { localStorage.removeItem("studium.user." + id); } catch (e) {}
    if (currentId() === id) logout();
  }

  window.StudiumAccounts = {
    list: list,
    create: create,
    login: login,
    current: current,
    currentId: currentId,
    setCurrentId: setCurrentId,
    logout: logout,
    setYear: setYear,
    remove: remove
  };
})();
