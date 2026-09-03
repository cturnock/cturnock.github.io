(function () {
    var PASSWORD_HASH = "ec653e8e8748dbab42c620a11a99458140ebc7c016f2672ff171e44d56298906";
    var STORAGE_KEY = "site-unlocked";

    // localStorage can throw (private browsing, locked-down corporate
    // browsers, disabled site data) — fall back to just not remembering
    // the unlock instead of taking the whole gate down with it.
    function storageGet() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function storageSet() {
        try { localStorage.setItem(STORAGE_KEY, "true"); } catch (e) { /* ignore */ }
    }

    function sha256(text) {
        var data = new TextEncoder().encode(text);
        return crypto.subtle.digest("SHA-256", data).then(function (buffer) {
            return Array.from(new Uint8Array(buffer))
                .map(function (b) { return b.toString(16).padStart(2, "0"); })
                .join("");
        });
    }

    function unlock() {
        storageSet();
        document.body.classList.add("unlocked");
    }

    if (storageGet() === "true") {
        unlock();
        return;
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("gate-form");
        var input = document.getElementById("gate-password");
        var error = document.getElementById("gate-error");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            sha256(input.value).then(function (hash) {
                if (hash === PASSWORD_HASH) {
                    unlock();
                } else {
                    error.textContent = "Incorrect password.";
                    input.value = "";
                    input.focus();
                }
            }).catch(function () {
                error.textContent = "Something went wrong — try a different browser.";
            });
        });
    });
})();
