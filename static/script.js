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

}, TIMER_UPDATE * 1000);

const resetTimer = () => {
    const timer = document.getElementById('timer');
    timer.innerHTML = TIME_GIVEN + ":" + "00";
    timer.dataset.countdown = TIME_GIVEN * 60;
};

const score = async (event) => {
    event.preventDefault();
    // Get Wrong Answers
    const data = new FormData(event.target);
    const req = await fetch('/answers', { method: "post", body: data });
    const resp = await req.json();
    // Mark wrong answers
    Object.entries(resp).forEach(([key, ans]) => {
        document.getElementById(`${key}_answer`).innerHTML = ans;
        document.getElementById(`${key}`).className = "WrongAnswer";
    });
    // Scoring
    const table = Array.from(data.keys())
        .map(item => item.split("_"))
        .filter(items => items[1].length == 1);
    const topics = [...new Set(table.map(items => items[0]))];
    const letters = [...new Set(table.map(items => items[1]))];
    const topic_scores = {};
    const letter_scores = {};
    for (t of topics) {
        topic_scores[t] = 0;
        for (l of letters) {
            if (!Object.keys(resp).includes(`${t}_${l}`)) {
                topic_scores[t] += 1;
            }
        }
    }
    for (l of letters) {
        letter_scores[l] = 0;
        for (t of topics) {
            if (!Object.keys(resp).includes(`${t}_${l}`)) {
                letter_scores[l] += 1;
            }
        }
    }
    let total_score = 0;
    for (l of letters) {
        const score = letter_scores[l] ** 2;
        document.getElementById(`${l}_score`).innerHTML = score;
        total_score += score;
    }
    for (t of topics) {
        const score = topic_scores[t] ** 2;
        document.getElementById(`${t}_score`).innerHTML = score;
        total_score += score;
    }
    document.getElementById("total_score").innerHTML = total_score;
};

const factsForm = document.getElementById('factsForm');
factsForm.addEventListener("submit", score);