import assert from "node:assert/strict";
import { evaluateAnswer, mission } from "./logic.js";

const correct = evaluateAnswer("C", 8);
assert.equal(correct.correct, true);
assert.equal(correct.score, 140);
assert.equal(correct.title, "CORRECT");

const wrong = evaluateAnswer("A", 8);
assert.equal(wrong.correct, false);
assert.equal(wrong.score, 0);
assert.match(wrong.detail, /真正的風險/);

assert.equal(mission.answer, "C");
assert.equal(mission.clues.length, 4);

console.log("self-check passed");
