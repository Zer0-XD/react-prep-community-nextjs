import { loadQuestions } from "@/lib/questions";
import FlashCard from "@/components/features/FlashCard";

export default function FlashcardPage() {
  const questions = loadQuestions();
  return <FlashCard questions={questions} />;
}
