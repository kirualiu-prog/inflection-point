export const scenes = [
  { src: "./分鏡圖/scene1.png", label: "任務接收", note: "第一版主視覺" },
  { src: "./分鏡圖/scene2.png", label: "風險訊號", note: "異常警示" },
  { src: "./分鏡圖/scene3.png", label: "線索分析", note: "答題與揭露" },
];

export const mission = {
  code: "PR-7X1",
  title: "臨界點解謎室",
  mission: "MISSION 01",
  goal: "找出消失的獲利",
  brief:
    "這家公司帳面上看起來很漂亮，但系統已經偵測到風險異常。你要在倒數內找出真正問題。",
  scan: 92,
  network: 88,
  risk: "ELEVATED",
  clues: [
    { id: "a", title: "營收成長", text: "短期營收看起來上升，但不是唯一判斷依據。" },
    { id: "b", title: "碳成本", text: "部分碳成本尚未完整入帳。" },
    { id: "c", title: "廢棄物處理", text: "處理成本持續上升，卻沒被反映在獲利裡。" },
    { id: "d", title: "綠電缺口", text: "綠電採購缺口擴大，後續成本可能被低估。" },
  ],
  question: "為什麼帳面上的獲利與實際狀況不符？",
  choices: [
    { key: "A", text: "市場需求突然萎縮" },
    { key: "B", text: "品牌聲量大幅下滑" },
    { key: "C", text: "環境成本尚未完整入帳" },
    { key: "D", text: "產品組合策略錯誤" },
  ],
  answer: "C",
  explanation:
    "真正問題不是營收，而是環境成本、廢棄物處理與綠電採購缺口尚未完整入帳，讓獲利被高估。",
};

export function evaluateAnswer(choice, timeLeft) {
  const correct = choice === mission.answer;
  const safeTime = Math.max(0, Math.min(10, Number(timeLeft) || 0));
  return {
    correct,
    title: correct ? "CORRECT" : "FALSE TRAIL",
    score: correct ? 100 + safeTime * 5 : 0,
    detail: correct
      ? mission.explanation
      : "答案方向不對。真正的風險藏在尚未入帳的成本，而不是表面成長。",
  };
}
