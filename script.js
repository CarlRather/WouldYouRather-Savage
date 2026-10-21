
const $ = id => document.getElementById(id);

const defaultQuestions = [
  { c:"Funny", q:"Would you rather...", a:"Have your search history shown to your class", b:"Have your gallery projected on the classroom TV" },
  { c:"Funny", q:"Would you rather...", a:"Laugh like a broken car engine", b:"Sneeze like a Minecraft villager" },
  { c:"Funny", q:"Would you rather...", a:"Have 1% battery forever", b:"Have Wi-Fi that disconnects every 30 seconds" },
  { c:"Funny", q:"Would you rather...", a:"Accidentally like a 3-year-old post", b:"Send a screenshot to the person you're talking about" },
  { c:"Funny", q:"Would you rather...", a:"Speak only in memes for a day", b:"End every sentence with 'bro' for a week" },
  { c:"Funny", q:"Would you rather...", a:"Have your alarm play at full volume in class", b:"Have your phone autocorrect 'yes' to 'skill issue'" },
  { c:"Funny", q:"Would you rather...", a:"Trip while walking into school", b:"Wave back at someone who wasn't waving at you" },
  { c:"Funny", q:"Would you rather...", a:"Have hiccups during every serious moment", b:"Have your stomach make boss-fight sounds in silence" },
  { c:"Funny", q:"Would you rather...", a:"Forget why you entered a room", b:"Forget what you were saying mid-sentence" },
  { c:"Funny", q:"Would you rather...", a:"Have your pet judge every decision", b:"Have a narrator explain every embarrassing moment" },

  { c:"Gaming", q:"Would you rather...", a:"Play at 5 FPS forever", b:"Have 999 ping in every match" },
  { c:"Gaming", q:"Would you rather...", a:"Lose your best gear to lag", b:"Lose a fight because you pressed the wrong button" },
  { c:"Gaming", q:"Would you rather...", a:"Have no sprint button", b:"Have your jump button work only sometimes" },
  { c:"Gaming", q:"Would you rather...", a:"Fight a pro with wooden gear", b:"Fight a beginner with max gear and plot armor" },
  { c:"Gaming", q:"Would you rather...", a:"Lose every ranked match by one point", b:"Win every match but get zero credit" },
  { c:"Gaming", q:"Would you rather...", a:"Have your teammate steal every item", b:"Have your teammate blame you for every loss" },
  { c:"Gaming", q:"Would you rather...", a:"Have your game crash at the final boss", b:"Beat the boss and forget to save" },
  { c:"Gaming", q:"Would you rather...", a:"Have perfect aim but terrible movement", b:"Have perfect movement but terrible aim" },

  { c:"Anime", q:"Would you rather...", a:"Train for 1,000 years with no powers", b:"Get a legendary power but a tutorial that never ends" },
  { c:"Anime", q:"Would you rather...", a:"Be the overpowered protagonist", b:"Be the mysterious side character everyone loves" },
  { c:"Anime", q:"Would you rather...", a:"Have the strongest ability with a ridiculous name", b:"Have a weak ability with infinite plot armor" },
  { c:"Anime", q:"Would you rather...", a:"Live in a world full of demons", b:"Live in a world where every villain gets a tragic backstory" },
  { c:"Anime", q:"Would you rather...", a:"Know every spoiler before watching", b:"Wait five years for your favorite anime sequel" },
  { c:"Anime", q:"Would you rather...", a:"Have a 100-episode training arc", b:"Win instantly but never get a cool fight scene" },
  { c:"Anime", q:"Would you rather...", a:"Be a hero with no fans", b:"Be a villain with the best character design" },
  { c:"Anime", q:"Would you rather...", a:"Get isekai'd with no special ability", b:"Stay here but unlock an anime-style skill tree" },

  { c:"Difficult", q:"Would you rather...", a:"Always know when someone is lying", b:"Always know what people really think of you" },
  { c:"Difficult", q:"Would you rather...", a:"Redo one mistake from your past", b:"See one major event from your future" },
  { c:"Difficult", q:"Would you rather...", a:"Be famous but have no privacy", b:"Be unknown but have complete freedom" },
  { c:"Difficult", q:"Would you rather...", a:"Master one skill instantly", b:"Become pretty good at every skill" },
  { c:"Difficult", q:"Would you rather...", a:"Always tell the truth", b:"Never be able to explain yourself" },
  { c:"Difficult", q:"Would you rather...", a:"Have unlimited time but average money", b:"Have unlimited money but limited free time" },
  { c:"Difficult", q:"Would you rather...", a:"Forget every embarrassing memory", b:"Remember every happy moment perfectly" },
  { c:"Difficult", q:"Would you rather...", a:"Be able to pause time for 10 seconds daily", b:"Rewind time by 10 seconds once daily" }
];

