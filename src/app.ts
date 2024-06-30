import "../css/reset.css";
import "../css/style.css";

import { quizSettings } from "../util/types";
import {
  setSettings,
  loadSettings,
  saveUserSettings,
  saveScore,
} from "../util/localStorag";
import { getData } from "../util/api";

type QuizUi = {
  question: string;
  category: string;
  answers: string[];
  correct_answers: string[];
  selectedAnswer: [];
};

let quizUi: QuizUi = {
  question: "",
  category: "",
  answers: [],
  correct_answers: [],
  selectedAnswer: [],
};

let arrayQuizSetting: any = [];
let remainingTime = 10;

const numberQues = document.getElementById("numberQues") as HTMLSelectElement;

for (let i = 1; i <= 20; i++) {
  let option = document.createElement("option");
  option.value = `${i}`;
  option.textContent = `${i}`;
  numberQues.appendChild(option);
}

const difficultySelect = document.getElementById(
  "difficulty"
) as HTMLSelectElement;
const categorySelect = document.getElementById("category") as HTMLSelectElement;
const numberSelect = document.getElementById("numberQues") as HTMLInputElement;

// de opgeslagen instellingen op te halen
difficultySelect.value = loadSettings().difficulty;
categorySelect.value = loadSettings().category;
numberSelect.value = loadSettings().numQuestions;

let category = document.querySelector("#category p");
let questionText = document.getElementById("questionText");

//start
const startQuizButton = document.getElementById("startQuiz");

startQuizButton?.addEventListener("click", async () => {
  const userNameInput = document.querySelector(".nameUser") as HTMLInputElement;
  const userNameText = userNameInput.value;
  saveUserSettings(userNameText);

  const settings = document.getElementById("settings");
  const quiz = document.getElementById("quiz");
  quizSettings.difficulty = difficultySelect.value;
  quizSettings.category = categorySelect.value;
  quizSettings.numQuestions = numberSelect.value;

  setSettings(quizSettings);

  const data = await getData(
    categorySelect.value,
    difficultySelect.value,
    numberSelect.value
  );

  data.forEach((element: any) => {
    quizUi = {
      question: element.question,
      category: element.category,
      answers: element.answers,
      correct_answers: element.correct_answers,
      selectedAnswer: [],
    };
    arrayQuizSetting.push(quizUi);
  });
  //test
  if (category) category.textContent = categorySelect.value;
  if (settings) settings.style.display = "none";
  if (quiz) quiz.style.display = "block";
  SetQuiz();
});

const prev = document.getElementById("prev") as HTMLButtonElement;
const end = document.getElementById("end");
const next = document.getElementById("next") as HTMLButtonElement;
const answers = document.querySelector("#answers ul");

let currentQuestionIndex = 0;

