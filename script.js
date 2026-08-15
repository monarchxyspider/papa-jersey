// ==========================================
// PAPA'S BIRTHDAY WEBSITE
// script.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const cake = document.querySelector(".cake");
    const candles = document.querySelectorAll(".candle");
    const birthdaySound = document.getElementById("birthdaySound");

    const finalMessage = document.querySelector(".final-message");
    const finalTitle = document.querySelector(".final-title");
    const finalText = document.querySelector(".final-text");

    // ==========================================
    // SETTINGS
    // ==========================================

    let candlesBlown = 0;
    let celebrationStarted = false;

    const birthdayMessages = [
        "Happy Birthday Dear Papa ❤️",
        "Happy Birthday To You Papa 🎂",
        "Love You Papa ❤️",
        "Our Greatest Blessing ✨",
        "May Allah Always Keep You Happy 🤍",
        "Best Papa Ever ❤️",
        "May Allah Bless You Always ✨"
    ];

    // ==========================================
    // CAKE LAYER ANIMATION
    // ==========================================

    function buildCake() {

        if (!cake) return;

        const layers = cake.querySelectorAll(".cake-layer");

        layers.forEach((layer, index) => {

            layer.style.opacity = "0";
            layer.style.transform = "translateY(40px) scale(.8)";

            setTimeout(() => {

                layer.style.transition =
                    "all 0.8s cubic-bezier(.2,.8,.2,1)";

                layer.style.opacity = "1";
                layer.style.transform =
                    "translateY(0) scale(1)";

            }, 700 + (index * 700));

        });
    }

    // Start cake animation
    buildCake();


    // ==========================================
    // CANDLE CLICK
    // ==========================================

    candles.forEach(candle => {

        candle.addEventListener("click", () => {

            // Already blown
            if (candle.classList.contains("blown")) {
                return;
            }

            candle.classList.add("blown");

            candlesBlown++;

            // Flame
            const flame =
                candle.querySelector(".flame");

            if (flame) {

                flame.style.animation =
                    "flameOut .5s forwards";

            }

            // Small smoke effect
            createSmoke(candle);

            // Check all candles
            if (candlesBlown >= candles.length) {

                startCelebration();

            }

        });

    });


    // ==========================================
    // SMOKE EFFECT
    // ==========================================

    function createSmoke(candle) {

        const smoke =
            document.createElement("div");

        smoke.className = "candle-smoke";

        candle.appendChild(smoke);

        setTimeout(() => {
            smoke.remove();
        }, 2000);

    }


    // ==========================================
    // CELEBRATION
    // ==========================================

    function startCelebration() {

        if (celebrationStarted) return;

        celebrationStarted = true;

        // Play birthday sound
        playBirthdaySound();

        // Confetti
        createConfetti();

        // Hearts
        createHearts(20);

        // Balloons
        createBalloons(12);

        // Sparkles
        createSparkles(30);

        // Random birthday messages
        startFloatingMessages();

        // Final message
        setTimeout(() => {

            showFinalMessage();

        }, 2500);

    }


    // ==========================================
    // SOUND
    // ==========================================

    function playBirthdaySound() {

        if (!birthdaySound) return;

        birthdaySound.currentTime = 0;

        birthdaySound.play().catch(() => {

            console.log(
                "Audio requires user interaction."
            );

        });

    }


    // ==========================================
    // CONFETTI
    // ==========================================

    function createConfetti() {

        const colors = [
            "#ff4d6d",
            "#ffd166",
            "#06d6a0",
            "#4dabf7",
            "#c77dff",
            "#ffffff"
        ];

        for (let i = 0; i < 100; i++) {

            const piece =
                document.createElement("div");

            piece.className = "confetti";

            piece.style.left =
                Math.random() * 100 + "vw";

            piece.style.background =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];

            piece.style.animationDuration =
                (2 + Math.random() * 3) + "s";

            piece.style.animationDelay =
                Math.random() * .8 + "s";

            piece.style.transform =
                `rotate(${Math.random() * 360}deg)`;

            document.body.appendChild(piece);

            setTimeout(() => {

                piece.remove();

            }, 5500);

        }

    }


    // ==========================================
    // FLOATING HEARTS
    // ==========================================

    function createHearts(amount) {

        for (let i = 0; i < amount; i++) {

            setTimeout(() => {

                const heart =
                    document.createElement("div");

                heart.className =
                    "floating-heart";

                heart.innerHTML = "❤️";

                heart.style.left =
                    Math.random() * 100 + "vw";

                heart.style.fontSize =
                    (15 + Math.random() * 25) + "px";

                heart.style.animationDuration =
                    (4 + Math.random() * 4) + "s";

                document.body.appendChild(heart);

                setTimeout(() => {

                    heart.remove();

                }, 8000);

            }, i * 150);

        }

    }


    // ==========================================
    // BALLOONS
    // ==========================================

    function createBalloons(amount) {

        const colors = [
            "#ff4d6d",
            "#ffd166",
            "#06d6a0",
            "#4dabf7",
            "#c77dff"
        ];

        for (let i = 0; i < amount; i++) {

            const balloon =
                document.createElement("div");

            balloon.className =
                "birthday-balloon";

            balloon.innerHTML = "🎈";

            balloon.style.left =
                Math.random() * 95 + "vw";

            balloon.style.fontSize =
                (35 + Math.random() * 30) + "px";

            balloon.style.animationDuration =
                (5 + Math.random() * 5) + "s";

            balloon.style.animationDelay =
                Math.random() * 2 + "s";

            document.body.appendChild(balloon);

            setTimeout(() => {

                balloon.remove();

            }, 11000);

        }

    }


    // ==========================================
    // SPARKLES
    // ==========================================

    function createSparkles(amount) {

        for (let i = 0; i < amount; i++) {

            setTimeout(() => {

                const sparkle =
                    document.createElement("div");

                sparkle.className =
                    "birthday-sparkle";

                sparkle.innerHTML = "✨";

                sparkle.style.left =
                    Math.random() * 100 + "vw";

                sparkle.style.top =
                    Math.random() * 100 + "vh";

                sparkle.style.fontSize =
                    (12 + Math.random() * 20) + "px";

                sparkle.style.animationDuration =
                    (1 + Math.random() * 2) + "s";

                document.body.appendChild(sparkle);

                setTimeout(() => {

                    sparkle.remove();

                }, 3000);

            }, i * 100);

        }

    }


    // ==========================================
    // RANDOM BIRTHDAY TEXT
    // ==========================================

    function startFloatingMessages() {

        let count = 0;

        const interval =
            setInterval(() => {

                createBirthdayMessage();

                count++;

                if (count >= 15) {

                    clearInterval(interval);

                }

            }, 700);

    }


    function createBirthdayMessage() {

        const message =
            document.createElement("div");

        message.className =
            "random-birthday-message";

        message.textContent =
            birthdayMessages[
                Math.floor(
                    Math.random() *
                    birthdayMessages.length
                )
            ];

        message.style.left =
            (5 + Math.random() * 80) + "vw";

        message.style.top =
            (10 + Math.random() * 75) + "vh";

        message.style.transform =
            `rotate(${(-8 + Math.random() * 16)}deg)`;

        document.body.appendChild(message);

        setTimeout(() => {

            message.remove();

        }, 4500);

    }


    // ==========================================
    // FINAL MESSAGE
    // ==========================================

    function showFinalMessage() {

        if (!finalMessage) return;

        finalMessage.classList.add("show");

        // Title
        if (finalTitle) {

            typeText(
                finalTitle,
                "🎉 HAPPY BIRTHDAY PAPA 🎉",
                100
            );

        }

        // Paragraph
        if (finalText) {

            setTimeout(() => {

                typeText(
                    finalText,
                    "Papa, aap hamari zindagi ki woh khoobsurat dua hain jiska shukar hum har din Allah se karte hain. Allah aapko hamesha khush, sehatmand aur salamat rakhe. ❤️",
                    45
                );

            }, 1800);

        }

    }


    // ==========================================
    // LETTER BY LETTER
    // ==========================================

    function typeText(element, text, speed) {

        element.textContent = "";

        let index = 0;

        const timer =
            setInterval(() => {

                element.textContent +=
                    text[index];

                index++;

                if (index >= text.length) {

                    clearInterval(timer);

                }

            }, speed);

    }


    // ==========================================
    // OPTIONAL MANUAL CELEBRATION
    // ==========================================

    // Agar HTML mein button ho:
    // <button id="celebrateButton">Celebrate</button>

    const celebrateButton =
        document.getElementById(
            "celebrateButton"
        );

    if (celebrateButton) {

        celebrateButton.addEventListener(
            "click",
            startCelebration
        );

    }

});