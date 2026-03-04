import { readFileSync } from "fs";
import { join } from "path";

export function loadQuestions() {
  const filePath = join(process.cwd(), "data", "questions.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export function loadCodingTasks() {
  const filePath = join(process.cwd(), "data", "coding-tasks.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}
