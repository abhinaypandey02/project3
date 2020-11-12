import React, { Component } from "react";
import fire from "../../firebase";
import RoomInterface, {
  dummyRoom,
  getRoom,
  updateRoom,
} from "../interfaces/RoomInterface";
import Controls from "../utilities/controls";
import PreGameLounge from "../lounges/preGameLounge";
import QuestionInterface from "../interfaces/questionInterface";
import Question from "./question";
import LoadingText from "../utilities/loadingText";
import PostAnswerLounge from "../lounges/postAnswerLounge";
import ParticipantInterface, {
  dummyParticipant,
} from "../interfaces/participantInterface";
import AnswerPickLounge from "../lounges/answerPickLounge";
import PostAnswerPickLounge from "../lounges/postAnswerPickLounge";
import ScoreboardLounge from "../lounges/scoreboardLounge";
import PostReadyLounge from "../lounges/postReadyLounge";
import FinalResult from "./finalResult";
import WaitingLounge from "../lounges/waitingLounge";
import config from "../../config";
import { dummyAnswer } from "../interfaces/answerInterface";
import { codeToName } from "../interfaces/UserInterface";
interface gameInterface {
  userCode: string;
  roomCode: string;
  leaveRoom: Function;
  deleteRoom: Function;
}
class MainGame extends Component<gameInterface> {
  mounted = false;
  state = {
    room: dummyRoom(),
    participant: dummyParticipant(),
    totalRounds: 8,
    waiting: false,
  };
  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    fire
      .database()
      .ref("/rooms/" + this.props.roomCode)
      .on("value", (snapshot) => {
        if (!this.mounted) return;
        let room = snapshot.val();
        if (room) {
          if (
            room.waitingForPlayers &&
            room.participants.length >= config.min_players
          ) {
            room.waitingForPlayers = false;
            this.setState({ room }, this.newRound);
          }
          if (
            room.participants.length < config.min_players &&
            room.currentRound > 0 &&
            !room.waitingForPlayers
          ) {
            if (room.hasOwnProperty("waiting")) {
              room.participants.push(...room.waiting);
              room.waiting = [];
            }
            room.waitingForPlayers = true;

            updateRoom(room);
            this.setState({ room });
          } else
            this.setState({
              room,
              waiting:
                room.hasOwnProperty("waiting") &&
                room.waiting.some(
                  (participant: ParticipantInterface) =>
                    participant.uid === this.props.userCode
                ),
            });
          for (let participant of room.participants) {
            if (participant.uid === this.props.userCode) {
              this.setState({ participant });
            }
          }
        } else {
          this.props.leaveRoom();
        }
      });
  }
  randomSelector = (part: Array<ParticipantInterface>, slots: number) => {
    let tempParticipants: Array<string> = [];
    while (tempParticipants.length !== slots) {
      let ind: number = Math.floor(Math.random() * part.length);
      if (part.length < slots) tempParticipants.push(part[ind].uid);
      else if (!tempParticipants.includes(part[ind].uid))
        tempParticipants.push(part[ind].uid);
    }
    return tempParticipants;
  };

  plugIn = (part: Array<string>, text: string, room: RoomInterface) => {
    for (let p = 0; p < part.length; p++) {
      text = text.replace(config.hotString, part[p]);
    }
    room.questionBank[room.currentRound - 1].questionText = text;

    updateRoom(room);
  };

  newRound = () => {
    let tempRoom = this.state.room;
    tempRoom.allReadyForNextRound = false;
    tempRoom.allAnswersPicked = false;
    tempRoom.allAnswersSubmitted = false;
    if (tempRoom.hasOwnProperty("waiting")) {
      tempRoom.participants.push(...tempRoom.waiting);
      tempRoom.waiting = [];
    }
    for (let p of tempRoom.participants) {
      p.readyForNextRound = false;
      p.chosenAns = false;
      p.currentAnswer = dummyAnswer();
    }

    if (tempRoom.currentRound !== tempRoom.totalRounds) {
      tempRoom.currentRound++;
      let tempParticipants: Array<string> = this.randomSelector(
        tempRoom.participants,
        tempRoom.questionBank[tempRoom.currentRound - 1].slots
      );
      codeToName(tempParticipants).then((s) => {
        this.plugIn(
          s,
          tempRoom.questionBank[tempRoom.currentRound - 1].questionText,
          tempRoom
        );
      });
    } else {
      tempRoom.roundOver = true;
      updateRoom(tempRoom);
    }
  };

  changeTotalRounds = (totalRounds: number) => {
    this.setState({ totalRounds });
  };

  startGame = () => {
    getRoom(this.props.roomCode).then((snapshot) => {
      if (snapshot.val()) {
        let tempRoom: RoomInterface = snapshot.val();
        tempRoom.totalRounds = this.state.totalRounds;
        tempRoom.currentRound = 1;
        tempRoom.roundOver = false;

        fire
          .database()
          .ref("/questionBank/")
          .once("value", (snapshot) => {
            if (snapshot.val()) {
              let bank = snapshot.val();
              let tempArray: Array<QuestionInterface> = [];
              while (tempArray.length !== tempRoom.totalRounds) {
                if (Object.keys(bank).length === 0) {
                  bank = snapshot.val();
                }
                let ind: number = Math.floor(
                  Math.random() * (Object.keys(bank).length - 1)
                );
                if (bank[ind]) {
                  tempArray.push(bank[ind]);
                  delete bank[ind];
                }
              }

              tempRoom.questionBank = tempArray;
              let tempParticipants: Array<string> = this.randomSelector(
                tempRoom.participants,
                tempRoom.questionBank[tempRoom.currentRound - 1].slots
              );
              codeToName(tempParticipants).then((s) => {
                this.plugIn(
                  s,
                  tempRoom.questionBank[tempRoom.currentRound - 1].questionText,
                  tempRoom
                );
              });
              updateRoom(tempRoom);
            }
          });
      }
    });
  };
  render() {
    return (
      <div className="container">
        {this.state.waiting && (
          <WaitingLounge
            roomCode={this.props.roomCode}
            userCode={this.props.userCode}
            key={"waitinglounge" + this.props.userCode + this.props.roomCode}
          />
        )}
        {(this.state.room.currentRound === 0 ||
          this.state.room.participants.length < config.min_players) &&
          !this.state.waiting && (
            <PreGameLounge
              roomCode={this.props.roomCode}
              userCode={this.props.userCode}
              leaveRoom={this.props.leaveRoom}
              key={"pregamelounge" + this.props.userCode + this.props.roomCode}
              changeTotalRounds={this.changeTotalRounds}
            />
          )}
        {this.state.room.currentRound > 0 &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          this.state.room.questionBank.length !==
            this.state.room.totalRounds && (
            <LoadingText
              key={"loadingtext" + this.props.userCode + this.props.roomCode}
            >
              starting game
            </LoadingText>
          )}
        {this.state.participant.currentAnswer.answerText !== "dummy" &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          !this.state.room.allAnswersSubmitted && (
            <PostAnswerLounge
              roomCode={this.props.roomCode}
              key={
                "postanswerlounge" + this.props.userCode + this.props.roomCode
              }
              userCode={this.props.userCode}
            />
          )}
        {this.state.participant.currentAnswer.answerText !== "dummy" &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          this.state.room.allAnswersSubmitted &&
          !this.state.participant.chosenAns && (
            <AnswerPickLounge
              key={
                "AnswerPickLounge" + this.props.userCode + this.props.roomCode
              }
              roomCode={this.props.roomCode}
              userCode={this.props.userCode}
            />
          )}
        {this.state.participant.currentAnswer.answerText !== "dummy" &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          this.state.room.allAnswersSubmitted &&
          !this.state.room.allAnswersPicked &&
          this.state.participant.chosenAns && (
            <PostAnswerPickLounge
              key={
                "PostAnswerPickLounge" +
                this.props.userCode +
                this.props.roomCode
              }
              roomCode={this.props.roomCode}
              userCode={this.props.userCode}
            />
          )}
        {this.state.participant.currentAnswer.answerText !== "dummy" &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          this.state.participant.readyForNextRound &&
          !this.state.room.allReadyForNextRound && (
            <PostReadyLounge
              key={
                "PostReadyLounge" + this.props.userCode + this.props.roomCode
              }
              roomCode={this.props.roomCode}
              userCode={this.props.userCode}
            />
          )}
        {this.state.participant.currentAnswer.answerText !== "dummy" &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          this.state.room.allAnswersPicked &&
          !this.state.room.allReadyForNextRound &&
          !this.state.participant.readyForNextRound && (
            <ScoreboardLounge
              key={
                "ScoreboardLounge" + this.props.userCode + this.props.roomCode
              }
              roomCode={this.props.roomCode}
              userCode={this.props.userCode}
            />
          )}
        {this.state.room.currentRound > 0 &&
          !this.state.room.roundOver &&
          this.state.room.questionBank.length === this.state.room.totalRounds &&
          this.state.room.participants.length >= config.min_players &&
          !this.state.waiting &&
          this.state.participant.currentAnswer.answerText === "dummy" && (
            <Question
              key={"Question" + this.props.userCode + this.props.roomCode}
              userCode={this.props.userCode}
              roomCode={this.props.roomCode}
            />
          )}
        {this.state.room.code !== "dummy" &&
          this.state.room.participants.length >= config.min_players &&
          this.state.room.roundOver &&
          !this.state.waiting && <FinalResult roomCode={this.props.roomCode} />}
        {
          <Controls
            startGame={this.startGame}
            leaveRoom={this.props.leaveRoom}
            deleteRoom={this.props.deleteRoom}
            userCode={this.props.userCode}
            key={"controls" + this.props.userCode + this.props.roomCode}
            roomCode={this.props.roomCode}
            newRound={this.newRound}
          />
        }
      </div>
    );
  }
}

export default MainGame;
