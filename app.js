import { evaluateAnswer, mission, scenes } from "./logic.js";

const root = document.querySelector("#app");

const state = {
  phase: "intro",
  selected: null,
  timeLeft: 10,
  score: 0,
  outcome: null,
  timer: null,
};

const scanLevel = {
  intro: 12,
  briefing: 48,
  quiz: 87,
  reveal: 100,
};

function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function resetTimer() {
  stopTimer();
  state.timeLeft = 10;
}

function startTimer() {
  resetTimer();
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      finish(null);
      return;
    }
    render();
  }, 1000);
}

function beginBriefing() {
  state.phase = "briefing";
  state.selected = null;
  state.outcome = null;
  render();
}

function beginQuiz() {
  state.phase = "quiz";
  state.selected = null;
  state.outcome = null;
  startTimer();
  render();
}

function finish(choice) {
  if (state.phase !== "quiz") return;
  stopTimer();
  state.selected = choice;
  state.outcome = evaluateAnswer(choice, state.timeLeft);
  state.score = state.outcome.score;
  state.phase = "reveal";
  render();
}

function restart() {
  stopTimer();
  state.phase = "intro";
  state.selected = null;
  state.timeLeft = 10;
  state.score = 0;
  state.outcome = null;
  render();
}

function phaseLabel() {
  if (state.phase === "intro") return "SYSTEM READY";
  if (state.phase === "briefing") return "CLUE ANALYSIS";
  if (state.phase === "quiz") return "LIVE DECISION";
  return "CASE CLOSED";
}

function phaseCopy() {
  if (state.phase === "intro") {
    return {
      title: mission.title,
      text: mission.brief,
      action: "啟動任務",
    };
  }
  if (state.phase === "briefing") {
    return {
      title: mission.goal,
      text: "先看線索，再做判斷。這一版只保留最有力的資訊，不把玩家淹死在頁面裡。",
      action: "進入問答",
    };
  }
  if (state.phase === "quiz") {
    return {
      title: mission.question,
      text: "選一個最接近真相的答案。倒數會繼續跑。",
      action: "提交答案",
    };
  }
  return {
    title: state.outcome?.title === "CORRECT" ? "真相已鎖定" : "需要重看線索",
    text: state.outcome?.detail || "案件已結束。",
    action: "重新挑戰",
  };
}

function statusText() {
  return state.phase === "reveal" ? "COMPLETE" : "ONLINE";
}

function renderScenes() {
  return scenes
    .map(
      (scene) => `
        <figure class="tile">
          <img src="${scene.src}" alt="${scene.label}" />
          <figcaption>
            <span>${scene.label}</span>
            <span>${scene.note}</span>
          </figcaption>
        </figure>
      `,
    )
    .join("");
}

function renderClues() {
  return mission.clues
    .map(
      (clue) => `
        <div class="clue">
          <strong>${clue.title}</strong>
          <p>${clue.text}</p>
        </div>
      `,
    )
    .join("");
}

function renderChoices() {
  return mission.choices
    .map((choice) => {
      const selected = state.selected === choice.key;
      const locked = state.phase !== "quiz";
      return `
        <button
          class="option"
          data-choice="${choice.key}"
          data-state="${selected ? "selected" : locked ? "locked" : "idle"}"
          ${locked ? "disabled" : ""}
        >
          <strong>${choice.key}</strong>
          <span>${choice.text}</span>
        </button>
      `;
    })
    .join("");
}

function renderResult() {
  const ok = state.outcome?.correct;
  return `
    <section class="result">
      <div class="result-grid">
        <div class="result-banner ${ok ? "" : "danger"}">
          <h3>${ok ? "答案正確" : "答案不對"}</h3>
          <p>${state.outcome?.detail || ""}</p>
        </div>

        <div class="score-row">
          <div class="score-card">
            <small>本次得分</small>
            <strong>${state.score}</strong>
          </div>
          <div class="score-card">
            <small>剩餘時間</small>
            <strong>${state.timeLeft}s</strong>
          </div>
          <div class="score-card">
            <small>正解</small>
            <strong>${mission.answer}</strong>
          </div>
        </div>

        <div class="actions">
          <button class="primary" data-action="restart">重新挑戰</button>
          <button class="secondary" data-action="briefing">回看線索</button>
        </div>
      </div>
    </section>
  `;
}

