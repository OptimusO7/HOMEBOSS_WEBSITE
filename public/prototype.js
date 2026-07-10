// ============================================
// HOMEBOSS - PROTOTYPE LAUNCH REGISTRATION
// ============================================

// Launch date: August 8, 2026 (local time)
const LAUNCH_DATE = new Date("2026-08-08T00:00:00");

// --- Country-code phone input ---
let iti = null;
(function initPhoneInput() {
    const input = document.getElementById("phone");
    if (!input || typeof window.intlTelInput !== "function") return;

    iti = window.intlTelInput(input, {
        initialCountry: "gh",
        preferredCountries: ["gh", "ng", "us", "gb", "za", "ke"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
    });
})();

// Returns { phone, countryCode } using the intl-tel-input widget,
// with a graceful fallback if the utils script didn't load.
function getPhoneData() {
    const input = document.getElementById("phone");
    if (iti) {
        const dial = iti.getSelectedCountryData().dialCode
            ? "+" + iti.getSelectedCountryData().dialCode
            : "";
        let full = "";
        try {
            full = iti.getNumber(); // E.164, e.g. +233206782232
        } catch (e) {
            full = "";
        }
        if (!full) {
            // Fallback: combine dial code with the raw typed digits
            const raw = (input.value || "").replace(/[^\d]/g, "");
            full = dial + raw;
        }
        return { phone: full, countryCode: dial };
    }
    return { phone: (input.value || "").trim(), countryCode: "" };
}

// --- Live countdown ---
(function initCountdown() {
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");
    if (!daysEl) return;

    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
        const now = new Date();
        let diff = Math.floor((LAUNCH_DATE - now) / 1000);
        if (diff <= 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            return;
        }
        const days = Math.floor(diff / 86400); diff -= days * 86400;
        const hours = Math.floor(diff / 3600); diff -= hours * 3600;
        const mins = Math.floor(diff / 60); diff -= mins * 60;
        const secs = diff;

        daysEl.textContent = pad(days);
        hoursEl.textContent = pad(hours);
        minsEl.textContent = pad(mins);
        secsEl.textContent = pad(secs);
    }

    tick();
    setInterval(tick, 1000);
})();

// --- Form submission ---
(function initForm() {
    const form = document.getElementById("proto-form");
    if (!form) return;

    const submitBtn = document.getElementById("proto-submit");
    const successBox = document.getElementById("proto-success");
    const errorEl = document.getElementById("form-error");

    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
    };
    const clearError = () => {
        errorEl.textContent = "";
        errorEl.style.display = "none";
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError();

        const fullName = form.fullName.value.trim();
        const email = form.email.value.trim();
        const roleInput = form.querySelector('input[name="role"]:checked');
        const { phone, countryCode } = getPhoneData();

        // Client-side validation
        if (!fullName) return showError("Please enter your full name.");
        if (!phone || phone.replace(/[^\d]/g, "").length < 6) {
            return showError("Please enter a valid phone number.");
        }
        if (iti && typeof iti.isValidNumber === "function" && !iti.isValidNumber()) {
            return showError("That phone number doesn't look right for the selected country.");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return showError("Please enter a valid email address.");
        }
        if (!roleInput) return showError("Please tell us how you'll be joining.");

        const payload = {
            fullName,
            phone,
            countryCode,
            email,
            role: roleInput.value
        };

        submitBtn.textContent = "Registering…";
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
                if (successBox) successBox.style.display = "block";
                successBox.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                showError(data.error || "Something went wrong. Please try again.");
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
