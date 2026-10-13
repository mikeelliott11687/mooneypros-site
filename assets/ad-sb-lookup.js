(function () {
  "use strict";

  var DATA = null;
  var serialChoice = null; // model id chosen from chooser
  var parsedSerial = null; // {raw, prefix, numKey, display}

  function $(id) { return document.getElementById(id); }
  function qs(sel, el) { return (el || document).querySelector(sel); }
  function params() { return new URLSearchParams(location.search || ""); }
  function wantSample() { return params().get("data") === "sample"; }

  function dataUrls() {
    if (wantSample()) {
      return ["data/sample_mooney_ad_sb.json", "data/sample_mooney_ad_sb.data.js"];
    }
    return ["data/mooney_ad_sb.json", "data/mooney_ad_sb.data.js"];
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () { reject(new Error("script " + src)); };
      document.head.appendChild(s);
    });
  }

  function loadData() {
    var urls = dataUrls();
    var jsonUrl = urls[0];
    var jsUrl = urls[1];
    return fetch(jsonUrl, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .catch(function () {
        // file:// fallback: companion .data.js sets window.__ADSB_DATA__ or __ADSB_SAMPLE_DATA__
        return loadScript(jsUrl).then(function () {
          var d = wantSample() ? window.__ADSB_SAMPLE_DATA__ : window.__ADSB_DATA__;
          if (!d) throw new Error("No embedded AD/SB data");
          return d;
        });
      });
  }

  function engName(id) {
    var e = (DATA.engines || []).find(function (x) { return x.id === id; });
    return e ? e.name : id;
  }
  function modelById(id) {
    return (DATA.models || []).find(function (m) { return m.id === id; });
  }

  function fillModels() {
    var sel = $("model");
    sel.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Select a model...";
    sel.appendChild(opt0);
    (DATA.models || []).forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.id;
      o.textContent = m.name + (m.years ? " (" + m.years + ")" : "");
      sel.appendChild(o);
    });
  }

  function fillEngines() {
    var mid = $("model").value;
    var sel = $("engine");
    sel.innerHTML = "";
    var m = modelById(mid);
    if (!m) {
      var dash = document.createElement("option");
      dash.value = "";
      dash.textContent = "—";
      sel.appendChild(dash);
      return;
    }
    var all = document.createElement("option");
    all.value = "";
    all.textContent = "All engines for this model";
    sel.appendChild(all);
    (m.engines || []).forEach(function (eid) {
      var o = document.createElement("option");
      o.value = eid;
      o.textContent = engName(eid);
      sel.appendChild(o);
    });
  }

  // ---- serial parsing / matching (FAA schema + fallbacks) ----
  function normalizeSerial(raw) {
    return String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
  }

  function splitSerial(raw) {
    var s = normalizeSerial(raw);
    if (!s) return null;
    // PREFIX-NNNN or PREFIX-NNNNA or plain NNNN / NNNNA
    var m = s.match(/^([A-Z0-9]+)-([0-9]+[A-Z]?)$/);
    if (m) return { raw: s, prefix: m[1], body: m[2], display: s };
    if (/^[0-9]+[A-Z]?$/.test(s)) return { raw: s, prefix: "", body: s, display: s };
    return { raw: s, prefix: null, body: null, display: s, bad: true };
  }

  function serialSortKey(body) {
    // trailing letter sorts after bare number: 1700 < 1700A
    var m = String(body).match(/^([0-9]+)([A-Z]?)$/);
    if (!m) return null;
    return [parseInt(m[1], 10), m[2] || ""];
  }

  function cmpKeys(a, b) {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    if (a[1] === b[1]) return 0;
    if (a[1] === "") return -1;
    if (b[1] === "") return 1;
    return a[1] < b[1] ? -1 : 1;
  }

  function inRange(body, from, to) {
    var k = serialSortKey(body);
    if (!k) return false;
    if (from != null && from !== "") {
      var fb = String(from).includes("-") ? String(from).split("-").pop() : String(from);
      var fk = serialSortKey(fb);
      if (fk && cmpKeys(k, fk) < 0) return false;
    }
    if (to != null && to !== "") {
      var tb = String(to).includes("-") ? String(to).split("-").pop() : String(to);
      var tk = serialSortKey(tb);
      if (tk && cmpKeys(k, tk) > 0) return false;
    }
    return true;
  }

  function prefixEntries() {
    var sp = DATA.serial_prefixes || DATA.serialPrefixes || DATA.prefix_map;
    if (!sp) return [];
    if (Array.isArray(sp)) return sp;
    // object map {prefix: model}
    return Object.keys(sp).map(function (p) {
      return { prefix: p, model: sp[p], from: null, to: null };
    });
  }

  function modelsForSerial(ps) {
    if (!ps || ps.bad) return [];
    var hits = [];
    prefixEntries().forEach(function (e) {
      var pref = e.prefix == null ? "" : String(e.prefix).toUpperCase();
      if (pref !== ps.prefix) return;
      if (e.from != null || e.to != null) {
        if (!inRange(ps.body, e.from, e.to)) return;
      }
      if (e.model && hits.indexOf(e.model) < 0) hits.push(e.model);
    });
    return hits;
  }

  function itemSerialRanges(item) {
    var a = item.applies_to || {};
    if (a.serials && a.serials.length) return a.serials;
    var alt = item.serial_ranges || item.serialRanges || item.effectivity;
    if (!alt) return [];
    return (alt || []).map(function (r) {
      return {
        model: r.model,
        from: r.from != null ? r.from : (r.start != null ? r.start : r.first),
        to: r.to != null ? r.to : (r.end != null ? r.end : r.last),
        exclude: r.exclude || [],
        note: r.note
      };
    });
  }

  function serialsStatus(item) {
    var a = item.applies_to || {};
    if (a.serials_status) return a.serials_status;
    if (itemSerialRanges(item).length) return "ranges";
    return "unknown";
  }

  function serialMatchesItem(item, modelId, ps) {
    // returns {match:bool, check:bool, note:string|null}
    var a = item.applies_to || {};
    var models = a.models || [];
    var engines = a.engines || [];
    var onModel = models.indexOf(modelId) >= 0;
    var engOnly = !onModel && engines.length > 0;
    var st = serialsStatus(item);

    if (!ps) {
      return { match: true, check: false, note: null };
    }
    if (engOnly) {
      // airframe serial can't decide engine applicability
      return { match: true, check: true, note: null };
    }
    if (!onModel) return { match: false, check: false, note: null };

    if (st === "all") return { match: true, check: false, note: null };
    if (st === "unknown" || !st) return { match: true, check: true, note: null };

    // ranges
    var ranges = itemSerialRanges(item).filter(function (r) { return !r.model || r.model === modelId; });
    if (!ranges.length) return { match: true, check: true, note: null };
    var note = null;
    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      var excl = (r.exclude || []).map(normalizeSerial);
      if (excl.indexOf(ps.raw) >= 0) continue;
      if (inRange(ps.body, r.from, r.to)) {
        note = r.note || null;
        return { match: true, check: false, note: note };
      }
    }
    return { match: false, check: false, note: null };
  }

  function isArchived(item) {
    if (item.archived_copy) return true;
    if (item.archive_url) return true;
    var u = item.url || "";
    return /web\.archive\.org/i.test(u);
  }

  function itemMatchesModelEngine(item, modelId, engineId) {
    var a = item.applies_to || {};
    var models = a.models || [];
    var engines = a.engines || [];
    var m = modelById(modelId);
    var modelEngines = (m && m.engines) || [];
    var onModel = models.indexOf(modelId) >= 0;
    var onEngine = false;
    if (engineId) {
      onEngine = engines.indexOf(engineId) >= 0;
    } else {
      onEngine = engines.some(function (e) { return modelEngines.indexOf(e) >= 0; });
    }
    // airframe match OR engine match for this model's engines
    if (onModel) return true;
    if (onEngine) return true;
    return false;
  }

  function renderItem(item, flags) {
    flags = flags || {};
    var li = document.createElement("li");
    li.className = "adsb-item" + (item.status === "superseded" ? " sup" : "");
    var main = document.createElement("div");
    main.className = "adsb-main";
    var num = document.createElement("div");
    num.className = "adsb-num";
    num.textContent = item.number + (item.type && item.type !== "AD" ? " " + item.type : "");
    // headless reads first line of .adsb-num — keep number as first text
    num.textContent = item.number;
    main.appendChild(num);
    var title = document.createElement("p");
    title.className = "adsb-title";
    title.textContent = item.title || "";
    main.appendChild(title);
    var sub = document.createElement("p");
    sub.className = "adsb-sub";
    var bits = [];
    if (item.date) bits.push(item.date);
    if (item.source) bits.push(item.source);
    sub.textContent = bits.join(" · ");
    main.appendChild(sub);
    var tags = document.createElement("div");
    tags.className = "adsb-tags";
    if (item.status === "superseded") {
      var t1 = document.createElement("span"); t1.className = "adsb-tag sup"; t1.textContent = "Superseded"; tags.appendChild(t1);
    }
    if (isArchived(item)) {
      var t2 = document.createElement("span"); t2.className = "adsb-tag arch"; t2.textContent = "Archived copy"; t2.title = "Internet Archive copy"; tags.appendChild(t2);
    }
    if (flags.check) {
      var t3 = document.createElement("span"); t3.className = "adsb-tag chk"; t3.textContent = "Check applicability"; tags.appendChild(t3);
    }
    if (tags.childNodes.length) main.appendChild(tags);
    if (flags.note) {
      var ap = document.createElement("p"); ap.className = "adsb-appl"; ap.textContent = flags.note; main.appendChild(ap);
    }
    if (item.note) {
      var nt = document.createElement("p"); nt.className = "adsb-note"; nt.textContent = item.note; main.appendChild(nt);
    }
    var links = document.createElement("div");
    links.className = "adsb-links";
    if (item.url) {
      var a = document.createElement("a");
      a.className = "adsb-link";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = isArchived(item) && /web\.archive\.org/i.test(item.url) ? "Archived copy →" : "Official source →";
      links.appendChild(a);
    }
    if (item.archive_url && item.archive_url !== item.url) {
      var a2 = document.createElement("a");
      a2.className = "adsb-link";
      a2.href = item.archive_url;
      a2.target = "_blank";
      a2.rel = "noopener";
      a2.textContent = "Archived copy →";
      links.appendChild(a2);
    }
    li.appendChild(main);
    li.appendChild(links);
    return li;
  }

  function setSerialMsg(html, cls) {
    var el = $("serial-msg");
    if (!html) { el.className = ""; el.innerHTML = ""; return; }
    el.className = "show" + (cls ? " " + cls : "");
    el.innerHTML = html;
  }

  function applySerialField() {
    var raw = $("serial").value;
    parsedSerial = null;
    serialChoice = null;
    if (!String(raw || "").trim()) { setSerialMsg(""); return; }
    var ps = splitSerial(raw);
    if (ps.bad || ps.prefix === null) {
      setSerialMsg("That doesn’t look like a Mooney serial (try 24-3000 or 1852).", "err");
      parsedSerial = null;
      return;
    }
    parsedSerial = ps;
    var hits = modelsForSerial(ps);
    if (!hits.length) {
      setSerialMsg("No model mapping for serial " + ps.display + " in this dataset.", "warn");
      return;
    }
    if (hits.length > 1) {
      var labels = hits.map(function (id) {
        var m = modelById(id);
        return '<button type="button" class="adsb-choose" data-model="' + id + '">' +
          (m ? m.name : id) + "</button>";
      }).join("");
      setSerialMsg("Serial " + ps.display + " could be more than one model. Which is yours?" +
        '<div class="adsb-chooser">' + labels + "</div>");
      Array.prototype.forEach.call(document.querySelectorAll(".adsb-choose"), function (btn) {
        btn.addEventListener("click", function () {
          serialChoice = btn.getAttribute("data-model");
          $("model").value = serialChoice;
          fillEngines();
          setSerialMsg("Serial " + ps.display + " → " + (modelById(serialChoice) || {}).name +
            ". Showing items that apply to this serial; items without serial data are marked “Check applicability.”");
          render();
        });
      });
      return;
    }
    serialChoice = hits[0];
    $("model").value = serialChoice;
    fillEngines();
    setSerialMsg("Serial " + ps.display + " → " + (modelById(serialChoice) || {}).name +
      ". Showing items that apply to this serial; items without serial data are marked “Check applicability.”");
  }

  function render() {
    var modelId = $("model").value;
    var engineId = $("engine").value;
    var q = ($("q").value || "").trim().toLowerCase();
    var showSup = $("show-sup").checked;
    var adList = $("adsb-ads");
    var sbList = $("adsb-sbs");
    adList.innerHTML = "";
    sbList.innerHTML = "";
    $("ads-empty").style.display = "none";
    $("sbs-empty").style.display = "none";

    var meta = $("adsb-meta");
    if (!modelId) {
      meta.textContent = DATA.last_updated ?
        ("Data last updated: " + String(DATA.last_updated).slice(0, 10) + (DATA._sample ? " (sample)" : "")) : "";
      $("ads-empty").textContent = "Select a model to see applicable items.";
      $("sbs-empty").textContent = "Select a model to see applicable items.";
      $("ads-empty").style.display = "block";
      $("sbs-empty").style.display = "block";
      $("ads-count").textContent = "";
      $("sbs-count").textContent = "";
      return;
    }

    var m = modelById(modelId);
    var engLabel;
    if (engineId) engLabel = engName(engineId);
    else {
      engLabel = (m.engines || []).map(engName).join(" or ") || "—";
    }
    var updated = DATA.last_updated ? String(DATA.last_updated).slice(0, 10) : "";
    meta.textContent = (m.name || modelId) + (m.years ? ", " + m.years : "") +
      " · Engine: " + engLabel +
      (updated ? " · Data last updated: " + updated + (DATA._sample ? " (sample)" : "") : "");

    var ps = parsedSerial;
    // only filter by serial when serial maps to current model
    var useSerial = ps && !ps.bad && serialChoice && serialChoice === modelId;

    var ads = [], sbs = [];
    (DATA.items || []).forEach(function (item) {
      if (!showSup && item.status === "superseded") return;
      if (!itemMatchesModelEngine(item, modelId, engineId)) return;
      if (q) {
        var hay = ((item.number || "") + " " + (item.title || "")).toLowerCase();
        if (hay.indexOf(q) < 0) return;
      }
      var flags = { check: false, note: null };
      if (useSerial) {
        var sm = serialMatchesItem(item, modelId, ps);
        if (!sm.match) return;
        flags.check = sm.check;
        flags.note = sm.note;
      } else if (ps && serialChoice && serialChoice === modelId) {
        // already handled
      }
      if (item.type === "AD") ads.push([item, flags]);
      else sbs.push([item, flags]); // SB + SI together
    });

    ads.sort(function (a, b) { return String(b[0].number).localeCompare(String(a[0].number)); });
    sbs.sort(function (a, b) { return String(a[0].number).localeCompare(String(b[0].number)); });

    $("ads-count").textContent = ads.length ? " · " + ads.length : " · 0";
    $("sbs-count").textContent = sbs.length ? " · " + sbs.length : " · 0";

    if (!ads.length) {
      $("ads-empty").textContent = "No matching airworthiness directives.";
      $("ads-empty").style.display = "block";
    } else {
      ads.forEach(function (pair) { adList.appendChild(renderItem(pair[0], pair[1])); });
    }
    if (!sbs.length) {
      $("sbs-empty").textContent = "No matching service bulletins or instructions.";
      $("sbs-empty").style.display = "block";
    } else {
      sbs.forEach(function (pair) { sbList.appendChild(renderItem(pair[0], pair[1])); });
    }
  }

  function bind() {
    $("model").addEventListener("change", function () {
      serialChoice = $("model").value || null;
      fillEngines();
      render();
    });
    $("engine").addEventListener("change", render);
    $("q").addEventListener("input", render);
    $("show-sup").addEventListener("change", render);
    $("serial").addEventListener("input", function () {
      applySerialField();
      render();
    });
  }

  function showSampleBanner(on) {
    var b = $("sample-banner");
    if (!b) return;
    if (on) b.classList.add("show"); else b.classList.remove("show");
  }

  loadData().then(function (d) {
    DATA = d;
    showSampleBanner(!!(d && d._sample) || wantSample());
    fillModels();
    fillEngines();
    bind();
    render();
  }).catch(function (err) {
    showSampleBanner(false);
    setSerialMsg("Could not load AD/SB data (" + err.message + "). If you opened this as a file:// page, try the companion .data.js files or a local server.", "err");
    console.error(err);
  });
})();
