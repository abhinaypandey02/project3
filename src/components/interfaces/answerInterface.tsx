interface AnswerInterface {
  answerText: string;
  submittedBy: string;
  selectedBy: Array<string>;
}
export let dummyAnswer = (
  answerText: string = "dummy",
  submittedBy: string = "dummy",
  selectedBy: string[] = []
): AnswerInterface => ({ answerText, submittedBy, selectedBy });
export default AnswerInterface;
