// A: Click-to-Like with particle burst + count increment
const likeBtn1 = document.getElementById("likeBtn1");
const likeCount1 = document.getElementById("likeCount1");
const particles1 = document.getElementById("particles1");

let count1 = 0;

likeBtn1.addEventListener("click", () => {
  count1++;
  animateCount(likeCount1, count1);
  createParticles(particles1, likeBtn1);
});

function animateCount(element, newCount) {
  let current = parseInt(element.textContent, 10);
  const step = newCount > current ? 1 : -1;

  const interval = setInterval(() => {
    current += step;
    element.textContent = current;
    if (current === newCount) clearInterval(interval);
  }, 40);
}

function createParticles(container, button) {
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("span");
    particle.textContent = "✨";
    particle.style.position = "absolute";
    particle.style.left = button.offsetLeft + "px";
    particle.style.top = button.offsetTop + "px";
    particle.style.fontSize = "14px";
    particle.style.opacity = 1;
    container.appendChild(particle);

    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;

    particle.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
      ],
      { duration: 600, easing: "ease-out" }
    ).onfinish = () => particle.remove();
  }
}

// B: Long-press to like
const longPressBtn = document.getElementById("longPressBtn");
const progressBar = longPressBtn.querySelector(".progress");
const likeCount2 = document.getElementById("likeCount2");

let timer;
let progress = 0;
let count2 = 0;

function startHold() {
  progress = 0;
  progressBar.style.width = "0%";

  timer = setInterval(() => {
    progress += 10;
    progressBar.style.width = progress + "%";

    if (progress >= 100) {
      clearInterval(timer);
      confirmLike();
    }
  }, 100);
}

function endHold() {
  clearInterval(timer);
  progressBar.style.width = "0%";
}

function confirmLike() {
  longPressBtn.textContent = "❤️";
  count2++;
  animateCount(likeCount2, count2);
  progressBar.style.width = "0%";
}

// Desktop
longPressBtn.addEventListener("mousedown", startHold);
longPressBtn.addEventListener("mouseup", endHold);
longPressBtn.addEventListener("mouseleave", endHold);

// Mobile
longPressBtn.addEventListener("touchstart", startHold);
longPressBtn.addEventListener("touchend", endHold);
