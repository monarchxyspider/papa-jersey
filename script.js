/* =========================================================
   HAPPY BIRTHDAY PAPA ❤️
   Main Birthday Animation Controller
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const intro = document.getElementById("intro");
const birthdayExperience =
    document.getElementById("birthdayExperience");

const birthdayMusic =
    document.getElementById("birthdayMusic");

const cakeIntro =
    document.getElementById("cakeIntro");

const cake =
    document.getElementById("cake");

const candles =
    document.querySelectorAll(".candle");

const candleHint =
    document.getElementById("candleHint");

const birthdayMessage =
    document.getElementById("birthdayMessage");

const bigBirthdayText =
    document.getElementById("bigBirthdayText");

const messageCard =
    document.getElementById("messageCard");

const wishButton =
    document.getElementById("wishButton");

const floatingMessages =
    document.getElementById("floatingMessages");


/* =========================================================
   SETTINGS
   ========================================================= */

const birthdayText = "HAPPY BIRTHDAY";

const papaMessages = [
    "Happy Birthday Dear Papa ❤️",
    "Happy Birthday Papa 🎂",
    "Love You Papa ❤️",
    "Best Papa Ever ✨",
    "May Allah Always Bless You 🤍",
    "Happy Birthday To You Papa 🎉"
];

let candlesBlown = 0;
let started = false;
let birthdayFinished = false;


/* =========================================================
   INITIAL STATE
   ========================================================= */

function initializePage() {

    birthdayExperience.classList.remove("active");

    birthdayMessage.classList.remove("show");

    messageCard.classList.remove("show");

    wishButton.classList.remove("show");

    cakeIntro.classList.remove("show");

    candleHint.classList.remove("show");

    bigBirthdayText.innerHTML = "";

    candles.forEach((candle) => {

        candle.classList.remove("lit");
        candle.classList.remove("blown");

        const flame =
            candle.querySelector(".flame");

        const smoke =
            candle.querySelector(".smoke");

        if (flame) {
            flame.style.display = "";
        }

        if (smoke) {
            smoke.classList.remove("smoke-active");
        }

    });

}


/* =========================================================
   PAGE LOAD
   ========================================================= */

window.addEventListener("load", () => {

    initializePage();

    setTimeout(() => {

        intro.classList.add("ready");

    }, 300);

});


/* =========================================================
   START EXPERIENCE
   ========================================================= */

function startBirthday() {

    if (started) return;

    started = true;

    /* -----------------------------------------
       Start Music
       ----------------------------------------- */

    if (birthdayMusic) {

        birthdayMusic.currentTime = 0;

        const playPromise =
            birthdayMusic.play();

        if (playPromise !== undefined) {

            playPromise.catch(() => {

                console.log(
                    "Music will start after user interaction."
                );

            });

        }

    }


    /* -----------------------------------------
       Hide Intro
       ----------------------------------------- */

    intro.classList.add("hide");


    /* -----------------------------------------
       Show Birthday Experience
       ----------------------------------------- */

    setTimeout(() => {

        birthdayExperience.classList.add("active");

    }, 500);


    /* -----------------------------------------
       Cake Intro
       ----------------------------------------- */

    setTimeout(() => {

        cakeIntro.classList.add("show");

    }, 900);


    /* -----------------------------------------
       Start Cake Building
       ----------------------------------------- */

    setTimeout(() => {

        buildCake();

    }, 1700);


    /* -----------------------------------------
       Floating Messages
       ----------------------------------------- */

    setTimeout(() => {

        startFloatingMessages();

    }, 2500);

}


/* =========================================================
   START ON USER INTERACTION
   ========================================================= */

document.addEventListener(
    "click",
    function startOnClick(event) {

        if (started) return;

        /*
         * Don't require a specific button.
         * First tap anywhere starts everything.
         */

        startBirthday();

    },
    {
        once: true
    }
);


/* =========================================================
   CAKE BUILDING
   ========================================================= */

