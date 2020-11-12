import fire from "../../firebase";
import ParticipantInterface from "./participantInterface";
import QuestionInterface from "./questionInterface";
interface RoomInterface {
  host: string;
  participants: ParticipantInterface[];
  waiting: ParticipantInterface[];
  totalRounds: number;
  currentRound: number;
  allAnswersSubmitted: boolean;
  allAnswersPicked: boolean;
  allReadyForNextRound: boolean;
  code: string;
  questionBank: Array<QuestionInterface>;
  roundOver: boolean;
  waitingForPlayers: boolean;
}
export default RoomInterface;
export let dummyRoom = (
  host: string = "dummy",
  participants: ParticipantInterface[] = [],
  waiting: ParticipantInterface[] = [],
  totalRounds: number = 0,
  currentRound: number = 0,
  allAnswersSubmitted: boolean = false,
  allAnswersPicked: boolean = false,
  allReadyForNextRound: boolean = false,
  code: string = "dummy",
  roundOver: boolean = false,
  questionBank: Array<QuestionInterface> = [],
  waitingForPlayers: boolean = false
): RoomInterface => ({
  host,
  participants,
  waiting,
  totalRounds,
  currentRound,
  allAnswersSubmitted,
  allAnswersPicked,
  allReadyForNextRound,
  code,
  questionBank,
  roundOver,
  waitingForPlayers,
});
export function updateRoom(room: RoomInterface) {
  if (room.code === "dummy") {
    console.trace();
  }
  return fire
    .database()
    .ref("rooms/" + room.code)
    .set(room);
}
export function getRoom(roomCode: string): Promise<any> {
  return fire
    .database()
    .ref("rooms/" + roomCode)
    .once("value");
}
