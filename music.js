/* ============================================================
   BIRTHDAY WEBSITE — music.js
   Floating music player: play/pause, animated bars, auto-start
============================================================ */

'use strict';

(function initMusicPlayer() {
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const bars = document.getElementById('musicBars');
    const player = document.getElementById('musicPlayer');

    if (!audio || !btn) return;

    // Set a gentle volume
    audio.volume = 0.45;

    let isPlaying = false;

    /* ── State toggler ── */
    function setPlaying(state) {
        isPlaying = state;

        if (state) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'flex';
            bars.classList.add('active');
            player.classList.add('playing');
            audio.play().catch(() => { });   // ignore autoplay policy errors silently
        } else {
            playIcon.style.display = 'flex';
            pauseIcon.style.display = 'none';
            bars.classList.remove('active');
            player.classList.remove('playing');
            audio.pause();
        }
    }

    /* ── Button click ── */
    btn.addEventListener('click', () => setPlaying(!isPlaying));

    /* ── Auto-start on FIRST user gesture anywhere on the page ── */
    function tryAutoPlay() {
        if (!isPlaying) setPlaying(true);
        document.removeEventListener('click', tryAutoPlay);
        document.removeEventListener('scroll', tryAutoPlay);
        document.removeEventListener('keydown', tryAutoPlay);
        document.removeEventListener('touchstart', tryAutoPlay);
    }

    document.addEventListener('click', tryAutoPlay);
    document.addEventListener('scroll', tryAutoPlay, { passive: true });
    document.addEventListener('keydown', tryAutoPlay);
    document.addEventListener('touchstart', tryAutoPlay, { passive: true });

    /* ── Also start music when Surprise button is clicked ── */
    const surpriseBtn = document.getElementById('surpriseBtn');
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', () => {
            if (!isPlaying) setPlaying(true);
        });
    }

    /* ── If browser allows autoplay (rare), start immediately ── */
    audio.play().then(() => {
        setPlaying(true);
    }).catch(() => {
        // Autoplay blocked — will start on first gesture
    });

    /* ── Sync state if audio ends or pauses externally ── */
    audio.addEventListener('pause', () => {
        if (isPlaying) { isPlaying = false; setPlaying(false); }
    });
    audio.addEventListener('play', () => {
        if (!isPlaying) { isPlaying = true; setPlaying(true); }
    });

})();
