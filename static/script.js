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

const resetTimer = (time_given) => {
    const timer = document.getElementById('timer');
    timer.innerHTML = time_given + ":" + "00";
    timer.dataset.countdown = time_given * 60;
};

async function score(event) {
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
        .filter(items => items[1]?.length == 1);
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
    updateTotalScore({ letter_scores, topic_scores });
    // Enable overriding of score
    for (t of topics) {
        for (l of letters) {
            const checkBox = document.getElementById(`${t}_${l}_check`);
            checkBox.style.display = "inline";
            if (!Object.keys(resp).includes(`${t}_${l}`)) {
                checkBox.checked = true;
            }
        }
    }
}

const factsForm = document.getElementById('factsForm');
factsForm.addEventListener("submit", score);

const toggleAnswer = (checkBox) => {
    // const factsForm = document.getElementById('factsForm');
    const totalElem = document.getElementById("total_score");
    const { letter_scores, topic_scores } = JSON.parse(totalElem.dataset.scores);
    const matches = checkBox.id.match(/(.+)_(\w)_check/);
    const l = matches[2];
    const t = matches[1];
    if (checkBox.checked) {
        letter_scores[l] += 1;
        topic_scores[t] += 1;
    } else {
        letter_scores[l] -= 1;
        topic_scores[t] -= 1;
    }
    document.getElementById(`${l}_score`).innerHTML = letter_scores[l] ** 2;
    document.getElementById(`${t}_score`).innerHTML = topic_scores[t] ** 2;
    updateTotalScore({ letter_scores, topic_scores });
};

function updateTotalScore({ letter_scores, topic_scores }) {
    let total_score = 0;
    Object.entries(letter_scores).forEach(([l, s]) => {
        const score = s ** 2;
        document.getElementById(`${l}_score`).innerHTML = score;
        total_score += score;
    });
    Object.entries(topic_scores).forEach(([t, s]) => {
        const score = s ** 2;
        document.getElementById(`${t}_score`).innerHTML = score;
        total_score += score;
    });
    const totalElem = document.getElementById("total_score");
    totalElem.innerHTML = total_score;
    totalElem.dataset.scores = JSON.stringify({ letter_scores, topic_scores });
}