function renderMain() {
  const copy = phaseCopy();
  const scan = scanLevel[state.phase] ?? 12;
  const timerProgress = Math.max(0, Math.min(100, (state.timeLeft / 10) * 100));

  return `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <small>CASE FILE: ${mission.code}</small>
          <h1>${mission.title}</h1>
        </div>
        <div class="badge">${phaseLabel()}</div>
      </header>

      <section class="hero">
        <div class="panel hero-copy">
          <div class="meta">${mission.mission} | 找出消失的獲利</div>
          <div class="stack">
            <h2>${copy.title}</h2>
            <p>${copy.text}</p>
          </div>
          <div class="actions">
            ${
              state.phase === "intro"
                ? `<button class="primary" data-action="briefing">${copy.action}</button>`
                : state.phase === "briefing"
                  ? `<button class="primary" data-action="quiz">${copy.action}</button>`
                  : state.phase === "quiz"
                    ? `<button class="primary" data-action="finish">提交答案</button>`
                    : `<button class="primary" data-action="restart">${copy.action}</button>`
            }
            <button class="secondary" data-action="restart">重置</button>
          </div>
        </div>

        <aside class="hero-aside">
          <div class="status">
            <div class="status-row">
              <span>DATA SCAN</span>
              <span>${scan}%</span>
            </div>
            <div class="signal" style="--level: ${scan}%"><span></span></div>
            <div class="status-grid">
              <div class="status-box">
                <strong>MISSION</strong>
                <span>${mission.goal}</span>
              </div>
              <div class="status-box">
                <strong>NETWORK</strong>
                <span>${mission.network}%</span>
              </div>
              <div class="status-box">
                <strong>RISK ALERT</strong>
                <span class="danger">${mission.risk}</span>
              </div>
            </div>
          </div>

          ${state.phase === "quiz" ? `
            <div class="status">
              <div class="status-row">
                <span>倒數計時</span>
                <span>${state.timeLeft}s</span>
              </div>
              <div class="timer" style="--progress: ${timerProgress}">
                <b>${state.timeLeft}</b>
              </div>
            </div>
          ` : `
            <div class="status">
              <div class="status-row">
                <span>案件狀態</span>
                <span>${statusText()}</span>
              </div>
              <div class="status-box">
                <strong>系統訊息</strong>
                <span>${state.phase === "intro" ? "新任務已接收。" : "準備進入推理。"}</span>
              </div>
            </div>
          `}
        </aside>
      </section>

      <section class="gallery">
        ${renderScenes()}
      </section>

      <section class="stage">
        <article class="card">
          <div class="label">CLUE ANALYSIS</div>
          <h3 class="mission-title">${mission.goal}</h3>
          <div class="clue-grid">${renderClues()}</div>
        </article>

        <article class="card quiz">
          <div class="label">INTERACTIVE QUESTION</div>
          <p class="question">${mission.question}</p>
          <div class="timer-wrap">
            <div class="timer" style="--progress: ${timerProgress}">
              <b>${state.phase === "quiz" ? state.timeLeft : 10}</b>
            </div>
            <div>
              <div class="chip">10 秒限時</div>
              <p style="margin: 8px 0 0; color: var(--muted);">選擇會影響後續推理方向。</p>
            </div>
          </div>
          <div class="choices">${renderChoices()}</div>
        </article>
      </section>

      ${state.phase === "reveal" ? renderResult() : ""}

      <footer class="footer">
        <span>RISK · DATA · TRUTH</span>
        <span>Point 7 / MVP</span>
      </footer>
    </div>
  `;
}

function wireEvents() {
  root.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "briefing") beginBriefing();
      if (action === "quiz") beginQuiz();
      if (action === "restart") restart();
      if (action === "finish") {
        finish(state.selected ?? null);
      }
    });
  });

  root.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.phase !== "quiz") return;
      state.selected = button.dataset.choice;
      finish(state.selected);
    });
  });
}

function render() {
  root.innerHTML = renderMain();
  wireEvents();
}

render();

// ponytail: one mission is enough for MVP; add more stages when content is ready.