const SetQuiz = () => {
  startQuestionTimer();
  prev.textContent = `Previous Question`;

  if (prev) {
    prev.disabled = currentQuestionIndex === 0;
  }
  if (next) {
    next.disabled = currentQuestionIndex === arrayQuizSetting.length - 1;
  }
  //begin: eerste vraag
  const currentQuestion = arrayQuizSetting[currentQuestionIndex];

  if (questionText) questionText.textContent = currentQuestion.question;

  // see the number of the question
  const questionNumber = document.getElementById("questionNumber");
  if (questionNumber)
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${
      arrayQuizSetting.length
    }`;

  // om bij de starten van de quiz de antwoorden van de vorige te verwijderen
  if (answers) answers.textContent = "";
  let multipleAnswers = document.querySelector(
    ".multipleAnswers"
  ) as HTMLElement;
  let countAnswers = 0;
  for (const key in currentQuestion.correct_answers) {
    if (currentQuestion.correct_answers[key] == "true") {
      countAnswers++;
    }
    multipleAnswers.textContent =
      countAnswers >= 2 ? "There are several possible answers" : "";
  }

  const answer = currentQuestion.answers;
  for (const key in answer) {
    const value = answer[key];

    let liAnswers = document.createElement("li");
    liAnswers.classList.add("liAnswers");

    let p = document.createElement("p2");
    p.classList.add("value-answers");
    p.textContent = value;
    liAnswers.appendChild(p);

    liAnswers.addEventListener("click", () => {
      if (!currentQuestion.selectedAnswer.includes(key)) {
        currentQuestion.selectedAnswer.push(key);
        liAnswers.classList.add("selected");
      } else {
        currentQuestion.selectedAnswer = currentQuestion.selectedAnswer.filter(
          (item: any) => item !== key
        );
        liAnswers.classList.remove("selected");
      }
    });

    if (key === currentQuestion.selectedAnswer) {
      liAnswers.classList.add("selected");
    }

    if (value != null) {
      answers?.appendChild(liAnswers);
    }
  }
};

let questionTimer: any;
function updateTimerLayout(time: number) {
  const timerText = document.getElementById("timerText");
  if (timerText) timerText.textContent = `Time:${time}`;
}

function startQuestionTimer() {
  clearInterval(questionTimer);
  remainingTime = 10;
  updateTimerLayout(remainingTime);
  questionTimer = setInterval(() => {
    remainingTime--;
    updateTimerLayout(remainingTime);
    if (remainingTime < 1) {
      clearInterval(questionTimer);
      if (currentQuestionIndex === arrayQuizSetting.length - 1) {
        if (end) {
          end.click();
        }
      } else {
        moveToNextQuestion();
      }
    }
  }, 1000);
}
// move to next question if we are not at the end of the quiz
function moveToNextQuestion() {
  if (currentQuestionIndex < arrayQuizSetting.length - 1) {
    currentQuestionIndex++;
    SetQuiz();
  }
}

prev?.addEventListener("click", () => {
  if (currentQuestionIndex >= 0) {
    currentQuestionIndex--;
    SetQuiz();
  }
  startQuestionTimer();
});

next?.addEventListener("click", () => {
  if (currentQuestionIndex < arrayQuizSetting.length - 1) {
    currentQuestionIndex++;
    SetQuiz();
  }
  startQuestionTimer();
});

end?.addEventListener("click", () => {
  const quiz = document.getElementById("quiz");
  const totalQuestions = arrayQuizSetting.length;

  const correctAnswers = arrayQuizSetting.filter((question: any) => {
    if (question.selectedAnswer.length === 0) {
      return false;
    } else {
      let allSelectedCorrect = question.selectedAnswer.every((answer: any) => {
        return question.correct_answers[`${answer}_correct`] === "true";
      });
      return allSelectedCorrect;
    }
  }).length;

  let score = (correctAnswers / totalQuestions) * 100;
  score = Math.round(score);
  let userNameInput = document.querySelector(".nameUser") as HTMLInputElement;
  saveScore(score, userNameInput.value);

  const result = document.getElementById("result");
  const scoreValue = document.getElementById("scoreValue");
  if (scoreValue && result) {
    if (quiz) quiz.style.display = "none";
    result.style.display = "block";
    scoreValue.textContent = `${score}%`;
  }
  clearTimeout(questionTimer);

  const yourAnswersList = document.getElementById("answers_list");
  arrayQuizSetting.forEach((q: any) => {
    let bodyEnd = document.getElementById("body");
    const listQuesAndAnswersEnd = document.createElement("div");
    listQuesAndAnswersEnd.classList.add("listQuesAndAnswersEnd");
    // remove body id and instead another id
    bodyEnd?.removeAttribute("id");
    bodyEnd?.setAttribute("id", "bodyEnd");
    const answersListEnd = document.createElement("ul");
    //answer that are not null
    for (const i in q.answers) {
      if (q.answers[i] !== null) {
        const answerItem = document.createElement("li");
        answerItem.textContent = q.answers[i];

        q.selectedAnswer.forEach((element: any) => {
          if (i == element) {
            answerItem.classList.add("selectedAnswerEnd");
            if (q.correct_answers[`${element}_correct`] === "true") {
              const correctAnswer = document.createElement("span");
              correctAnswer.classList.add("correctAnswer");
              answerItem.style.border = "4px green solid";
              answerItem.style.color = "green";
              correctAnswer.textContent = "            'CORRECT ANSWER'";
              answerItem.appendChild(correctAnswer);
            } else {
              const wrongAnswer = document.createElement("span");
              wrongAnswer.classList.add("wrongAnswer");
              answerItem.style.border = "4px red solid";
              answerItem.style.color = "red";
              wrongAnswer.textContent = "            'WRONG ANSWER'";
              answerItem.appendChild(wrongAnswer);
            }
          }
        });
        //not selected
        if (q.correct_answers[`${i}_correct`] === "true") {
          answerItem.style.color = "green";
          answerItem.style.borderRadius = "5px";
        } else {
          answerItem.style.color = "red";
          answerItem.style.borderRadius = "5px";
        }
        answersListEnd.appendChild(answerItem);
      }
    }
    let hehresult = document.querySelector(".hehresult");
    let p2 = document.createElement("p");
    p2.classList.add("p");
    let uniqueScores = new Set();

    if (!uniqueScores.has(score)) {
      hehresult?.appendChild(p2);
      uniqueScores.add(score);
    }

    let h2Result = document.getElementById("h2Result");
    let containerResultEnd = document.getElementById("containerResultEnd");

    if (h2Result) h2Result.textContent = `Your result ${userNameInput.value}!`;
    if (containerResultEnd)
      containerResultEnd.textContent = `Your Score ${score}!`;

    //show question
    let h2 = document.createElement("h2");
    h2.textContent = q.question;
    listQuesAndAnswersEnd.appendChild(h2);
    listQuesAndAnswersEnd.appendChild(answersListEnd);
    yourAnswersList?.appendChild(listQuesAndAnswersEnd);
  });

  let resultValue = document.querySelector(".p") as HTMLElement;
  if (score < 50) {
    resultValue.textContent = "You can do better!";
  }
  if (score >= 50) {
    resultValue.textContent = "Good job!";
  }
});

const restart = document.getElementById("restart");

restart?.addEventListener("click", () => {
  //remove bodyend id and instead another id
  let bodyEnd = document.getElementById("bodyEnd");
  bodyEnd?.removeAttribute("id");
  bodyEnd?.setAttribute("id", "body");

  const settings = document.getElementById("settings");
  const result = document.getElementById("result");
  let body = document.getElementById("body");
  body?.setAttribute("id", "body");

  if (settings) settings.style.display = "flex";
  if (result) result.style.display = "none";
  //clear the array of the quiz settings and the current question index to start the quiz again
  arrayQuizSetting.forEach((element: any) => (element.selectedAnswer = []));
  arrayQuizSetting = [];

  currentQuestionIndex = 0;
  let answersListRemove = document.getElementById("answers_list");
  if (answersListRemove) {
    answersListRemove.innerHTML = "";
  }
  let p2 = document.querySelector(".p2");
  if (p2) {
    p2.innerHTML = "";
  }
});
