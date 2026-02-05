// Base scaffold for birthday countdown & state management
// Target birthday: February 8, 00:00 local time

(function () {
  const BIRTHDAY_YEAR = 2026; // one-time this year
  const BIRTHDAY_MONTH = 1; // February (0-indexed)
  const BIRTHDAY_DAY = 8;

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  const countdownCard = document.getElementById("countdown-card");
  const countdownContent = document.getElementById("countdown-content");
  const countdownSubtext = document.getElementById("countdown-subtext");
  const birthdayMessage = document.getElementById("birthday-message");
  const openLetterLink = document.getElementById("open-letter-link");

  const envelopeLink = document.getElementById("envelope-link");
  const envelopeLetter = document.getElementById("envelope-letter");
  const envelopeNote = document.getElementById("envelope-note");

  const letterOverlay = document.getElementById("letter-overlay");
  const envelopeSection = document.getElementById("letter");

  const birthdayAudio = document.getElementById("birthday-audio");
  const audioToggle = document.getElementById("audio-toggle");

  let countdownIntervalId = null;
  let hasTriggeredBirthday = false;
  let isAudioManuallyPlaying = false;

  function getTargetDate() {
    return new Date(BIRTHDAY_YEAR, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0, 0, 0, 0);
  }

  function setStateToPreBirthday() {
    if (!countdownCard) return;

    countdownCard.style.display = "block";
    if (countdownContent) countdownContent.hidden = false;
    if (countdownSubtext) countdownSubtext.hidden = false;
    if (birthdayMessage) birthdayMessage.hidden = true;

    if (envelopeLetter) {
      envelopeLetter.style.opacity = "0";
      envelopeLetter.style.transform = "";
      envelopeLetter.classList.remove("expanded");
      envelopeLetter.style.pointerEvents = "none";
    }
    if (envelopeNote) {
      envelopeNote.textContent = "Tap the seal after midnight to open your letter.";
    }

    if (letterOverlay) {
      letterOverlay.classList.remove("visible");
    }
  }

  function setStateToPostBirthday() {
    if (!countdownCard) return;

    countdownCard.style.display = "block";
    if (countdownContent) countdownContent.hidden = true;
    if (countdownSubtext) countdownSubtext.hidden = true;
    if (birthdayMessage) birthdayMessage.hidden = false;

    if (envelopeNote) {
      envelopeNote.textContent = "Your letter is ready. Tap the seal to open it.";
    }
  }

  function updateCountdown() {
    const now = new Date();
    const target = getTargetDate();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      // Switch to birthday state once, trigger magic, and stop countdown
      if (!hasTriggeredBirthday) {
        hasTriggeredBirthday = true;
        setStateToPostBirthday();
        if (countdownIntervalId !== null) {
          clearInterval(countdownIntervalId);
        }

        triggerMidnightMagic();
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");

    setStateToPreBirthday();
  }

  function triggerMidnightMagic() {
    // Confetti burst (if library is loaded)
    if (typeof confetti === "function") {
      const duration = 6 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        // gentle stream from the top
        confetti({
          particleCount: 6,
          spread: 70,
          origin: { x: Math.random(), y: 0.15 },
          colors: ["#c41e3a", "#d4af37", "#ffccd5"],
        });

        // occasional firecracker-style bursts from the bottom corners
        if (Math.random() < 0.25) {
          confetti({
            particleCount: 40,
            startVelocity: 55,
            spread: 80,
            angle: 60,
            origin: { x: 0.05, y: 0.9 },
            colors: ["#c41e3a", "#d4af37", "#ffffff"],
          });
          confetti({
            particleCount: 40,
            startVelocity: 55,
            spread: 80,
            angle: 120,
            origin: { x: 0.95, y: 0.9 },
            colors: ["#c41e3a", "#d4af37", "#ffffff"],
          });
        }
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }

    // Start audio softly
    if (birthdayAudio) {
      birthdayAudio.volume = 0.9;
      const playPromise = birthdayAudio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          // Autoplay might be blocked; ignore the error silently.
        });
      }
      updateAudioToggleLabel();
    }
  }

  function updateAudioToggleLabel() {
    if (!audioToggle) return;
    const icon = audioToggle.querySelector("i");
    const label = audioToggle.querySelector("span");
    if (!birthdayAudio || !icon || !label) return;

    const isPlaying = !birthdayAudio.paused;
    label.textContent = isPlaying ? "Pause song" : "Play song";
    icon.classList.toggle("fa-music", !isPlaying);
    icon.classList.toggle("fa-pause", isPlaying);
  }

  function handleEnvelopeClick(event) {
    if (event) event.preventDefault();
    const now = new Date();
    const target = getTargetDate();

    if (now < target) {
      // Pre-birthday: show gentle toast (placeholder for now)
      alert("Shhh! Wait for midnight! ");
      return;
    }
    if (!envelopeLetter) return;

    const isOpen = letterOverlay && letterOverlay.classList.contains("visible");

    if (!isOpen) {
      // Open centered modal view
      if (letterOverlay) {
        letterOverlay.classList.add("visible");
      }
      envelopeLetter.classList.add("expanded");
      envelopeLetter.style.opacity = "1";
      envelopeLetter.style.pointerEvents = "auto";
    } else {
      closeLetterModal();
    }
  }

  function closeLetterModal() {
    if (letterOverlay) {
      letterOverlay.classList.remove("visible");
    }
    if (envelopeLetter) {
      envelopeLetter.classList.remove("expanded");
      envelopeLetter.style.opacity = "0";
      envelopeLetter.style.pointerEvents = "none";
      envelopeLetter.style.transform = "";
    }
  }

  function init() {
    updateCountdown();
    countdownIntervalId = setInterval(updateCountdown, 1000);

    if (envelopeLink) {
      envelopeLink.addEventListener("click", handleEnvelopeClick);
    }

    if (letterOverlay) {
      letterOverlay.addEventListener("click", closeLetterModal);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeLetterModal();
      }
    });

    if (openLetterLink && envelopeSection) {
      openLetterLink.addEventListener("click", function (event) {
        event.preventDefault();
        envelopeSection.scrollIntoView({ behavior: "smooth", block: "center" });

        // After a short delay, try to open the letter (if birthday time has passed)
        setTimeout(function () {
          handleEnvelopeClick(null);
        }, 600);
      });
    }

    if (audioToggle && birthdayAudio) {
      audioToggle.addEventListener("click", function () {
        if (birthdayAudio.paused) {
          birthdayAudio
            .play()
            .catch(function () {
              // ignore play error (e.g. browser restriction)
            })
            .finally(updateAudioToggleLabel);
        } else {
          birthdayAudio.pause();
          updateAudioToggleLabel();
        }
      });

      birthdayAudio.addEventListener("play", updateAudioToggleLabel);
      birthdayAudio.addEventListener("pause", updateAudioToggleLabel);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