const roastLines = [
  "That choice had more plot holes than a rushed anime finale. 💀",
  "Bro made a decision with 2% battery and 0% strategy.",
  "The council has reviewed your choice. The council is confused.",
  "Bold move. Absolutely questionable, but bold.",
  "Your brain really opened 47 tabs and picked THAT?",
  "Not gonna lie, that answer has side-character energy. 😭",
  "The confidence is legendary. The reasoning is missing.",
  "Even the loading screen needed more time to decide.",
  "You didn't choose the lesser evil. You downloaded the premium evil.",
  "Respectfully, your decision-making needs a software update.",
  "This choice is sponsored by pure chaos.",
  "You cooked. Unfortunately, the kitchen is now on fire.",
  "The logic left the chat, but the confidence stayed.",
  "That's not a red flag. That's the entire warning screen.",
  "Your future self just sent a disappointed emoji."
];

const stored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

let customQuestions = stored("wyrCustom", []);
let stats = stored("wyrStats", { played:0, A:0, B:0 });
let questions = [];
let index = 0;
let selected = false;
let seconds = 15;
let timerId = null;
let sessionCount = 10;
let currentQuestion = null;
let deferredInstall = null;

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The game still works for the current session.
  }
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function updateStats() {
  $("totalPlayed").textContent = stats.played;
  $("totalA").textContent = stats.A;
  $("totalB").textContent = stats.B;
}

function stopTimer() {
  if (timerId !== null) clearInterval(timerId);
  timerId = null;
}

function startGame() {
  stopTimer();

  const nickname = $("nickname").value.trim() || "Certified NPC";
  const category = $("category").value;
  sessionCount = Number($("count").value);
  seconds = Number($("timer").value);

  const pool = [...defaultQuestions, ...customQuestions];
  const filtered = category === "Random"
    ? pool
    : pool.filter(item => item.c === category);

  questions = shuffle(filtered).slice(0, sessionCount);
  index = 0;

  if (!questions.length) {
    alert("No questions found for this category yet!");
    return;
  }

  $("setup").classList.add("hidden");
  $("customPanel").classList.add("hidden");
  $("statsPanel").classList.add("hidden");
  $("game").classList.remove("hidden");

  $("quitBtn").textContent = "Quit game";
  $("nextBtn").classList.add("hidden");
  $("installBtn").classList.add("hidden");

  $("round").textContent = `${nickname} • ROUND 1 / ${questions.length}`;
  showQuestion();
}

function showQuestion() {
  stopTimer();
  selected = false;
  currentQuestion = questions[index];

  $("round").textContent = `ROUND ${index + 1} / ${questions.length}`;
  $("progressFill").style.width =
    `${(index / questions.length) * 100}%`;

  $("questionCategory").textContent = currentQuestion.c.toUpperCase();
  $("questionText").textContent = currentQuestion.q;
  $("optionA").textContent = currentQuestion.a;
  $("optionB").textContent = currentQuestion.b;

  document.querySelectorAll(".choice").forEach(button => {
    button.disabled = false;
    button.classList.remove("selected");
  });

  $("result").classList.add("hidden");
  $("nextBtn").classList.add("hidden");

  if (seconds === 0) {
    $("timerText").textContent = "⏱️ NO TIMER";
    return;
  }

  let remaining = seconds;
  $("timerText").textContent = `⏱️ ${remaining}s`;

  timerId = setInterval(() => {
    remaining--;
    $("timerText").textContent = `⏱️ ${remaining}s`;

    if (remaining <= 0) {
      stopTimer();
      if (!selected) choose(null);
    }
  }, 1000);
}

