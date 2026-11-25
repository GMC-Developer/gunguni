document.addEventListener('DOMContentLoaded', function() {

    // --- Surprise Countdown Gate ---
    // Shows a neutral countdown until the day arrives, then removes itself.
    const unlockDate = new Date('2027-01-27T00:00:00');
    const gate = document.getElementById('countdown-gate');
    const countdownLocked = gate && new Date() < unlockDate;

    function startMainMusic() {
        const audio = document.getElementById('background-music');
        const widget = document.getElementById('music-widget');
        const playButton = document.getElementById('music-play');
        const seek = document.getElementById('music-seek');
        const volume = document.getElementById('music-volume');
        const currentTime = document.getElementById('music-current-time');
        const durationTime = document.getElementById('music-duration');
        if (!audio) return;

        document.body.classList.add('main-audio-loading');
        const revealPage = () => document.body.classList.remove('main-audio-loading');
        const formatTime = value => {
            if (!Number.isFinite(value)) return '0:00';
            const minutes = Math.floor(value / 60);
            const seconds = Math.floor(value % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        };
        const syncPlayButton = () => {
            if (!playButton) return;
            playButton.textContent = audio.paused ? '▶' : 'Ⅱ';
            playButton.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
            if (widget) widget.classList.toggle('is-playing', !audio.paused);
        };
        const updateTimeline = () => {
            const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
            const progress = duration ? (audio.currentTime / duration) * 100 : 0;
            if (seek) {
                seek.value = String(progress);
                seek.style.setProperty('--range-progress', `${progress}%`);
            }
            if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
            if (durationTime) durationTime.textContent = formatTime(duration);
        };
        const startPlayback = async () => {
            revealPage();
            if (widget) widget.hidden = false;
            updateTimeline();
            try {
                await audio.play();
            } catch (error) {
                // Audible autoplay can be blocked; the floating player remains ready for a tap.
            }
            syncPlayButton();
        };

        audio.volume = volume ? Number(volume.value) : 0.75;
        audio.addEventListener('timeupdate', updateTimeline);
        audio.addEventListener('loadedmetadata', updateTimeline);
        audio.addEventListener('durationchange', updateTimeline);
        audio.addEventListener('play', syncPlayButton);
        audio.addEventListener('pause', syncPlayButton);

        if (playButton) {
            playButton.addEventListener('click', async () => {
                if (audio.paused) {
                    try { await audio.play(); } catch (error) { syncPlayButton(); }
                } else {
                    audio.pause();
                }
            });
        }
        if (seek) {
            seek.addEventListener('input', () => {
                if (Number.isFinite(audio.duration)) {
                    audio.currentTime = (Number(seek.value) / 100) * audio.duration;
                    seek.style.setProperty('--range-progress', `${seek.value}%`);
                }
            });
        }
        if (volume) {
            volume.style.setProperty('--range-progress', `${Number(volume.value) * 100}%`);
            volume.addEventListener('input', () => {
                audio.volume = Number(volume.value);
                volume.style.setProperty('--range-progress', `${Number(volume.value) * 100}%`);
            });
        }
        audio.addEventListener('canplaythrough', startPlayback, { once: true });
        audio.addEventListener('error', () => {
            revealPage();
            if (widget) widget.hidden = false;
        }, { once: true });

        fetch(new URL('gunguni.mp3', document.baseURI))
            .then(response => {
                if (!response.ok) throw new Error('Could not load the background music.');
                return response.blob();
            })
            .then(song => {
                audio.src = URL.createObjectURL(song);
                audio.load();
            })
            .catch(() => {
                // Keep the page usable if fetch is unavailable (for example, file://).
                audio.src = 'gunguni.mp3';
                audio.preload = 'auto';
                audio.load();
            });

    }

    if (gate) {
        if (new Date() >= unlockDate) {
            gate.remove();
            document.title = 'Happy Birthday, Gun Gun!';
        } else {
            document.body.style.overflow = 'hidden';
            const setNum = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
            const updateGate = () => {
                const diff = unlockDate - new Date();
                if (diff <= 0) { location.reload(); return; }
                setNum('gate-days', Math.floor(diff / 86400000));
                setNum('gate-hours', Math.floor(diff / 3600000) % 24);
                setNum('gate-mins', Math.floor(diff / 60000) % 60);
                setNum('gate-secs', Math.floor(diff / 1000) % 60);
            };
            setInterval(updateGate, 1000);
            updateGate();
        }
    }
    const flowerMobileQuery = window.matchMedia('(max-width: 600px)');
    const randomizeMobileFlowers = () => {
        document.querySelectorAll('.sunflower').forEach((flower) => {
            if (flowerMobileQuery.matches) {
                flower.style.width = `${70 + Math.floor(Math.random() * 41)}px`;
            } else {
                flower.style.removeProperty('width');
            }
        });
    };
    randomizeMobileFlowers();
    flowerMobileQuery.addEventListener('change', randomizeMobileFlowers);

    const musicWidget = document.getElementById('music-widget');
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle && musicWidget) {
        musicToggle.addEventListener('click', () => {
            const collapsed = musicWidget.classList.toggle('collapsed');
            musicToggle.setAttribute('aria-expanded', String(!collapsed));
            musicToggle.setAttribute('aria-label', collapsed ? 'Open music player' : 'Collapse music player');
            musicToggle.textContent = collapsed ? '♫' : '×';
        });
    }
    if (countdownLocked) {
        if (musicWidget) {
            musicWidget.hidden = true;
            musicWidget.classList.add('locked');
        }
    } else {
        startMainMusic();
    }


    // --- Live Age Counter ---
    const birthDate = new Date('2009-01-27T00:00:00');
    const countdownElement = document.getElementById('countdown');

    function updateAge() {
        const now = new Date();

        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();
        let hours = now.getHours() - birthDate.getHours();
        let minutes = now.getMinutes() - birthDate.getMinutes();
        let seconds = now.getSeconds() - birthDate.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }
        if (months < 0) { months += 12; years--; }

        countdownElement.innerHTML = `${years}y ${months}m ${days}d <br> ${hours}h ${minutes}m ${seconds}s`;
    }
    setInterval(updateAge, 1000);
    updateAge();

    // --- Initialize AOS (Animate on Scroll) ---
    AOS.init({
        duration: 800,
        once: true,
    });

    // --- Initialize LightGallery ---
    lightGallery(document.getElementById('lightgallery'), {
        speed: 500,
        download: false
    });

    // --- Hall of Fame Scroller ---
    const scroller = document.getElementById('hall-of-fame-scroller');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    if (scroller && scrollLeftBtn && scrollRightBtn) {
        const card = scroller.querySelector('.snap-center');
        const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card.parentElement).gap);

        scrollRightBtn.addEventListener('click', () => {
            scroller.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
        scrollLeftBtn.addEventListener('click', () => {
            scroller.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }

    // --- Video Uploader ---
    const videoUploadInput = document.getElementById('video-upload');
    const videoPlayer = document.getElementById('video-player');
    const videoUploadLabel = document.getElementById('video-upload-label');

    if(videoUploadInput && videoPlayer && videoUploadLabel) {
        videoUploadLabel.addEventListener('click', () => {
            videoUploadInput.click();
        });

        videoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const videoURL = URL.createObjectURL(file);
                videoPlayer.src = videoURL;
                videoPlayer.classList.remove('hidden');
                videoUploadLabel.classList.add('hidden');
                videoPlayer.play();
            }
        });
    }


    // --- Sakura Petal Animation ---
    const canvas = document.getElementById('sakura-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let petals = [];
        const numPetals = 50;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function Petal() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 2 - canvas.height;
            this.w = 25 + Math.random() * 15;
            this.h = 20 + Math.random() * 10;
            this.opacity = this.w / 40;
            this.flip = Math.random();
            this.xSpeed = 1.5 + Math.random() * 2;
            this.ySpeed = 1 + Math.random() * 1;
            this.flipSpeed = Math.random() * 0.03;
        }

        Petal.prototype.draw = function() {
            if (this.y > canvas.height || this.x > canvas.width) {
                this.x = -this.w;
                this.y = Math.random() * canvas.height * 2 - canvas.height;
                this.xSpeed = 1.5 + Math.random() * 2;
                this.ySpeed = 1 + Math.random() * 1;
                this.flip = Math.random();
            }
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(this.x + this.w / 2, this.y - this.h / 2, this.x + this.w, this.y, this.x + this.w / 2, this.y + this.h / 2);
            ctx.bezierCurveTo(this.x, this.y + this.h, this.x - this.w / 2, this.y, this.x, this.y);
            ctx.closePath();
            ctx.fillStyle = gate && gate.isConnected ? '#f5ad22' : '#FFB7C5';
            ctx.fill();
        }

        Petal.prototype.update = function() {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            this.flip += this.flipSpeed;
            this.draw();
        }

        function createPetals() {
            petals = [];
            for (let i = 0; i < numPetals; i++) {
                petals.push(new Petal());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(petal => {
                petal.update();
            });
            requestAnimationFrame(animate);
        }

        createPetals();
        animate();
    }
});

