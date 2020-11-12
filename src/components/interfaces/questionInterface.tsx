import AnswerInterface from "./answerInterface";

interface QuestionInterface {
  questionText: string;
  slots: number;
  answers: Array<AnswerInterface>;
}
export default QuestionInterface;
export let dummyQuestion = (
  questionText: string = "dummy",
  slots: number = 0,
  answers: Array<AnswerInterface> = []
): QuestionInterface => ({ questionText, slots, answers });