function buildCake() {

    const cakeParts =
        document.querySelectorAll(".cake-part");

    /*
     * Bottom-to-top order
     */

    const buildOrder = [
        "plate",
        "bottom",
        "cream-middle",
        "chocolate-middle",
        "cream-top",
        "top"
    ];


    buildOrder.forEach((layerName, index) => {

        setTimeout(() => {

            const layer =
                document.querySelector(
                    `[data-layer="${layerName}"]`
                );

            if (!layer) return;

            layer.classList.add("build");

        }, index * 850);

    });


    /*
     * Cake finished
     */

    const totalCakeTime =
        buildOrder.length * 850 + 600;


    setTimeout(() => {

        cake.classList.add("complete");

        cakeIntro.classList.remove("show");

        lightCandles();

    }, totalCakeTime);

}


/* =========================================================
   LIGHT CANDLES
   ========================================================= */

function lightCandles() {

    candles.forEach((candle, index) => {

        setTimeout(() => {

            candle.classList.add("lit");

        }, index * 350);

    });


    /*
     * Show candle instruction
     */

    setTimeout(() => {

        candleHint.classList.add("show");

    }, candles.length * 350 + 500);

}


/* =========================================================
   CANDLE CLICK
   ========================================================= */

function blowCandle(candle) {

    if (!candle) return;

    if (candle.classList.contains("blown")) {
        return;
    }


    /* -----------------------------------------
       Mark candle as blown
       ----------------------------------------- */

    candle.classList.add("blown");


    /* -----------------------------------------
       Stop flame
       ----------------------------------------- */

    const flame =
        candle.querySelector(".flame");

    if (flame) {

        flame.classList.add("flame-out");

    }


    /* -----------------------------------------
       Start smoke
       ----------------------------------------- */

    const smoke =
        candle.querySelector(".smoke");

    if (smoke) {

        smoke.classList.add("smoke-active");

    }


    candlesBlown++;


    /* -----------------------------------------
       Small blow effect
       ----------------------------------------- */

    createBlowParticles(candle);


    /* -----------------------------------------
       Check all candles
       ----------------------------------------- */

    if (candlesBlown >= candles.length) {

        allCandlesBlown();

    }

}


/* =========================================================
   BLOW PARTICLES
   ========================================================= */

function createBlowParticles(candle) {

    const rect =
        candle.getBoundingClientRect();


    for (let i = 0; i < 5; i++) {

        const particle =
            document.createElement("span");

        particle.className =
            "blow-particle";


        particle.style.left =
            `${rect.left + rect.width / 2}px`;

        particle.style.top =
            `${rect.top + 5}px`;


        particle.style.setProperty(
            "--particle-x",
            `${Math.random() * 80 - 40}px`
        );


        particle.style.setProperty(
            "--particle-y",
            `${-(Math.random() * 50 + 20)}px`
        );


        document.body.appendChild(particle);


        setTimeout(() => {

            particle.remove();

        }, 900);

    }

}


/* =========================================================
   ALL CANDLES BLOWN
   ========================================================= */

function allCandlesBlown() {

    candleHint.classList.remove("show");

    cake.classList.add("celebrate");

    setTimeout(() => {

        revealBirthdayText();

    }, 1200);

}


/* =========================================================
   LETTER-BY-LETTER
   HAPPY BIRTHDAY
   ========================================================= */

function revealBirthdayText() {

    birthdayMessage.classList.add("show");

    bigBirthdayText.innerHTML = "";


    /*
     * Create every letter separately
     */

    [...birthdayText].forEach((letter, index) => {

        const span =
            document.createElement("span");

        span.className =
            "birthday-letter";


        if (letter === " ") {

            span.classList.add("space");

            span.innerHTML = "&nbsp;";

        } else {

            span.textContent = letter;

        }


        span.style.animationDelay =
            `${index * 100}ms`;


        bigBirthdayText.appendChild(span);

    });


    /*
     * Show message after letters finish
     */

    const textTime =
        birthdayText.length * 100 + 1000;


    setTimeout(() => {

        messageCard.classList.add("show");

    }, textTime);


    /*
     * Show wish button
     */

    setTimeout(() => {

        wishButton.classList.add("show");

    }, textTime + 1000);


    birthdayFinished = true;


    /*
     * Celebration messages
     */

    setTimeout(() => {

        createSpecialBirthdayMessage();

    }, textTime + 500);

}


/* =========================================================
   RANDOM FLOATING BIRTHDAY MESSAGES
   ========================================================= */

