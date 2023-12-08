const TIME_GIVEN = 5; // Min
const TIMER_UPDATE = 1;  // Sec


window.setInterval(() => {

    const timer = document.getElementById('timer');
    const countdown = timer.dataset.countdown;
    const timeLeft = parseInt(countdown) - TIMER_UPDATE;
    const sign = (timeLeft < 0) ? '-' : '';
    const absTimeLeft = Math.abs(timeLeft);
    const result = sign + parseInt(absTimeLeft / 60) + ':' + String(absTimeLeft % 60).padStart(2, '0');
    timer.innerHTML = result;
    timer.dataset.countdown = timeLeft;

}, TIMER_UPDATE * 100);

const resetTimer = () => {
    const timer = document.getElementById('timer');
    timer.innerHTML = TIME_GIVEN + ":" + "00";
    timer.dataset.countdown = TIME_GIVEN * 60;
};

const checkAnswers = async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const req = await fetch('/answers', { method: "post", body: data });
    const resp = await req.json();
    Object.entries(resp).forEach(([key, ans]) => { const ansElm = document.getElementById(`${key}_answer`); ansElm.innerHTML = ans; });
    console.log(resp);

};

const factsForm = document.getElementById('factsForm');
factsForm.addEventListener("submit", checkAnswers);