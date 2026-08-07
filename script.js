const text = document.getElementById("text");
const message = document.querySelector(".message");

const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");


const noMessages = [
    "Papa plij soch lo na 🥺❤️",
    "Sirf ek football jersey chahiye ⚽🥹",
    "Acha Papa last time pooch raha hoon 😭❤️"
];

let noClicks = 0;
let yesScale = 1;



noBtn.addEventListener("click", () => {

    noClicks++;

    // Yes button grows
    yesScale += 0.12;
    yesBtn.style.transform = `scale(${yesScale})`;


    if(noClicks <= 3){

        text.innerHTML = noMessages[noClicks - 1];

        message.innerHTML = 
        "Papa aap duniya ke sab se ache papa ho ❤️";


        // No button moves
        noBtn.style.position = "fixed";

        let maxX = window.innerWidth - noBtn.offsetWidth - 20;
        let maxY = window.innerHeight - noBtn.offsetHeight - 20;

        let randomX = Math.random() * maxX;
        let randomY = Math.random() * maxY;


        noBtn.style.left = randomX + "px";
        noBtn.style.top = randomY + "px";

    }


    else{

        text.innerHTML =
        "Papa 🥺❤️<br>Aap mana nahi kar sakte";


        message.innerHTML =
        "Aap mere favourite Papa ho 🌸";


        noBtn.style.position = "static";
        noBtn.style.transform = "scale(1)";

        noBtn.innerHTML = "Theek hai Papa ❤️";

    }

});





yesBtn.addEventListener("click", () => {


document.body.innerHTML = `

<div class="success">

    <div class="big-heart">
        ❤️
    </div>


    <h1>
        Thank You Papa 🥹❤️
    </h1>


    <h2>
        Aap duniya ke sab se ache Papa ho 🌎
    </h2>


    <p>
        Football Jersey ke liye bohot bohot shukriya ⚽🎉
    </p>


    <div class="celebrate">
        🎊 ⚽ 🎉 ❤️ 🥳
    </div>


</div>

`;


});