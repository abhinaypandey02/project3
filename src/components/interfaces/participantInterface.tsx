import AnswerInterface, { dummyAnswer } from "./answerInterface";

interface ParticipantInterface {
  uid: string;
  score: number;
  currentAnswer: AnswerInterface;
  chosenAns: boolean;
  readyForNextRound: boolean;
}
export let dummyParticipant = (
  uid: string = "dummy",
  score: number = 0,
  currentAnswer: AnswerInterface = dummyAnswer(),
  chosenAns: boolean = false,
  readyForNextRound: boolean = false
): ParticipantInterface => ({
  uid,
  score,
  currentAnswer,
  chosenAns,
  readyForNextRound,
});
export default ParticipantInterface;