function choose(choice) {
  if (selected) return;

  selected = true;
  stopTimer();

  document.querySelectorAll(".choice").forEach(button => {
    button.disabled = true;
    if (button.dataset.choice === choice) {
      button.classList.add("selected");
    }
  });

  if (choice) {
    stats.played++;
    stats[choice]++;
    save("wyrStats", stats);
    updateStats();

    $("resultTitle").textContent = `YOU PICKED ${choice}!`;
    $("resultText").textContent =
      `Your choice: ${choice === "A" ? currentQuestion.a : currentQuestion.b}`;
    $("roastText").textContent =
      roastLines[Math.floor(Math.random() * roastLines.length)];
  } else {
    $("resultTitle").textContent = "TIME'S UP! 💀";
    $("resultText").textContent = "You took so long, even the question got bored.";
    $("roastText").textContent = "Decision speed: Internet Explorer.";
  }

  $("result").classList.remove("hidden");
  $("nextBtn").classList.remove("hidden");
  $("nextBtn").textContent =
    index === questions.length - 1 ? "SEE MY RESULTS 🏆" : "NEXT ROUND ➜";
}

function nextQuestion() {
  index++;

  if (index >= questions.length) {
    finishGame();
    return;
  }

  showQuestion();
}

function finishGame() {
  stopTimer();

  $("progressFill").style.width = "100%";
  $("questionCategory").textContent = "SESSION COMPLETE";
  $("questionText").textContent = "YOU SURVIVED THE CHAOS 🏆";
  $("optionA").textContent = `Total choices ever: ${stats.played}`;
  $("optionB").textContent = `A: ${stats.A} • B: ${stats.B}`;

  document.querySelectorAll(".choice").forEach(button => {
    button.disabled = true;
    button.classList.remove("selected");
  });

  $("timerText").textContent = "GG!";
  $("result").classList.remove("hidden");
  $("resultTitle").textContent = "FINAL ROAST 💀";
  $("resultText").textContent =
    `You finished ${questions.length} questions. Your decisions have been recorded locally.`;
  $("roastText").textContent =
    "The game is over. Your questionable choices are forever... unless you clear your data. 😭";

  $("nextBtn").classList.remove("hidden");
  $("nextBtn").textContent = "PLAY AGAIN";
  $("quitBtn").textContent = "Back to menu";
}

function backToMenu() {
  stopTimer();
  $("game").classList.add("hidden");
  $("setup").classList.remove("hidden");
  $("customPanel").classList.remove("hidden");
  $("statsPanel").classList.remove("hidden");
  $("installBtn").classList.toggle("hidden", !deferredInstall);
  updateStats();
}

$("startBtn").addEventListener("click", startGame);

document.querySelectorAll(".choice").forEach(button => {
  button.addEventListener("click", () => {
    choose(button.dataset.choice);
  });
});

$("nextBtn").addEventListener("click", () => {
  if (index >= questions.length - 1 && selected) {
    if ($("nextBtn").textContent === "PLAY AGAIN") {
      backToMenu();
      startGame();
    } else {
      finishGame();
      backToMenu();
    }
  } else {
    nextQuestion();
  }
});

$("quitBtn").addEventListener("click", backToMenu);

$("addQuestionBtn").addEventListener("click", () => {
  const q = $("customQuestion").value.trim();
  const a = $("customA").value.trim();
  const b = $("customB").value.trim();

  if (!q || !a || !b) {
    $("customMessage").textContent = "Fill in all three fields first.";
    return;
  }

  customQuestions.push({
    c: "Custom",
    q,
    a,
    b
  });

  save("wyrCustom", customQuestions);

  $("customQuestion").value = "";
  $("customA").value = "";
  $("customB").value = "";
  $("customMessage").textContent = "Question saved on this device! ✅";
});

$("resetStatsBtn").addEventListener("click", () => {
  if (confirm("Reset all your stats on this device?")) {
    stats = { played:0, A:0, B:0 };
    save("wyrStats", stats);
    updateStats();
  }
});

document.querySelectorAll("[data-reaction]").forEach(button => {
  button.addEventListener("click", () => {
    $("roastText").textContent += ` ${button.dataset.reaction}`;
  });
});

// Install prompt (supported browsers only)
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstall = event;
  $("installBtn").classList.remove("hidden");
});

$("installBtn").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $("installBtn").classList.add("hidden");
});

// Offline support requires HTTPS or localhost.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      $("offlineStatus").textContent = "📵 Offline-ready";
    } catch {
      $("offlineStatus").textContent = "Offline setup needs hosting";
    }
  });
} else {
  $("offlineStatus").textContent = "Offline mode unavailable in this browser";
}

updateStats();
