const text = document.getElementById("text");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");

const messages = [
    "Papa plij 🥺",
    "Sirf aik football jersey 😭",
    "Papa please please 🥹",
    "Best Papa ban jao ❤️",
    "Ab to maan jao 😭",
    "Akhri baar pooch raha hoon 🥺",
    "No mat bolo 😭",
    "Papa ap bohot ache ho ❤️",
    "Bas aik hi jersey chahiye 🥹",
    "Pleaseeeeeee 😭❤️"
];

let index = 0;
let yesScale = 1;
let noScale = 1;

noBtn.addEventListener("click", () => {

    text.innerHTML = messages[index % messages.length];
    index++;

    yesScale += 0.15;
    noScale -= 0.08;

    yesBtn.style.transform = `scale(${yesScale})`;

    if(noScale > 0.25){
        noBtn.style.transform = `scale(${noScale})`;
    }

    // No button bhaagne lage 😂
    if(index >= 6){
        noBtn.style.position = "absolute";
        noBtn.style.left = Math.random() * (window.innerWidth - 100) + "px";
        noBtn.style.top = Math.random() * (window.innerHeight - 60) + "px";
    }
});

yesBtn.addEventListener("click", () => {

    document.body.innerHTML = `
    <div style="
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        height:100vh;
        background:linear-gradient(135deg,#43cea2,#185a9d);
        color:white;
        text-align:center;
        font-family:Arial;
        padding:20px;
    ">
        <h1 style="font-size:60px;">🎉 Hurrah!! 🎉</h1>

        <h2 style="margin-top:20px;">
            Thank You Papa ❤️
        </h2>

        <p style="font-size:24px;margin-top:15px;">
            You're The Best Papa In The World 🥹❤️
        </p>

        <p style="margin-top:20px;font-size:20px;">
            Ab Football Jersey mil gayi!! ⚽🥳
        </p>

        <div style="font-size:70px;margin-top:30px;">
            🎉🎊❤️⚽🎉
        </div>
    </div>
    `;
});