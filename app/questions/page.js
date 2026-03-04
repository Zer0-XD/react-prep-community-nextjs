import { loadQuestions } from "@/lib/questions";
import QuestionTable from "@/components/features/QuestionTable";

export default function QuestionsPage() {
  const questions = loadQuestions();
  return <QuestionTable questions={questions} />;
}
