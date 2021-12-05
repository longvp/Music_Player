
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "PLayer";

const playlist = $(".playlist");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReapeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "Thà Đừng Nói Ra",
            singer: "Long VP",
            path: "./assets/music/ThaDungNoiRa.mp3",
            image: "./assets/img/girl-2.png"
        },
        {
            name: "Hero",
            singer: "Long VP",
            path: "./assets/music/hero.mp3",
            image: "./assets/img/girl-2.png"
        },
    ],
    render: function () {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url(${song.image})">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playlist.innerHTML = html.join("");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });

    },
    handleEnvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // CD quay, dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: "rotate(360deg)" }
        ], {
            duration: 30000,
            interations: Infinity
        });
        cdThumbAnimate.pause();

        // Phong to, thu nho CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Song play
        audio.onplay = function () {
            player.classList.add("playing");
            _this.isPlaying = true;
            cdThumbAnimate.play();
        };

        // Song pause
        audio.onpause = function () {
            player.classList.remove("playing");
            _this.isPlaying = false;
            cdThumbAnimate.pause();
        };

        audio.ontimeupdate = function () {
            const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
            progress.value = progressPercent;
        };

        progress.onchange = function (e) {
            const seekTime = (e.target.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        };

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        };

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        };

        // Random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Xu ly repeat
        repeatBtn.onclick = function () {
            _this.isReapeat = !_this.isReapeat;
            _this.setConfig("isReapeat", _this.isReapeat);
            repeatBtn.classList.toggle("active", _this.isReapeat);
        };

        // Xu ly next song khi ended
        audio.onended = function () {
            if (_this.isReapeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Click vao playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if ((songNode) || e.target.closest(".option")) {
                // Khi click vao song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }

                // Khi click vao song option
                if (e.target.closest(".option")) {

                }
            }
        }

    },
    loadCurrentSong: function () {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollActiveSong: function () {
        setTimeout(function () {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 500);
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isReapeat = this.config.isReapeat;
    },
    start: function () {
        this.loadConfig();
        this.defineProperties(); // Định nghĩa thuộc tính cho Object
        this.render();
        this.handleEnvents();
        this.loadCurrentSong();
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isReapeat);
    }
};

app.start();
