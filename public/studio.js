/* ============================================
   HOMEBOSS STUDIO — interactive design wizard
   Pure vanilla JS. No dependencies.
============================================ */
(function () {
    "use strict";

    /* ---------- static config ---------- */
    const STEPS = [
        "Home Type", "Rooms", "Devices", "Security",
        "AI Personality", "Lifestyle", "Blueprint"
    ];

    const HOME_TYPES = [
        { id: "apartment", emoji: "🏠", title: "Apartment", sub: "Compact, connected city living." },
        { id: "house",     emoji: "🏡", title: "Family House", sub: "Multi-room comfort and control." },
        { id: "office",    emoji: "🏢", title: "Office", sub: "Smart, secure workspaces." },
        { id: "hotel",     emoji: "🏨", title: "Hotel", sub: "Guest-grade automation at scale." },
        { id: "school",    emoji: "🏫", title: "School", sub: "Safe, managed campus intelligence." }
    ];

    // Sensible per-room device defaults so a blueprint feels intelligent immediately.
    const ROOM_TYPES = [
        { id: "bedroom",  emoji: "🛏️", label: "Bedroom",      def: { lights: 2, switches: 1, ambient: true,  cameras: 0, motion: 1, doorSensors: 1, ac: true,  fans: 1, curtains: true,  tempSensors: 1 } },
        { id: "living",   emoji: "🛋️", label: "Living Room",  def: { lights: 4, switches: 2, ambient: true,  cameras: 1, motion: 1, doorSensors: 1, ac: true,  fans: 1, curtains: true,  tempSensors: 1 } },
        { id: "kitchen",  emoji: "🍳", label: "Kitchen",      def: { lights: 3, switches: 2, ambient: false, cameras: 0, motion: 1, doorSensors: 0, ac: false, fans: 1, curtains: false, tempSensors: 1 } },
        { id: "bathroom", emoji: "🛁", label: "Bathroom",     def: { lights: 2, switches: 1, ambient: false, cameras: 0, motion: 1, doorSensors: 0, ac: false, fans: 1, curtains: false, tempSensors: 0 } },
        { id: "study",    emoji: "📚", label: "Study",        def: { lights: 2, switches: 1, ambient: true,  cameras: 0, motion: 0, doorSensors: 1, ac: true,  fans: 0, curtains: true,  tempSensors: 1 } },
        { id: "garage",   emoji: "🚗", label: "Garage",       def: { lights: 1, switches: 1, ambient: false, cameras: 1, motion: 1, doorSensors: 1, ac: false, fans: 0, curtains: false, tempSensors: 0 } },
        { id: "outdoor",  emoji: "🌿", label: "Outdoor Area", def: { lights: 3, switches: 1, ambient: true,  cameras: 2, motion: 2, doorSensors: 1, ac: false, fans: 0, curtains: false, tempSensors: 0 } },
        { id: "custom",   emoji: "✨", label: "Custom Room",  def: { lights: 2, switches: 1, ambient: false, cameras: 0, motion: 0, doorSensors: 0, ac: false, fans: 0, curtains: false, tempSensors: 0 } }
    ];

    const SECURITY = [
        { id: "fortress", emoji: "🛡️", title: "Fortress Mode", sub: "Maximum protection for total peace of mind.",
          feats: ["AI cameras on every entry", "Full motion detection", "Smart alarms & sirens", "Access control & logs"] },
        { id: "guardian", emoji: "👨‍👩‍👧", title: "Family Guardian", sub: "Protection tuned around the people you love.",
          feats: ["Family safety alerts", "Children activity monitoring", "Elderly assistance & fall alerts", "Safe-zone notifications"] },
        { id: "peace",    emoji: "🕊️", title: "Peace Mode", sub: "Quiet, minimal monitoring that stays out of the way.",
          feats: ["Essential alerts only", "Smart automation", "Basic entry protection", "Privacy-first sensing"] }
    ];

    const AI = [
        { id: "friendly",     emoji: "😊", title: "Friendly Companion", adj: "Friendly",
          voice: "Good morning. I hope you slept well. Your home is ready for the day." },
        { id: "professional", emoji: "💼", title: "Professional Assistant", adj: "Professional",
          voice: "Good morning. All systems are operating normally." },
        { id: "security",     emoji: "🛰️", title: "Security Guardian", adj: "Vigilant",
          voice: "Good morning. All entrances are secure. No unusual activity detected." },
        { id: "minimalist",   emoji: "▫️", title: "Minimalist", adj: "Quiet",
          voice: "Home systems normal." }
    ];

    const SEC_NOUN = { fortress: "Sentinel", guardian: "Guardian", peace: "Companion" };

    const LIFESTYLE = {
        who: { label: "Who lives here?", options: [
            { id: "single", label: "Single" }, { id: "couple", label: "Couple" },
            { id: "family", label: "Family" }, { id: "elderly", label: "Elderly parents" }] },
        priority: { label: "Main priority", options: [
            { id: "security", label: "Security" }, { id: "energy", label: "Energy savings" },
            { id: "comfort", label: "Comfort" }, { id: "automation", label: "Automation" }] },
        routine: { label: "Daily routine", options: [
            { id: "early", label: "Early morning" }, { id: "standard", label: "Standard schedule" },
            { id: "night", label: "Night lifestyle" }] }
    };

    const STORAGE_KEY = "homeboss-studio-design";

    /* ---------- state ---------- */
    let state = freshState();
    let current = 0;
    let activeRoomId = null;
    let uid = 1;

    function freshState() {
        return { homeType: null, rooms: [], security: null, ai: null,
                 lifestyle: { who: null, priority: null, routine: null } };
    }

    /* ---------- helpers ---------- */
    const $  = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
    const el = (tag, cls, html) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    };
    const roomMeta = id => ROOM_TYPES.find(r => r.id === id);

    /* =========================================================
       RENDER: progress
    ========================================================= */
    function renderProgress() {
        const nodes = $("#stNodes");
        nodes.innerHTML = "";
        STEPS.forEach((label, i) => {
            const li = el("li");
            const btn = el("button", "st-node");
            btn.type = "button";
            if (i < current) btn.classList.add("is-done");
            if (i === current) btn.classList.add("is-current");
            if (i > current) btn.disabled = true;      // can't jump ahead
            btn.innerHTML =
                `<span class="st-dot">${i < current ? "✓" : i + 1}</span>` +
                `<span class="st-node-label">${label}</span>`;
            btn.addEventListener("click", () => { if (i <= current) goTo(i); });
            li.appendChild(btn);
            nodes.appendChild(li);
        });
        const pct = (current / (STEPS.length - 1)) * 100;
        $("#stRailFill").style.width = pct + "%";
        $("#stMFill").style.width = pct + "%";
        $("#stMStep").textContent = "Step " + (current + 1) + " / " + STEPS.length;
        $("#stMLabel").textContent = STEPS[current];
    }

    /* =========================================================
       RENDER: each panel
    ========================================================= */
    function renderStep1() {
        const wrap = $("#stStep1Grid");
        wrap.innerHTML = "";
        HOME_TYPES.forEach(h => {
            const c = el("button", "st-card");
            c.type = "button";
            c.setAttribute("aria-pressed", state.homeType === h.id);
            if (state.homeType === h.id) c.classList.add("is-selected");
            c.innerHTML =
                `<span class="st-check">✓</span>` +
                `<span class="st-card-emoji">${h.emoji}</span>` +
                `<h3>${h.title}</h3><p class="st-card-sub">${h.sub}</p>`;
            c.addEventListener("click", () => {
                state.homeType = h.id;
                renderStep1(); updateActions();
            });
            wrap.appendChild(c);
        });
    }

    function renderStep2() {
        // palette
        const pal = $("#stPalette");
        pal.innerHTML = "";
        ROOM_TYPES.forEach(r => {
            const b = el("button", "st-chip");
            b.type = "button";
            b.innerHTML = `<span>${r.emoji}</span> ${r.label} <span class="st-chip-plus">+</span>`;
            b.addEventListener("click", () => addRoom(r.id));
            pal.appendChild(b);
        });
        // floor
        const floor = $("#stFloor");
        floor.innerHTML = "";
        if (!state.rooms.length) {
            floor.appendChild(el("div", "st-floor-empty",
                `<span>📐</span>Your floor plan is empty.<br>Add rooms from the left to start designing.`));
        } else {
            const grid = el("div", "st-rooms-grid");
            state.rooms.forEach(room => grid.appendChild(roomTile(room)));
            floor.appendChild(grid);
        }
        updateActions();
    }

    function roomTile(room) {
        const meta = roomMeta(room.type);
        const t = el("div", "st-room");
        const dev = room.devices;
        const summary = `${dev.lights}💡 · ${dev.cameras}📷 · ${(dev.motion + dev.doorSensors)}📡`;

        const remove = el("button", "st-room-remove", "×");
        remove.title = "Remove room";
        remove.addEventListener("click", () => {
            state.rooms = state.rooms.filter(r => r.id !== room.id);
            if (activeRoomId === room.id) activeRoomId = state.rooms[0] ? state.rooms[0].id : null;
            renderStep2();
        });

        const name = el("input", "st-room-name");
        name.value = room.name;
        name.setAttribute("aria-label", "Room name");
        name.addEventListener("input", () => { room.name = name.value; });

        t.appendChild(remove);
        t.appendChild(el("div", "st-room-emoji", meta.emoji));
        t.appendChild(name);
        t.appendChild(el("div", "st-room-meta", summary));
        return t;
    }

    function addRoom(typeId) {
        const meta = roomMeta(typeId);
        const count = state.rooms.filter(r => r.type === typeId).length;
        const name = count ? `${meta.label} ${count + 1}` : meta.label;
        state.rooms.push({
            id: "r" + (uid++), type: typeId, name,
            devices: Object.assign({}, meta.def)
        });
        if (!activeRoomId) activeRoomId = state.rooms[state.rooms.length - 1].id;
        renderStep2();
    }

    function renderStep3() {
        const tabs = $("#stRoomTabs");
        const body = $("#stDeviceBody");
        tabs.innerHTML = "";
        body.innerHTML = "";

        if (!state.rooms.length) {
            body.appendChild(el("div", "st-floor-empty",
                `<span>🚪</span>No rooms yet — go back a step to add some rooms first.`));
            return;
        }
        if (!state.rooms.find(r => r.id === activeRoomId)) activeRoomId = state.rooms[0].id;

        state.rooms.forEach(room => {
            const meta = roomMeta(room.type);
            const b = el("button", "st-tab" + (room.id === activeRoomId ? " is-active" : ""));
            b.type = "button";
            b.innerHTML = `${meta.emoji} ${room.name}`;
            b.addEventListener("click", () => { activeRoomId = room.id; renderStep3(); });
            tabs.appendChild(b);
        });

        const room = state.rooms.find(r => r.id === activeRoomId);
        const d = room.devices;
        const cols = el("div", "st-device-cols");

        cols.appendChild(deviceCard("💡 Lighting", [
            counter(d, "lights", "Smart lights", 0, 12),
            counter(d, "switches", "Smart switches", 0, 8),
            toggle(d, "ambient", "Ambient lighting")
        ]));
        cols.appendChild(deviceCard("🔒 Security", [
            counter(d, "cameras", "Cameras", 0, 6),
            counter(d, "motion", "Motion sensors", 0, 8),
            counter(d, "doorSensors", "Door / window sensors", 0, 10)
        ]));
        cols.appendChild(deviceCard("🌡️ Comfort", [
            toggle(d, "ac", "AC control"),
            counter(d, "fans", "Smart fans", 0, 6),
            toggle(d, "curtains", "Smart curtains"),
            counter(d, "tempSensors", "Temperature sensors", 0, 6)
        ]));

        body.appendChild(cols);
    }

    function deviceCard(title, ctrls) {
        const card = el("div", "st-device-card");
        card.appendChild(el("h4", null, title));
        ctrls.forEach(c => card.appendChild(c));
        return card;
    }

    function counter(store, key, label, min, max) {
        const row = el("div", "st-ctrl");
        row.appendChild(el("span", "st-ctrl-label", label));
        const st = el("div", "st-stepper");
        const minus = el("button", null, "−"); minus.type = "button";
        const val = el("span", "st-count", store[key]);
        const plus = el("button", null, "+"); plus.type = "button";
        const sync = () => {
            val.textContent = store[key];
            minus.disabled = store[key] <= min;
            plus.disabled = store[key] >= max;
            refreshRoomTabsMeta();
        };
        minus.addEventListener("click", () => { if (store[key] > min) { store[key]--; sync(); } });
        plus.addEventListener("click", () => { if (store[key] < max) { store[key]++; sync(); } });
        st.appendChild(minus); st.appendChild(val); st.appendChild(plus);
        row.appendChild(st);
        sync();
        return row;
    }

    function toggle(store, key, label) {
        const row = el("div", "st-ctrl");
        row.appendChild(el("span", "st-ctrl-label", label));
        const t = el("button", "st-toggle" + (store[key] ? " is-on" : ""));
        t.type = "button";
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", !!store[key]);
        t.addEventListener("click", () => {
            store[key] = !store[key];
            t.classList.toggle("is-on", store[key]);
            t.setAttribute("aria-checked", !!store[key]);
        });
        row.appendChild(t);
        return row;
    }

    function refreshRoomTabsMeta() { /* counts live in blueprint; hook kept for clarity */ }

    function renderStep4() {
        const wrap = $("#stStep4Grid");
        wrap.innerHTML = "";
        SECURITY.forEach(s => {
            const c = el("button", "st-card");
            c.type = "button";
            if (state.security === s.id) c.classList.add("is-selected");
            c.innerHTML =
                `<span class="st-check">✓</span>` +
                `<span class="st-card-emoji">${s.emoji}</span>` +
                `<h3>${s.title}</h3><p class="st-card-sub">${s.sub}</p>` +
                `<ul class="st-feat-list">${s.feats.map(f => `<li>${f}</li>`).join("")}</ul>`;
            c.addEventListener("click", () => { state.security = s.id; renderStep4(); updateActions(); });
            wrap.appendChild(c);
        });
    }

    function renderStep5() {
        const wrap = $("#stStep5Grid");
        wrap.innerHTML = "";
        AI.forEach(a => {
            const c = el("button", "st-card");
            c.type = "button";
            if (state.ai === a.id) c.classList.add("is-selected");
            c.innerHTML =
                `<span class="st-check">✓</span>` +
                `<span class="st-card-emoji">${a.emoji}</span>` +
                `<h3>${a.title}</h3>` +
                `<div class="st-voice">${a.voice}</div>`;
            c.addEventListener("click", () => { state.ai = a.id; renderStep5(); updateActions(); });
            wrap.appendChild(c);
        });
    }

    function renderStep6() {
        const wrap = $("#stStep6");
        wrap.innerHTML = "";
        Object.keys(LIFESTYLE).forEach(group => {
            const g = LIFESTYLE[group];
            const block = el("div", "st-qblock");
            block.appendChild(el("h4", null, g.label));
            const pills = el("div", "st-pills");
            g.options.forEach(opt => {
                const b = el("button", "st-pill" + (state.lifestyle[group] === opt.id ? " is-selected" : ""));
                b.type = "button";
                b.textContent = opt.label;
                b.addEventListener("click", () => {
                    state.lifestyle[group] = opt.id;
                    renderStep6(); updateActions();
                });
                pills.appendChild(b);
            });
            block.appendChild(pills);
            wrap.appendChild(block);
        });
    }

    /* =========================================================
       BLUEPRINT
    ========================================================= */
    function totals() {
        const t = { lights: 0, switches: 0, ambient: 0, cameras: 0, motion: 0,
                    doorSensors: 0, ac: 0, fans: 0, curtains: 0, tempSensors: 0 };
        state.rooms.forEach(r => {
            const d = r.devices;
            t.lights += d.lights; t.switches += d.switches; t.ambient += d.ambient ? 1 : 0;
            t.cameras += d.cameras; t.motion += d.motion; t.doorSensors += d.doorSensors;
            t.ac += d.ac ? 1 : 0; t.fans += d.fans; t.curtains += d.curtains ? 1 : 0;
            t.tempSensors += d.tempSensors;
        });
        return t;
    }

    function intelligenceScore(t) {
        let s = 40;
        s += Math.min(state.rooms.length * 3, 15);
        s += Math.min(t.lights * 0.5, 10);
        s += t.cameras * 3 + t.motion * 1.5 + t.doorSensors * 1.2;
        s += (t.ac + t.curtains) * 1.5 + t.tempSensors * 1.2;
        if (state.security === "fortress") s += 12;
        else if (state.security === "guardian") s += 9;
        else if (state.security === "peace") s += 5;
        if (state.ai) s += 6;
        if (state.lifestyle.priority === "energy") s += 4;
        return Math.max(60, Math.min(99, Math.round(s)));
    }

    function personaName() {
        const a = AI.find(x => x.id === state.ai);
        const noun = SEC_NOUN[state.security] || "Assistant";
        return (a ? a.adj : "Smart") + " " + noun;
    }

    function renderBlueprint() {
        const t = totals();
        const score = intelligenceScore(t);
        const wrap = $("#stBlueprint");
        wrap.innerHTML = "";

        // --- system card ---
        const sys = el("div", "st-bp-card");
        const homeLabel = (HOME_TYPES.find(h => h.id === state.homeType) || {}).title || "Home";
        sys.innerHTML =
            `<h3>Your HomeBoss Design</h3>` +
            `<div class="st-bp-title">🏡 ${state.rooms.length}-Room Intelligent ${homeLabel}</div>` +
            `<p class="st-bp-sub">Custom-built around your rooms, security and lifestyle.</p>`;

        const items = [];
        const push = (icon, label) => items.push(`<li><span class="st-ic">${icon}</span><span><b>${label}</b></span></li>`);
        if (t.lights) push("💡", `${t.lights} Smart Lights`);
        if (t.switches) push("🎛️", `${t.switches} Smart Switches`);
        if (t.doorSensors) push("🚪", `${t.doorSensors} Door / Window Sensors`);
        if (t.cameras) push("📷", `${t.cameras} AI Cameras`);
        if (t.motion) push("📡", `${t.motion} Motion Sensors`);
        if (t.ac || t.tempSensors || t.curtains) push("🌡️", `Climate & Comfort Control`);
        if (state.lifestyle.priority === "energy" || t.tempSensors) push("⚡", `Energy Monitoring`);
        push("🤖", `AI Home Assistant`);
        sys.innerHTML += `<ul class="st-syslist">${items.join("")}</ul>`;
        wrap.appendChild(sys);

        // --- personality + score card ---
        const right = el("div", "st-bp-card st-score-wrap");
        const secTitle = (SECURITY.find(s => s.id === state.security) || {}).title || "—";
        const circ = 2 * Math.PI * 84;
        right.innerHTML =
            `<h3 style="align-self:flex-start">AI Personality</h3>` +
            `<div class="st-persona-name">"${personaName()}"</div>` +
            `<p class="st-bp-sub">${secTitle}</p>` +
            `<div class="st-ring">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <defs><linearGradient id="stGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#007BFF"/><stop offset="100%" stop-color="#00D4FF"/>
                    </linearGradient></defs>
                    <circle class="st-ring-track" cx="100" cy="100" r="84"></circle>
                    <circle class="st-ring-fill" id="stRingFill" cx="100" cy="100" r="84"
                        stroke-dasharray="${circ}" stroke-dashoffset="${circ}"></circle>
                </svg>
                <div class="st-ring-num"><strong id="stScoreNum">0</strong><span>INTELLIGENCE</span></div>
             </div>` +
            `<div class="st-beforeafter">
                <div class="st-ba before"><div class="st-ba-val">35%</div><small>Before</small></div>
                <div class="st-ba after"><div class="st-ba-val">${score}%</div><small>After HomeBoss</small></div>
             </div>`;
        wrap.appendChild(right);

        // --- live preview ---
        const pv = el("div", "st-bp-card st-preview");
        pv.innerHTML = `<h3>Live Home Preview</h3>`;
        const pgrid = el("div", "st-preview-grid");
        if (!state.rooms.length) {
            pgrid.appendChild(el("div", "st-floor-empty", "No rooms to preview."));
        } else {
            state.rooms.forEach(r => {
                const meta = roomMeta(r.type);
                const d = r.devices;
                const dots = [];
                for (let i = 0; i < Math.min(d.lights, 6); i++) dots.push(`<span class="st-pv-dot light" style="animation-delay:${i * 0.2}s"></span>`);
                for (let i = 0; i < Math.min(d.cameras, 3); i++) dots.push(`<span class="st-pv-dot cam" style="animation-delay:${i * 0.3}s"></span>`);
                for (let i = 0; i < Math.min(d.motion + d.doorSensors, 4); i++) dots.push(`<span class="st-pv-dot sensor" style="animation-delay:${i * 0.25}s"></span>`);
                if (d.ac || d.curtains || d.tempSensors) dots.push(`<span class="st-pv-dot comfort"></span>`);
                const room = el("div", "st-pv-room");
                room.innerHTML = `<h5>${meta.emoji} ${r.name}</h5><div class="st-pv-dots">${dots.join("")}</div>`;
                pgrid.appendChild(room);
            });
        }
        pv.appendChild(pgrid);

        pv.innerHTML += `
            <div class="st-cta-row">
                <a href="/#waitlist" class="btn btn-primary">Request Consultation</a>
                <a href="https://wa.me/233206782232?text=I%20designed%20my%20HomeBoss%20system%20and%20want%20to%20talk%20to%20a%20specialist"
                   target="_blank" rel="noopener" class="btn btn-secondary">Talk to a HomeBoss Specialist</a>
            </div>
            <div class="st-mini">
                <button type="button" id="stSave">💾 Save Design</button>
                <button type="button" id="stShare">🔗 Share Design</button>
                <button type="button" id="stRestart">↺ Start Over</button>
            </div>`;
        wrap.appendChild(pv);

        // animate ring + number after paint
        requestAnimationFrame(() => {
            const fill = $("#stRingFill");
            const offset = circ * (1 - score / 100);
            fill.style.strokeDashoffset = offset;
            animateNumber($("#stScoreNum"), 0, score, 1300);
        });

        $("#stSave").addEventListener("click", saveDesign);
        $("#stShare").addEventListener("click", shareDesign);
        $("#stRestart").addEventListener("click", restart);
    }

    function animateNumber(node, from, to, dur) {
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            node.textContent = Math.round(from + (to - from) * eased) + "%";
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* =========================================================
       SAVE / SHARE / RESTORE
    ========================================================= */
    function saveDesign() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            toast("✅ Design saved to this device");
        } catch (e) {
            toast("⚠️ Couldn't save locally — try Share instead");
        }
    }

    function encodeState() {
        return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    }
    function decodeState(str) {
        return JSON.parse(decodeURIComponent(escape(atob(str))));
    }

    function shareDesign() {
        const url = location.origin + location.pathname + "#design=" + encodeState();
        const done = () => toast("🔗 Share link copied to clipboard");
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(() => prompt("Copy your HomeBoss design link:", url));
        } else {
            prompt("Copy your HomeBoss design link:", url);
        }
        history.replaceState(null, "", "#design=" + encodeState());
    }

    function restart() {
        state = freshState();
        current = 0;
        activeRoomId = null;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        history.replaceState(null, "", location.pathname);
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function tryRestore() {
        // 1) shared link wins
        const m = location.hash.match(/design=([^&]+)/);
        if (m) {
            try {
                state = normalize(decodeState(m[1]));
                current = STEPS.length - 1;   // jump to blueprint
                return true;
            } catch (e) { /* fall through */ }
        }
        // 2) locally saved design -> offer resume silently at step 1 (data preloaded)
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) { state = normalize(JSON.parse(saved)); return false; }
        } catch (e) {}
        return false;
    }

    // guard against malformed / partial payloads
    function normalize(obj) {
        const base = freshState();
        if (!obj || typeof obj !== "object") return base;
        base.homeType = obj.homeType || null;
        base.security = obj.security || null;
        base.ai = obj.ai || null;
        base.lifestyle = Object.assign(base.lifestyle, obj.lifestyle || {});
        if (Array.isArray(obj.rooms)) {
            base.rooms = obj.rooms.filter(r => r && roomMeta(r.type)).map(r => {
                const def = Object.assign({}, roomMeta(r.type).def);
                return { id: "r" + (uid++), type: r.type,
                         name: (r.name || roomMeta(r.type).label).toString().slice(0, 40),
                         devices: Object.assign(def, r.devices || {}) };
            });
        }
        if (base.rooms.length) activeRoomId = base.rooms[0].id;
        return base;
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */
    function canAdvance() {
        switch (current) {
            case 0: return !!state.homeType;
            case 1: return state.rooms.length > 0;
            case 3: return !!state.security;
            case 4: return !!state.ai;
            case 5: return state.lifestyle.who && state.lifestyle.priority && state.lifestyle.routine;
            default: return true;
        }
    }

    const HINTS = {
        0: "Select a home type to continue.",
        1: "Add at least one room to your floor plan.",
        3: "Choose a security personality to continue.",
        4: "Pick an AI personality for your home.",
        5: "Answer all three to generate your blueprint."
    };

    function updateActions() {
        const ok = canAdvance();
        const next = $("#stNext");
        const back = $("#stBack");
        back.disabled = current === 0;
        if (current === STEPS.length - 1) { next.style.display = "none"; }
        else {
            next.style.display = "";
            next.disabled = !ok;
            next.textContent = current === STEPS.length - 2 ? "Generate Blueprint →" : "Continue →";
        }
        $("#stHint").textContent = (!ok && HINTS[current]) ? HINTS[current] : "";
    }

    function showPanel() {
        $$(".st-panel").forEach((p, i) => p.classList.toggle("is-active", i === current));
    }

    function renderCurrent() {
        [renderStep1, renderStep2, renderStep3, renderStep4,
         renderStep5, renderStep6, renderBlueprint][current]();
    }

    function goTo(i) {
        current = Math.max(0, Math.min(STEPS.length - 1, i));
        renderProgress();
        showPanel();
        renderCurrent();
        updateActions();
        const top = $("#studioTop");
        if (top) window.scrollTo({ top: top.offsetTop - 90, behavior: "smooth" });
    }

    function next() { if (canAdvance() && current < STEPS.length - 1) goTo(current + 1); }
    function back() { if (current > 0) goTo(current - 1); }

    function renderAll() {
        renderProgress();
        showPanel();
        renderCurrent();
        updateActions();
    }

    /* =========================================================
       TOAST + MOBILE MENU
    ========================================================= */
    let toastTimer;
    function toast(msg) {
        const t = $("#stToast");
        t.textContent = msg;
        t.classList.add("is-show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("is-show"), 2600);
    }

    function initMobileMenu() {
        const toggle = $("#mobile-menu");
        const menu = $(".nav-menu");
        if (!toggle || !menu) return;
        toggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            toggle.classList.toggle("active");
        });
    }

    /* =========================================================
       BOOT
    ========================================================= */
    document.addEventListener("DOMContentLoaded", () => {
        initMobileMenu();
        $("#stNext").addEventListener("click", next);
        $("#stBack").addEventListener("click", back);
        const jumped = tryRestore();
        renderAll();
        if (jumped) {
            const top = $("#studioTop");
            if (top) window.scrollTo({ top: top.offsetTop - 90, behavior: "smooth" });
        }
    });
})();
