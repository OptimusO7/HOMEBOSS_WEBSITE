/* ============================================================
   HOMEBOSS STUDIO — interactive home design wizard
   Vanilla JS. Renders an isometric 3D floor plan that grows as
   rooms are added and lights up as devices are configured.
   Saved designs and share links from the previous version still load.
   ============================================================ */
(function () {
    "use strict";

    /* ---------- SVG icon set (stroke icons, no emoji) ---------- */
    const svg = (paths, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ${extra || ""}>${paths}</svg>`;
    const I = {
        apartment: svg('<rect x="4" y="2" width="16" height="20"/><path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2M10 22v-4h4v4"/>'),
        house:     svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
        office:    svg('<rect x="3" y="7" width="18" height="14"/><path d="M8 7V4h8v3M3 12h18M12 12v9"/>'),
        hotel:     svg('<path d="M3 20V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12"/><path d="M3 14h18M7 10h3v4H7zM14 10h3v4h-3zM10 20v-3h4v3"/>'),
        school:    svg('<path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 9v5"/>'),
        bedroom:   svg('<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 15h18M6 9V6h5v3M13 9V6h5v3M3 18v2M21 18v2"/>'),
        living:    svg('<path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 12h20v5H2z"/><path d="M4 17v2M20 17v2M7 12v-2h10v2"/>'),
        kitchen:   svg('<path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M2 10h20M8 6v4M16 6v4M12 4v6"/>'),
        bathroom:  svg('<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 4 0M6 20l-1 2M18 20l1 2"/>'),
        study:     svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
        garage:    svg('<path d="M5 17h14M7 17l1.5-5h7L17 17"/><path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0"/><path d="M3 12 12 5l9 7"/>'),
        outdoor:   svg('<path d="M12 3 6 11h3l-4 6h14l-4-6h3z"/><path d="M12 17v4"/>'),
        custom:    svg('<path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>'),
        light:     svg('<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z"/>'),
        switch:    svg('<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="15" cy="12" r="3"/>'),
        camera:    svg('<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>'),
        sensor:    svg('<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>'),
        door:      svg('<path d="M4 21h16"/><path d="M7 21V3h10v18"/><path d="M14 12h.01"/>'),
        thermo:    svg('<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>'),
        bolt:      svg('<path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z"/>'),
        cpu:       svg('<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
        shield:    svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
        family:    svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
        peace:     svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
        smile:     svg('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>'),
        briefcase: svg('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
        radar:     svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v10l7 7"/>'),
        minimal:   svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/>'),
        check:     svg('<path d="M20 6 9 17l-5-5"/>'),
        x:         svg('<path d="M18 6 6 18M6 6l12 12"/>'),
        plus:      svg('<path d="M12 5v14M5 12h14"/>'),
        save:      svg('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>'),
        link:      svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
        refresh:   svg('<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),
        arrowR:    '<svg viewBox="0 0 14 10" fill="none"><path d="M1 5h12M8 1l5 4-5 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
        arrowL:    '<svg viewBox="0 0 14 10" fill="none"><path d="M13 5H1M6 1 1 5l5 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
        message:   svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>')
    };

    /* ---------- static config ---------- */
    const STEPS = ["Home type", "Rooms", "Devices", "Security", "AI personality", "Lifestyle", "Blueprint"];

    const HOME_TYPES = [
        { id: "apartment", icon: "apartment", title: "Apartment",    sub: "Compact, connected city living." },
        { id: "house",     icon: "house",     title: "Family house", sub: "Multi-room comfort and control." },
        { id: "office",    icon: "office",    title: "Office",       sub: "Smart, secure workspaces." },
        { id: "hotel",     icon: "hotel",     title: "Hotel",        sub: "Guest-grade automation at scale." },
        { id: "school",    icon: "school",    title: "School",       sub: "Safe, managed campus intelligence." }
    ];

    const ROOM_TYPES = [
        { id: "bedroom",  icon: "bedroom",  label: "Bedroom",      def: { lights: 2, switches: 1, ambient: true,  cameras: 0, motion: 1, doorSensors: 1, ac: true,  fans: 1, curtains: true,  tempSensors: 1 } },
        { id: "living",   icon: "living",   label: "Living room",  def: { lights: 4, switches: 2, ambient: true,  cameras: 1, motion: 1, doorSensors: 1, ac: true,  fans: 1, curtains: true,  tempSensors: 1 } },
        { id: "kitchen",  icon: "kitchen",  label: "Kitchen",      def: { lights: 3, switches: 2, ambient: false, cameras: 0, motion: 1, doorSensors: 0, ac: false, fans: 1, curtains: false, tempSensors: 1 } },
        { id: "bathroom", icon: "bathroom", label: "Bathroom",     def: { lights: 2, switches: 1, ambient: false, cameras: 0, motion: 1, doorSensors: 0, ac: false, fans: 1, curtains: false, tempSensors: 0 } },
        { id: "study",    icon: "study",    label: "Study",        def: { lights: 2, switches: 1, ambient: true,  cameras: 0, motion: 0, doorSensors: 1, ac: true,  fans: 0, curtains: true,  tempSensors: 1 } },
        { id: "garage",   icon: "garage",   label: "Garage",       def: { lights: 1, switches: 1, ambient: false, cameras: 1, motion: 1, doorSensors: 1, ac: false, fans: 0, curtains: false, tempSensors: 0 } },
        { id: "outdoor",  icon: "outdoor",  label: "Outdoor area", def: { lights: 3, switches: 1, ambient: true,  cameras: 2, motion: 2, doorSensors: 1, ac: false, fans: 0, curtains: false, tempSensors: 0 } },
        { id: "custom",   icon: "custom",   label: "Custom room",  def: { lights: 2, switches: 1, ambient: false, cameras: 0, motion: 0, doorSensors: 0, ac: false, fans: 0, curtains: false, tempSensors: 0 } }
    ];

    const SECURITY = [
        { id: "fortress", icon: "shield", img: "feature-security.jpg", title: "Fortress mode", sub: "Maximum protection for total peace of mind.",
          feats: ["AI cameras on every entry", "Full motion detection", "Smart alarms and sirens", "Access control and logs"] },
        { id: "guardian", icon: "family", img: "feature-door.jpg", title: "Family guardian", sub: "Protection tuned around the people you love.",
          feats: ["Family safety alerts", "Children activity monitoring", "Elderly assistance and fall alerts", "Safe-zone notifications"] },
        { id: "peace",    icon: "peace",  img: "feature-lighting.jpg", title: "Peace mode", sub: "Quiet, minimal monitoring that stays out of the way.",
          feats: ["Essential alerts only", "Smart automation", "Basic entry protection", "Privacy-first sensing"] }
    ];

    const AI = [
        { id: "friendly",     icon: "smile",     title: "Friendly companion",   adj: "Friendly",
          voice: "Good morning. I hope you slept well. Your home is ready for the day." },
        { id: "professional", icon: "briefcase", title: "Professional assistant", adj: "Professional",
          voice: "Good morning. All systems are operating normally." },
        { id: "security",     icon: "radar",     title: "Security guardian",    adj: "Vigilant",
          voice: "Good morning. All entrances are secure. No unusual activity detected." },
        { id: "minimalist",   icon: "minimal",   title: "Minimalist",           adj: "Quiet",
          voice: "Home systems normal." }
    ];

    const SEC_NOUN = { fortress: "Sentinel", guardian: "Guardian", peace: "Companion" };

    const LIFESTYLE = {
        who:      { label: "Who lives here?", options: [{ id: "single", label: "Just me" }, { id: "couple", label: "A couple" }, { id: "family", label: "A family" }, { id: "elderly", label: "Elderly parents" }] },
        priority: { label: "Main priority",   options: [{ id: "security", label: "Security" }, { id: "energy", label: "Energy savings" }, { id: "comfort", label: "Comfort" }, { id: "automation", label: "Automation" }] },
        routine:  { label: "Daily routine",   options: [{ id: "early", label: "Early mornings" }, { id: "standard", label: "Standard schedule" }, { id: "night", label: "Night owl" }] }
    };

    const STORAGE_KEY = "homeboss-studio-design";

    /* ---------- state ---------- */
    let state = freshState();
    let current = 0;
    let activeRoomId = null;
    let uid = 1;

    function freshState() {
        return { homeType: null, rooms: [], security: null, ai: null, lifestyle: { who: null, priority: null, routine: null } };
    }

    /* ---------- helpers ---------- */
    const $  = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
    const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
    const roomMeta = id => ROOM_TYPES.find(r => r.id === id);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const refreshTilt = () => { if (window.HBTilt) window.HBTilt($("#studio")); };

    /* =========================================================
       ISOMETRIC FLOOR RENDERER
       rooms: array of {id,type,name,devices}
       opts: {mini:boolean, onSelect(id), activeId, static:boolean}
    ========================================================= */
    const TILE = 124, GAP = 22;

    function deviceCount(d) {
        return d.lights + d.switches + d.cameras + d.motion + d.doorSensors + d.fans + d.tempSensors + (d.ac ? 1 : 0) + (d.ambient ? 1 : 0) + (d.curtains ? 1 : 0);
    }

    function isoDots(d) {
        const dots = [];
        for (let i = 0; i < Math.min(d.lights, 4); i++) dots.push(`<i class="iso-dot light" style="animation-delay:${i * .2}s"></i>`);
        for (let i = 0; i < Math.min(d.cameras, 3); i++) dots.push(`<i class="iso-dot cam" style="animation-delay:${i * .3}s"></i>`);
        for (let i = 0; i < Math.min(d.motion + d.doorSensors, 4); i++) dots.push(`<i class="iso-dot sensor" style="animation-delay:${i * .25}s"></i>`);
        if (d.ac || d.curtains || d.tempSensors) dots.push(`<i class="iso-dot comfort"></i>`);
        return dots.join("");
    }

    function isoTile(room, opts, col, row) {
        const meta = roomMeta(room.type);
        const t = el("div", "iso-tile" + (opts.static ? " is-static" : "") + (room.id === opts.activeId ? " is-active" : ""));
        t.style.setProperty("--w", TILE + "px");
        t.style.setProperty("--h", TILE + "px");
        t.style.left = (col * (TILE + GAP)) + "px";
        t.style.top = (row * (TILE + GAP)) + "px";
        t.dataset.room = room.id;
        t.innerHTML =
            `<div class="iso-top">${I[meta.icon]}</div>` +
            `<div class="iso-front"></div><div class="iso-side"></div>` +
            `<div class="iso-dots">${isoDots(room.devices)}</div>` +
            `<div class="iso-label">${esc(room.name)}<b>${(c => c ? c + (c === 1 ? " device" : " devices") : "No devices yet")(deviceCount(room.devices))}</b></div>`;
        if (opts.onSelect) t.addEventListener("click", () => opts.onSelect(room.id));
        return t;
    }

    function isoFloor(rooms, opts = {}) {
        const scene = el("div", "iso-scene" + (opts.mini ? " is-mini" : "") + (opts.large ? " is-large" : ""));
        if (!rooms.length) {
            scene.appendChild(el("div", "st-empty", `<b>Your floor plan is empty</b>Add rooms from the palette to start building.`));
            return scene;
        }
        const n = rooms.length;
        const cols = opts.mini ? 1 : (n <= 4 ? 2 : n <= 9 ? 3 : 4);
        const rows = Math.ceil(n / cols);
        const floor = el("div", "iso-floor");
        const w = cols * (TILE + GAP) - GAP, h = rows * (TILE + GAP) - GAP;
        floor.style.width = w + "px"; floor.style.height = h + "px";
        rooms.forEach((r, i) => floor.appendChild(isoTile(r, opts, i % cols, Math.floor(i / cols))));
        scene.appendChild(floor);
        scene.insertAdjacentHTML("beforeend",
            `<div class="iso-legend"><span><i style="background:var(--amber)"></i>Lights</span><span><i style="background:var(--accent)"></i>Cameras</span><span><i style="background:var(--accent2)"></i>Sensors</span><span><i style="background:var(--white)"></i>Comfort</span></div>` +
            (opts.hint ? `<div class="iso-hint">${opts.hint}</div>` : ""));

        // Fit the rotated plane inside the scene. The projection is hard to
        // predict analytically once perspective and the billboard labels are in
        // play, so measure what the browser actually painted and scale to that.
        const fit = () => {
            const parts = floor.querySelectorAll(".iso-tile, .iso-label");
            if (!parts.length) return;
            const bbox = () => {
                let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
                parts.forEach(el => {
                    const q = el.getBoundingClientRect();
                    l = Math.min(l, q.left); r = Math.max(r, q.right);
                    t = Math.min(t, q.top); b = Math.max(b, q.bottom);
                });
                return { w: r - l, h: b - t, cx: (l + r) / 2, cy: (t + b) / 2 };
            };
            const prev = floor.style.transition;
            floor.style.transition = "none";
            // Tiles animate in; freeze them so the measurement is of the
            // settled layout rather than a frame mid-animation.
            floor.classList.add("is-measuring");
            floor.style.setProperty("--iso-scale", "1");
            floor.style.setProperty("--iso-x", "0px");
            floor.style.setProperty("--iso-y", "0px");

            const sr = scene.getBoundingClientRect();
            const availW = sr.width - 36, availH = sr.height - (opts.mini ? 56 : 84);
            const m = bbox();
            const s = Math.min(1, availW / m.w, availH / m.h);
            floor.style.setProperty("--iso-scale", s.toFixed(3));

            // Extrusion and labels make the painted shape lopsided, so re-measure
            // and nudge it back to the middle of the frame.
            const m2 = bbox();
            floor.style.setProperty("--iso-x", Math.round(sr.left + sr.width / 2 - m2.cx) + "px");
            floor.style.setProperty("--iso-y", Math.round(sr.top + sr.height / 2 - 8 - m2.cy) + "px");

            floor.classList.remove("is-measuring");
            floor.offsetHeight;                       // flush before restoring the transition
            floor.style.transition = prev;
        };
        requestAnimationFrame(fit);
        setTimeout(fit, 850);                         // settle again once the tiles land
        if ("ResizeObserver" in window) new ResizeObserver(fit).observe(scene);
        return scene;
    }

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
            if (i > current) btn.disabled = true;
            btn.innerHTML = `<span class="st-dot">${i < current ? I.check : i + 1}</span><span class="st-node-label">${label}</span>`;
            btn.addEventListener("click", () => { if (i <= current) goTo(i); });
            li.appendChild(btn);
            nodes.appendChild(li);
        });
        const pct = (current / (STEPS.length - 1)) * 100;
        $("#stRailFill").style.width = pct + "%";
        $("#stMFill").style.width = pct + "%";
        $("#stMStep").textContent = "Step " + (current + 1) + " of " + STEPS.length;
        $("#stMLabel").textContent = STEPS[current];
        $$(".st-step-count").forEach(n => n.textContent = `Step ${current + 1} / ${STEPS.length}`);
    }

    /* =========================================================
       STEP 1 — home type
    ========================================================= */
    function renderStep1() {
        const wrap = $("#stStep1Grid");
        wrap.innerHTML = "";
        HOME_TYPES.forEach(h => {
            const c = el("button", "st-card tilt");
            c.type = "button"; c.dataset.tilt = "8";
            c.setAttribute("aria-pressed", state.homeType === h.id);
            if (state.homeType === h.id) c.classList.add("is-selected");
            c.innerHTML = `<span class="st-check">${I.check}</span><span class="st-card-ic" data-z="20">${I[h.icon]}</span><h3 data-z="14">${h.title}</h3><p class="st-card-sub">${h.sub}</p><i class="tilt-glare"></i>`;
            c.addEventListener("click", () => { state.homeType = h.id; renderStep1(); updateActions(); });
            wrap.appendChild(c);
        });
        refreshTilt();
    }

    /* =========================================================
       STEP 2 — rooms + isometric floor
    ========================================================= */
    function renderStep2() {
        const pal = $("#stPalette");
        pal.innerHTML = "";
        ROOM_TYPES.forEach(r => {
            const b = el("button", "st-chip");
            b.type = "button";
            b.innerHTML = `${I[r.icon]}<span>${r.label}</span><span class="st-chip-plus">${I.plus}</span>`;
            b.addEventListener("click", () => addRoom(r.id));
            pal.appendChild(b);
        });

        const floor = $("#stFloor");
        floor.innerHTML = "";
        floor.appendChild(isoFloor(state.rooms, { activeId: activeRoomId, hint: "Click a room to select it", onSelect: id => { activeRoomId = id; renderStep2(); } }));

        const list = $("#stRooms");
        list.innerHTML = "";
        if (!state.rooms.length) {
            list.appendChild(el("div", "st-empty", `<b>No rooms yet</b>Every room you add appears here and on the floor plan.`));
        } else {
            state.rooms.forEach(room => list.appendChild(roomRow(room)));
        }
        $("#stRoomCount").textContent = state.rooms.length ? `${state.rooms.length} room${state.rooms.length > 1 ? "s" : ""}` : "";
        updateActions();
    }

    function roomRow(room) {
        const meta = roomMeta(room.type);
        const row = el("div", "st-room" + (room.id === activeRoomId ? " is-active" : ""));
        row.innerHTML = `${I[meta.icon]}`;
        const name = el("input", "st-room-name");
        name.value = room.name; name.maxLength = 40;
        name.setAttribute("aria-label", "Room name");
        name.addEventListener("input", () => {
            room.name = name.value;
            const lbl = $(`.iso-tile[data-room="${room.id}"] .iso-label`);
            if (lbl) lbl.firstChild.textContent = room.name || meta.label;
        });
        name.addEventListener("focus", () => { activeRoomId = room.id; $$(".st-room").forEach(r => r.classList.toggle("is-active", r === row)); $$(".iso-tile").forEach(t => t.classList.toggle("is-active", t.dataset.room === room.id)); });
        const remove = el("button", "st-room-remove", I.x);
        remove.type = "button"; remove.title = "Remove room"; remove.setAttribute("aria-label", "Remove " + room.name);
        remove.addEventListener("click", () => {
            state.rooms = state.rooms.filter(r => r.id !== room.id);
            if (activeRoomId === room.id) activeRoomId = state.rooms[0] ? state.rooms[0].id : null;
            renderStep2();
        });
        row.appendChild(name); row.appendChild(remove);
        return row;
    }

    function addRoom(typeId) {
        const meta = roomMeta(typeId);
        if (state.rooms.length >= 16) { toast("Sixteen rooms is the studio limit for now."); return; }
        const count = state.rooms.filter(r => r.type === typeId).length;
        const name = count ? `${meta.label} ${count + 1}` : meta.label;
        const room = { id: "r" + (uid++), type: typeId, name, devices: Object.assign({}, meta.def) };
        state.rooms.push(room);
        activeRoomId = room.id;
        renderStep2();
    }

    /* =========================================================
       STEP 3 — devices per room, with live single-room preview
    ========================================================= */
    function renderStep3() {
        const tabs = $("#stRoomTabs"), body = $("#stDeviceBody");
        tabs.innerHTML = ""; body.innerHTML = "";

        if (!state.rooms.length) {
            body.appendChild(el("div", "st-empty", `<b>No rooms yet</b>Go back a step and add some rooms first.`));
            return;
        }
        if (!state.rooms.find(r => r.id === activeRoomId)) activeRoomId = state.rooms[0].id;

        state.rooms.forEach(room => {
            const meta = roomMeta(room.type);
            const b = el("button", "st-tab" + (room.id === activeRoomId ? " is-active" : ""));
            b.type = "button";
            b.innerHTML = `${I[meta.icon]}<span>${esc(room.name)}</span>`;
            b.addEventListener("click", () => { activeRoomId = room.id; renderStep3(); });
            tabs.appendChild(b);
        });

        const room = state.rooms.find(r => r.id === activeRoomId);
        const d = room.devices;
        const wrap = el("div", "st-fitout");
        const cols = el("div", "st-device-cols");

        const refresh = () => {
            const dots = $(".iso-dots", preview); if (dots) dots.innerHTML = isoDots(d);
            const lb = $(".iso-label b", preview); if (lb) { const c = deviceCount(d); lb.textContent = c ? c + (c === 1 ? " device" : " devices") : "No devices yet"; }
            renderRoomStats();
        };
        cols.appendChild(deviceCard("light", "Lighting", [
            counter(d, "lights", "Smart lights", 0, 12, refresh),
            counter(d, "switches", "Smart switches", 0, 8, refresh),
            toggle(d, "ambient", "Ambient lighting", refresh)
        ]));
        cols.appendChild(deviceCard("shield", "Security", [
            counter(d, "cameras", "Cameras", 0, 6, refresh),
            counter(d, "motion", "Motion sensors", 0, 8, refresh),
            counter(d, "doorSensors", "Door and window sensors", 0, 10, refresh)
        ]));
        cols.appendChild(deviceCard("thermo", "Comfort", [
            toggle(d, "ac", "AC control", refresh),
            counter(d, "fans", "Smart fans", 0, 6, refresh),
            toggle(d, "curtains", "Smart curtains", refresh),
            counter(d, "tempSensors", "Temperature sensors", 0, 6, refresh)
        ]));
        wrap.appendChild(cols);

        const side = el("div");
        const preview = isoFloor([room], { mini: true, static: true, activeId: room.id });
        side.appendChild(preview);
        const stats = el("div", "st-roomstats");
        side.appendChild(stats);
        wrap.appendChild(side);
        body.appendChild(wrap);

        function renderRoomStats() {
            stats.innerHTML =
                `<div><b>${d.lights}</b><span>Lights</span></div>` +
                `<div><b>${d.cameras}</b><span>Cameras</span></div>` +
                `<div><b>${d.motion + d.doorSensors}</b><span>Sensors</span></div>` +
                `<div><b>${(d.ac ? 1 : 0) + (d.curtains ? 1 : 0) + d.fans + d.tempSensors}</b><span>Comfort</span></div>`;
        }
        renderRoomStats();
    }

    function deviceCard(icon, title, ctrls) {
        const card = el("div", "st-device-card");
        card.appendChild(el("h4", null, `${I[icon]}<span>${title}</span>`));
        ctrls.forEach(c => card.appendChild(c));
        return card;
    }

    function counter(store, key, label, min, max, onChange) {
        const row = el("div", "st-ctrl");
        row.appendChild(el("span", "st-ctrl-label", label));
        const st = el("div", "st-stepper");
        const minus = el("button", null, "−"); minus.type = "button"; minus.setAttribute("aria-label", "Fewer " + label.toLowerCase());
        const val = el("span", "st-count", store[key]);
        const plus = el("button", null, "+"); plus.type = "button"; plus.setAttribute("aria-label", "More " + label.toLowerCase());
        const sync = () => { val.textContent = store[key]; minus.disabled = store[key] <= min; plus.disabled = store[key] >= max; };
        minus.addEventListener("click", () => { if (store[key] > min) { store[key]--; sync(); onChange && onChange(); } });
        plus.addEventListener("click", () => { if (store[key] < max) { store[key]++; sync(); onChange && onChange(); } });
        st.appendChild(minus); st.appendChild(val); st.appendChild(plus);
        row.appendChild(st);
        sync();
        return row;
    }

    function toggle(store, key, label, onChange) {
        const row = el("div", "st-ctrl");
        row.appendChild(el("span", "st-ctrl-label", label));
        const t = el("button", "st-toggle" + (store[key] ? " is-on" : ""));
        t.type = "button"; t.setAttribute("role", "switch"); t.setAttribute("aria-checked", !!store[key]); t.setAttribute("aria-label", label);
        t.addEventListener("click", () => {
            store[key] = !store[key];
            t.classList.toggle("is-on", store[key]);
            t.setAttribute("aria-checked", !!store[key]);
            onChange && onChange();
        });
        row.appendChild(t);
        return row;
    }

    /* =========================================================
       STEP 4 — security style (photo cards)
    ========================================================= */
    function renderStep4() {
        const wrap = $("#stStep4Grid");
        wrap.innerHTML = "";
        SECURITY.forEach(s => {
            const c = el("button", "st-card has-img tilt");
            c.type = "button"; c.dataset.tilt = "7";
            c.setAttribute("aria-pressed", state.security === s.id);
            if (state.security === s.id) c.classList.add("is-selected");
            c.innerHTML =
                `<img src="${s.img}" alt="" loading="lazy">` +
                `<span class="st-check">${I.check}</span>` +
                `<div class="st-card-body" data-z="26"><span class="st-card-ic">${I[s.icon]}</span><h3>${s.title}</h3><p class="st-card-sub">${s.sub}</p>` +
                `<ul class="st-feat-list">${s.feats.map(f => `<li>${I.check}<span>${f}</span></li>`).join("")}</ul></div><i class="tilt-glare"></i>`;
            c.addEventListener("click", () => { state.security = s.id; renderStep4(); updateActions(); });
            wrap.appendChild(c);
        });
        refreshTilt();
    }

    /* =========================================================
       STEP 5 — AI personality (typewriter voice preview)
    ========================================================= */
    let typeTimer = null;
    function renderStep5() {
        const wrap = $("#stStep5Grid");
        wrap.innerHTML = "";
        AI.forEach(a => {
            const c = el("button", "st-card tilt");
            c.type = "button"; c.dataset.tilt = "8";
            c.setAttribute("aria-pressed", state.ai === a.id);
            const selected = state.ai === a.id;
            if (selected) c.classList.add("is-selected");
            c.innerHTML =
                `<span class="st-check">${I.check}</span><span class="st-card-ic" data-z="20">${I[a.icon]}</span><h3>${a.title}</h3>` +
                `<div class="st-voice"><div class="st-wave">${"<i></i>".repeat(9)}</div><span class="st-voice-text">${selected ? "" : a.voice}</span></div><i class="tilt-glare"></i>`;
            c.addEventListener("click", () => { state.ai = a.id; renderStep5(); updateActions(); });
            wrap.appendChild(c);
            if (selected) typeOut($(".st-voice-text", c), a.voice);
        });
        refreshTilt();
    }
    function typeOut(node, text) {
        clearInterval(typeTimer);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { node.textContent = text; return; }
        let i = 0; node.innerHTML = '<span class="st-cursor"></span>';
        typeTimer = setInterval(() => {
            i++;
            node.innerHTML = esc(text.slice(0, i)) + (i < text.length ? '<span class="st-cursor"></span>' : "");
            if (i >= text.length) clearInterval(typeTimer);
        }, 28);
    }

    /* =========================================================
       STEP 6 — lifestyle
    ========================================================= */
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
                b.type = "button"; b.textContent = opt.label;
                b.setAttribute("aria-pressed", state.lifestyle[group] === opt.id);
                b.addEventListener("click", () => { state.lifestyle[group] = opt.id; renderStep6(); updateActions(); });
                pills.appendChild(b);
            });
            block.appendChild(pills);
            wrap.appendChild(block);
        });
    }

    /* =========================================================
       STEP 7 — blueprint
    ========================================================= */
    function totals() {
        const t = { lights: 0, switches: 0, ambient: 0, cameras: 0, motion: 0, doorSensors: 0, ac: 0, fans: 0, curtains: 0, tempSensors: 0 };
        state.rooms.forEach(r => {
            const d = r.devices;
            t.lights += d.lights; t.switches += d.switches; t.ambient += d.ambient ? 1 : 0;
            t.cameras += d.cameras; t.motion += d.motion; t.doorSensors += d.doorSensors;
            t.ac += d.ac ? 1 : 0; t.fans += d.fans; t.curtains += d.curtains ? 1 : 0; t.tempSensors += d.tempSensors;
        });
        return t;
    }

    function intelligenceScore(t) {
        let s = 40;
        s += Math.min(state.rooms.length * 3, 15);
        s += Math.min(t.lights * 0.5, 10);
        s += t.cameras * 3 + t.motion * 1.5 + t.doorSensors * 1.2;
        s += (t.ac + t.curtains) * 1.5 + t.tempSensors * 1.2;
        if (state.security === "fortress") s += 12; else if (state.security === "guardian") s += 9; else if (state.security === "peace") s += 5;
        if (state.ai) s += 6;
        if (state.lifestyle.priority === "energy") s += 4;
        return Math.max(60, Math.min(99, Math.round(s)));
    }

    function personaName() {
        const a = AI.find(x => x.id === state.ai);
        return (a ? a.adj : "Smart") + " " + (SEC_NOUN[state.security] || "Assistant");
    }

    function renderBlueprint() {
        const t = totals();
        const score = intelligenceScore(t);
        const wrap = $("#stBlueprint");
        wrap.innerHTML = "";

        const homeLabel = (HOME_TYPES.find(h => h.id === state.homeType) || {}).title || "Home";
        const sys = el("div", "st-bp-card");
        sys.innerHTML = `<h3>Your HomeBoss design</h3><div class="st-bp-title">${state.rooms.length}-room intelligent ${homeLabel.toLowerCase()}</div><p class="st-bp-sub">Custom-built around your rooms, security style and lifestyle.</p>`;
        const items = [];
        const push = (icon, label) => items.push(`<li>${I[icon]}<span>${label}</span></li>`);
        if (t.lights) push("light", `${t.lights} smart lights`);
        if (t.switches) push("switch", `${t.switches} smart switches`);
        if (t.doorSensors) push("door", `${t.doorSensors} door and window sensors`);
        if (t.cameras) push("camera", `${t.cameras} AI cameras`);
        if (t.motion) push("sensor", `${t.motion} motion sensors`);
        if (t.ac || t.tempSensors || t.curtains) push("thermo", "Climate and comfort control");
        if (state.lifestyle.priority === "energy" || t.tempSensors) push("bolt", "Energy monitoring");
        push("cpu", "AI home assistant");
        sys.innerHTML += `<ul class="st-syslist">${items.join("")}</ul>`;
        wrap.appendChild(sys);

        const right = el("div", "st-bp-card st-score-wrap");
        const secTitle = (SECURITY.find(s => s.id === state.security) || {}).title || "";
        const circ = 2 * Math.PI * 84;
        right.innerHTML =
            `<h3 style="align-self:flex-start">AI personality</h3>` +
            `<div class="st-persona-name">${personaName()}</div><p class="st-bp-sub">${secTitle}</p>` +
            `<div class="st-ring"><svg width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="stGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4fc3f7"/><stop offset="100%" stop-color="#b7ff6a"/></linearGradient></defs>` +
            `<circle class="st-ring-track" cx="100" cy="100" r="84"></circle><circle class="st-ring-fill" id="stRingFill" cx="100" cy="100" r="84" stroke-dasharray="${circ}" stroke-dashoffset="${circ}"></circle></svg>` +
            `<div class="st-ring-num"><strong id="stScoreNum">0%</strong><span>Intelligence</span></div></div>` +
            `<div class="st-beforeafter"><div class="st-ba before"><div class="st-ba-val">35%</div><small>Before</small></div><div class="st-ba after"><div class="st-ba-val">${score}%</div><small>After HomeBoss</small></div></div>`;
        wrap.appendChild(right);

        const pv = el("div", "st-bp-card st-preview");
        pv.innerHTML = `<h3>Your home, live</h3>`;
        pv.appendChild(isoFloor(state.rooms, { large: true, hint: "Every dot is a device you configured" }));
        pv.insertAdjacentHTML("beforeend",
            `<div class="st-cta-row">
                <a href="index.html#waitlist" class="btn-primary interactive">Request a consultation ${I.arrowR}</a>
                <a href="https://wa.me/233206782232?text=I%20designed%20my%20HomeBoss%20system%20and%20want%20to%20talk%20to%20a%20specialist" target="_blank" rel="noopener" class="icon-btn interactive">${I.message}<span>Talk to a HomeBoss specialist</span></a>
             </div>
             <div class="st-mini">
                <button type="button" class="icon-btn" id="stSave">${I.save}<span>Save design</span></button>
                <button type="button" class="icon-btn" id="stShare">${I.link}<span>Copy share link</span></button>
                <button type="button" class="icon-btn" id="stRestart">${I.refresh}<span>Start over</span></button>
             </div>`);
        wrap.appendChild(pv);

        requestAnimationFrame(() => {
            const fill = $("#stRingFill");
            fill.style.strokeDashoffset = circ * (1 - score / 100);
            animateNumber($("#stScoreNum"), 0, score, 1300);
        });

        $("#stSave").addEventListener("click", saveDesign);
        $("#stShare").addEventListener("click", shareDesign);
        $("#stRestart").addEventListener("click", restart);
    }

    function animateNumber(node, from, to, dur) {
        const start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            node.textContent = Math.round(from + (to - from) * eased) + "%";
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    /* =========================================================
       SAVE / SHARE / RESTORE
    ========================================================= */
    function saveDesign() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); flash("#stSave", "Saved"); toast("Design saved to this device."); }
        catch (e) { toast("Couldn't save on this device. Copy the share link instead."); }
    }
    function encodeState() { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
    function decodeState(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
    function shareDesign() {
        const url = location.origin + location.pathname + "#design=" + encodeState();
        history.replaceState(null, "", "#design=" + encodeState());
        if (window.HBCopy) { HBCopy(url, $("#stShare"), "Link copied"); toast("Share link copied to clipboard."); }
        else window.prompt("Copy your HomeBoss design link:", url);
    }
    function flash(sel, label) {
        const b = $(sel); if (!b) return;
        const span = $("span", b); const orig = span.textContent;
        b.classList.add("is-done"); span.textContent = label;
        setTimeout(() => { b.classList.remove("is-done"); span.textContent = orig; }, 2000);
    }
    function restart() {
        state = freshState(); current = 0; activeRoomId = null;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        history.replaceState(null, "", location.pathname);
        renderAll();
        scrollToTop();
        toast("Starting a fresh design.");
    }
    function tryRestore() {
        const m = location.hash.match(/design=([^&]+)/);
        if (m) {
            try { state = normalize(decodeState(m[1])); current = STEPS.length - 1; return true; } catch (e) {}
        }
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) { state = normalize(JSON.parse(saved)); if (state.rooms.length) toast("Loaded your saved design."); }
        } catch (e) {}
        return false;
    }
    function normalize(obj) {
        const base = freshState();
        if (!obj || typeof obj !== "object") return base;
        base.homeType = HOME_TYPES.find(h => h.id === obj.homeType) ? obj.homeType : null;
        base.security = SECURITY.find(s => s.id === obj.security) ? obj.security : null;
        base.ai = AI.find(a => a.id === obj.ai) ? obj.ai : null;
        base.lifestyle = Object.assign(base.lifestyle, obj.lifestyle || {});
        if (Array.isArray(obj.rooms)) {
            base.rooms = obj.rooms.filter(r => r && roomMeta(r.type)).slice(0, 16).map(r => {
                const def = Object.assign({}, roomMeta(r.type).def);
                return { id: "r" + (uid++), type: r.type, name: (r.name || roomMeta(r.type).label).toString().slice(0, 40), devices: Object.assign(def, r.devices || {}) };
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
            case 5: return !!(state.lifestyle.who && state.lifestyle.priority && state.lifestyle.routine);
            default: return true;
        }
    }
    const HINTS = { 0: "Choose a home type to continue.", 1: "Add at least one room to your floor plan.", 3: "Choose a security style to continue.", 4: "Pick a personality for your home.", 5: "Answer all three questions to generate your blueprint." };

    function updateActions() {
        const ok = canAdvance();
        const next = $("#stNext"), back = $("#stBack");
        back.disabled = current === 0;
        if (current === STEPS.length - 1) next.style.display = "none";
        else {
            next.style.display = "";
            next.disabled = !ok;
            next.innerHTML = (current === STEPS.length - 2 ? "Generate blueprint" : "Continue") + " " + I.arrowR;
        }
        $("#stHint").textContent = (!ok && HINTS[current]) ? HINTS[current] : "";
    }
    function showPanel() { $$(".st-panel").forEach((p, i) => p.classList.toggle("is-active", i === current)); }
    function renderCurrent() { [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderBlueprint][current](); }
    function scrollToTop() {
        const top = $("#studioTop");
        if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
    }
    function goTo(i) {
        current = Math.max(0, Math.min(STEPS.length - 1, i));
        renderProgress(); showPanel(); renderCurrent(); updateActions();
        scrollToTop();
    }
    function next() { if (canAdvance() && current < STEPS.length - 1) goTo(current + 1); }
    function back() { if (current > 0) goTo(current - 1); }
    function renderAll() { renderProgress(); showPanel(); renderCurrent(); updateActions(); }

    /* ---------- toast ---------- */
    let toastTimer;
    function toast(msg) {
        const t = $("#stToast"); if (!t) return;
        t.textContent = msg; t.classList.add("is-show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("is-show"), 2600);
    }

    /* ---------- boot ---------- */
    document.addEventListener("DOMContentLoaded", () => {
        $("#stNext").addEventListener("click", next);
        $("#stBack").addEventListener("click", back);
        const jumped = tryRestore();
        renderAll();
        if (jumped) setTimeout(scrollToTop, 200);
        document.addEventListener("keydown", e => {
            if (e.target.matches("input,textarea")) return;
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") back();
        });
    });
})();