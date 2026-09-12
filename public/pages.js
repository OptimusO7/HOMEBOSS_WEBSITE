/* ============================================================
   PAGES.JS — shared behaviour for the inner pages.
   Custom cursor, nav state, scroll progress, mobile menu,
   a small 3D tilt engine (data-tilt) and flip-card tap support.
   Depends on GSAP (loaded from cdnjs on every page).
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ---- custom cursor (same feel as index.html) ---- */
  const dot = document.getElementById("cur-dot");
  const ring = document.getElementById("cur-ring");
  if (dot && ring && finePointer) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    (function loop() {
      rx += (mx - rx) * .12; ry += (my - ry) * .12;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
    const hoverables = "a,button,.interactive,.flip,.img-card,.tilt,.video-card,input,select,textarea,label";
    document.addEventListener("mouseover", e => {
      if (e.target.closest(hoverables)) document.body.classList.add("hovering");
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(hoverables)) document.body.classList.remove("hovering");
    });
  }

  /* ---- nav + progress ---- */
  const nav = document.getElementById("navbar");
  const pb = document.getElementById("progress-bar");
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 60);
    if (pb) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pb.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  const toggle = document.getElementById("mobile-menu");
  const menu = document.querySelector(".nav-links");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
      toggle.classList.toggle("active");
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open"); toggle.classList.remove("active");
    }));
  }

  /* ---- 3D tilt engine ----
     <div class="tilt" data-tilt="14"> ... <i class="tilt-glare"></i> </div>
     Children with data-z="40" are pushed forward in 3D space.            */
  function initTilt(scope) {
    if (!finePointer || reduceMotion || !window.gsap) return;
    (scope || document).querySelectorAll(".tilt").forEach(card => {
      if (card.dataset.tiltReady) return;
      card.dataset.tiltReady = "1";
      const max = parseFloat(card.dataset.tilt || "12");
      card.querySelectorAll("[data-z]").forEach(el => el.style.setProperty("--z", el.dataset.z));
      const glare = card.querySelector(".tilt-glare");
      const zone = card.closest(".tilt-zone") || card;
      zone.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotateY: x * max, rotateX: -y * max, duration: .5, ease: "power2.out", transformPerspective: 1200 });
        if (glare) { glare.style.setProperty("--gx", ((x + .5) * 100) + "%"); glare.style.setProperty("--gy", ((y + .5) * 100) + "%"); }
      });
      zone.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: .9, ease: "elastic.out(1,.5)" });
      });
    });
  }
  window.HBTilt = initTilt;
  initTilt();

  /* ---- flip cards: tap to flip on touch, keyboard accessible ---- */
  document.querySelectorAll(".flip").forEach(card => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    const flip = () => card.classList.toggle("is-flipped");
    card.addEventListener("click", e => {
      if (e.target.closest("a")) return;
      if (!finePointer) flip();
    });
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  });

  /* ---- magnetic buttons (like index) ---- */
  if (finePointer && !reduceMotion && window.gsap) {
    document.querySelectorAll(".btn-primary,.nav-cta").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * .16, y: (e.clientY - r.top - r.height / 2) * .16, duration: .35, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: .5, ease: "elastic.out(1,.5)" }));
    });
  }

  /* ---- copy-to-clipboard helper for share buttons ---- */
  window.HBCopy = function (text, btn, doneLabel) {
    const done = () => {
      if (!btn) return;
      const orig = btn.innerHTML;
      btn.classList.add("is-done");
      const label = btn.querySelector("span");
      if (label) label.textContent = doneLabel || "Link copied";
      setTimeout(() => { btn.classList.remove("is-done"); btn.innerHTML = orig; }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => window.prompt("Copy this link:", text));
    } else {
      window.prompt("Copy this link:", text);
    }
  };
})();
