// ============================================
// HOMEBOSS - PROTOTYPE LAUNCH REGISTRATION
// Countdown (3D flip digits), phone input, form submit.
// Element ids are unchanged from the previous version.
// ============================================

// Launch date (local time). Update this one line if the date moves.
const LAUNCH_DATE = new Date("2026-08-08T00:00:00");

// --- Country-code phone input ---
let iti = null;
let utilsReady = false;

(function initPhoneInput() {
    const input = document.getElementById("phone");
    if (!input || typeof window.intlTelInput !== "function") return;

    iti = window.intlTelInput(input, {
        initialCountry: "gh",
        preferredCountries: ["gh", "ng", "us", "gb", "za", "ke"],
        separateDialCode: true,
        utilsScript: "/vendor/intl-tel-input/js/utils.js"
    });

    if (iti && iti.promise && typeof iti.promise.then === "function") {
        iti.promise.then(() => { utilsReady = true; }).catch(() => { utilsReady = false; });
    }
})();

function phoneUtilsLoaded() {
    return utilsReady || typeof window.intlTelInputUtils !== "undefined";
}

function getPhoneData() {
    const input = document.getElementById("phone");
    if (iti) {
        const selected = iti.getSelectedCountryData() || {};
        const dial = selected.dialCode ? "+" + selected.dialCode : "";
        let full = "";
        try { full = iti.getNumber(); } catch (e) { full = ""; }
        if (!full) {
            const raw = (input.value || "").replace(/[^\d]/g, "");
            full = raw ? dial + raw : "";
        }
        return { phone: full, countryCode: dial };
    }
    return { phone: (input.value || "").trim(), countryCode: "" };
}

// --- Live countdown with flip animation ---
(function initCountdown() {
    const els = {
        days: document.getElementById("cd-days"),
        hours: document.getElementById("cd-hours"),
        mins: document.getElementById("cd-mins"),
        secs: document.getElementById("cd-secs")
    };
    if (!els.days) return;
    const wrap = document.getElementById("countdownWrap");
    const pad = n => String(n).padStart(2, "0");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function set(el, val) {
        if (el.textContent === val) return;
        el.textContent = val;
        if (reduceMotion) return;
        const card = el.parentElement;
        card.classList.remove("flip");
        void card.offsetWidth; // restart the animation
        card.classList.add("flip");
    }

    let timer = null;
    function tick() {
        const now = new Date();
        let diff = Math.floor((LAUNCH_DATE - now) / 1000);
        if (diff <= 0) {
            set(els.days, "00"); set(els.hours, "00"); set(els.mins, "00"); set(els.secs, "00");
            if (wrap) wrap.classList.add("is-launched");
            if (timer) clearInterval(timer);
            return;
        }
        const days = Math.floor(diff / 86400); diff -= days * 86400;
        const hours = Math.floor(diff / 3600); diff -= hours * 3600;
        const mins = Math.floor(diff / 60); diff -= mins * 60;
        set(els.days, pad(days)); set(els.hours, pad(hours)); set(els.mins, pad(mins)); set(els.secs, pad(diff));
    }

    tick();
    timer = setInterval(tick, 1000);
})();

// --- Form submission ---
(function initForm() {
    const form = document.getElementById("proto-form");
    if (!form) return;

    const submitBtn = document.getElementById("proto-submit");
    const successBox = document.getElementById("proto-success");
    const errorEl = document.getElementById("form-error");

    const showError = msg => { errorEl.textContent = msg; errorEl.style.display = "block"; };
    const clearError = () => { errorEl.textContent = ""; errorEl.style.display = "none"; };

    // Clear the error as soon as the user starts fixing things
    form.addEventListener("input", clearError);

    form.addEventListener("submit", async e => {
        e.preventDefault();
        clearError();

        const fullName = form.fullName.value.trim();
        const email = form.email.value.trim();
        const roleInput = form.querySelector('input[name="role"]:checked');
        const { phone, countryCode } = getPhoneData();

        if (!fullName) return showError("Enter your full name to continue.");

        const digits = phone.replace(/[^\d]/g, "");
        if (!digits || digits.length < 6) return showError("Enter a valid phone number.");

        // Strict per-country check only when utils.js has loaded (mobile can be slow)
        if (iti && phoneUtilsLoaded() && typeof iti.isValidNumber === "function") {
            let valid = true;
            try { valid = iti.isValidNumber(); } catch (err) { valid = true; }
            if (!valid) return showError("That phone number doesn't look right for the selected country.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Enter a valid email address.");
        if (!roleInput) return showError("Choose how you'll be joining.");

        const payload = { fullName, phone, countryCode, email, role: roleInput.value };

        submitBtn.textContent = "Registering";
        submitBtn.disabled = true;

        try {
            const res = await fetch("/api/prototype-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                form.style.display = "none";
                if (successBox) {
                    successBox.style.display = "block";
                    if (window.gsap) gsap.from(successBox, { opacity: 0, y: 16, duration: .6, ease: "power2.out" });
                    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            } else {
                showError(data.error || "Something went wrong. Try again.");
            }
        } catch (err) {
            console.error("Registration failed:", err);
            showError("Couldn't reach the server. Check your connection and try again.");
        } finally {
            submitBtn.textContent = "Register for the launch";
            submitBtn.disabled = false;
        }
    });
})();
