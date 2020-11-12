import fire from "../../firebase";
interface UserInterface {
  firstName: string;
  lastName: string;
  uid: string;
  roomCode: string;
}

export default UserInterface;
export let dummyUser = (
  firstName: string = "dummy",
  lastName: string = "dummy",
  uid: string = "dummy",
  roomCode: string = "dummy"
): UserInterface => ({ firstName, lastName, uid, roomCode });
export function updateUser(user: UserInterface): Promise<any> {
  return fire
    .database()
    .ref("users/" + user.uid)
    .set(user);
}
export function getUser(userCode: string): Promise<any> {
  return fire
    .database()
    .ref("users/" + userCode)
    .once("value");
}
export let codeToName = async (part: Array<string>): Promise<string[]> => {
  let tempPart: string[] = [];
  for (let i = 0; i < part.length; i++) {
    await getUser(part[i]).then((s) => {
      if (s.val()) {
        tempPart.push(s.val().firstName);
      }
    });
  }
  return tempPart;
};
