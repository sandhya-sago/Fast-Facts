import random
from string import ascii_uppercase
from flask import Flask, jsonify, redirect, render_template, request, url_for
import csv
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from collections import defaultdict

app = Flask(__name__)
app.config["SECRET_KEY"] = "vikrams-fast-facts"

def clean_string(ipstr:str)->str:
    return " ".join(ipstr.lower().split()).capitalize()

fast_facts = "data/Fast Facts.xlsx - Sheet1.csv"
facts = defaultdict(lambda: defaultdict(str))
with open(fast_facts) as ff:
    data = csv.reader(ff)
    header = next(data)
    for line, alpha in zip(data, ascii_uppercase):
        for ans, topic in zip(line, header):
            if t := topic.strip():
                if ans.strip() == "-":
                    continue
                facts[t][alpha] = clean_string(ans)
all_topics = list(facts.keys())


@app.route("/")
def index():
    topics = random.sample(all_topics, k=5)
    letters = sorted(random.sample(ascii_uppercase, k=5))

    class FastFactsForm(FlaskForm):
        submit = SubmitField("Score")

    answers = defaultdict(lambda: defaultdict(str))
    for t in topics:
        for l in letters:
            label = f"{t}_{l}"
            field = StringField(label)
            setattr(FastFactsForm, label, field)
            answers[t][l] = facts[t][l]

    form = FastFactsForm()

    return render_template(
        "index.html", topics=topics, letters=letters, form=form, answers=answers
    )


@app.route("/reset")
def reset():
    redirect(url_for("index"))

@app.route("/answers", methods=["POST"])
def check_answers():
    answers = request.form
    expected = defaultdict(lambda: defaultdict(str))
    for item, ans in answers.items():
        if item == 'csrf_token':
            continue
        t, l = item.rsplit("_")
        if clean_string(ans) != facts[t][l]:
            expected[item] = facts[t][l]
    return jsonify(expected), 200


app.run(host="127.0.0.1", port="5500", debug=True)
