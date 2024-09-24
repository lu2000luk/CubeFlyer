import { gsap } from "./gsap/index.js";

function sendAlert(text = "Error: check console for more information") {
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
}

export { sendAlert };