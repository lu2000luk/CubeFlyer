import { gsap } from "./gsap/index.js";
import { gaming } from "./mainmenu.js";

function sendAlert(text = "Error: check console for more information",  bypass_gamestate = false) {

    if (!bypass_gamestate && gaming) {
        return;
    }

    let alertBox = document.getElementById("alertBox");
    let alert = document.createElement("p");
    alert.className = "alert";
    alert.style.opacity = 0;
    alert.innerHTML = text;
    gsap.to(alert, { duration: 0.25, opacity: 1 });

    alertBox.appendChild(alert);
    setTimeout(() => {
        gsap.to(alert, { duration: 0.5, opacity: 0 });
    }, 4000);
    setTimeout(() => {
        alertBox.removeChild(alert);
    }, 4500);

    console.log(text);
}

export { sendAlert };