function startFloatingMessages() {

    /*
     * Keep creating messages slowly.
     */

    setInterval(() => {

        if (!started) return;

        createFloatingMessage();

    }, 2500);

}


/* =========================================================
   CREATE FLOATING MESSAGE
   ========================================================= */

function createFloatingMessage() {

    if (!floatingMessages) return;


    const message =
        document.createElement("div");

    message.className =
        "floating-birthday-message";


    message.textContent =
        papaMessages[
            Math.floor(
                Math.random() *
                papaMessages.length
            )
        ];


    /*
     * Random position
     */

    message.style.left =
        `${Math.random() * 80 + 5}%`;

    message.style.top =
        `${Math.random() * 75 + 5}%`;


    /*
     * Random color
     */

    const colors = [
        "#ff6b81",
        "#ff9f43",
        "#a55eea",
        "#48dbfb",
        "#1dd1a1",
        "#f368e0",
        "#ffe66d"
    ];


    message.style.color =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];


    /*
     * Random size
     */

    message.style.fontSize =
        `${Math.random() * 7 + 14}px`;


    floatingMessages.appendChild(message);


    /*
     * Remove later
     */

    setTimeout(() => {

        message.remove();

    }, 4500);

}


/* =========================================================
   SPECIAL FINAL MESSAGE
   ========================================================= */

function createSpecialBirthdayMessage() {

    if (!floatingMessages) return;


    const message =
        document.createElement("div");

    message.className =
        "special-floating-message";


    message.innerHTML =
        "Happy Birthday to You,<br>" +
        "<strong>Dear Papa ❤️</strong>";


    message.style.left = "50%";

    message.style.top = "20%";

    floatingMessages.appendChild(message);


    setTimeout(() => {

        message.classList.add("visible");

    }, 100);


}


/* =========================================================
   MAKE A WISH BUTTON
   ========================================================= */

if (wishButton) {

    wishButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            makeWish();

        }
    );

}


/* =========================================================
   MAKE A WISH
   ========================================================= */

function makeWish() {

    /*
     * Button animation
     */

    wishButton.classList.add("wish-made");


    /*
     * Create heart particles
     */

    for (let i = 0; i < 25; i++) {

        setTimeout(() => {

            createHeartParticle();

        }, i * 50);

    }


    /*
     * Change button text
     */

    setTimeout(() => {

        wishButton.innerHTML =
            "✨ Your Wish Is Made ❤️";

    }, 400);

}


/* =========================================================
   HEART PARTICLES
   ========================================================= */

function createHeartParticle() {

    const heart =
        document.createElement("span");

    heart.className =
        "heart-particle";

    heart.innerHTML = "♥";


    heart.style.left =
        `${Math.random() * 100}%`;

    heart.style.top =
        `${60 + Math.random() * 30}%`;


    heart.style.setProperty(
        "--heart-x",
        `${Math.random() * 160 - 80}px`
    );


    heart.style.setProperty(
        "--heart-y",
        `${-(Math.random() * 220 + 80)}px`
    );


    document.body.appendChild(heart);


    setTimeout(() => {

        heart.remove();

    }, 2500);

}


/* =========================================================
   RANDOM FLOATING MESSAGE BURST
   ========================================================= */

function birthdayBurst() {

    for (let i = 0; i < 8; i++) {

        setTimeout(() => {

            createFloatingMessage();

        }, i * 150);

    }

}


/* =========================================================
   OPTIONAL KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /*
         * Space / Enter starts the experience
         */

        if (
            !started &&
            (
                event.code === "Space" ||
                event.code === "Enter"
            )
        ) {

            startBirthday();

        }

    }
);


/* =========================================================
   PREVENT DOUBLE CLICK ISSUES
   ========================================================= */

candles.forEach((candle) => {

    candle.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

        }
    );

});


/* =========================================================
   VISIBILITY HANDLING
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!birthdayMusic) return;


        if (document.hidden) {

            birthdayMusic.pause();

        } else if (started && !birthdayFinished) {

            birthdayMusic.play().catch(() => {});

        }

    }
);


/* =========================================================
   DEBUG HELPER
   ========================================================= */

window.blowCandle = blowCandle;