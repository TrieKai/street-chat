import { Props } from "./type";

export default function Chatroom({ params }: Props) {
  const { chatroomId } = params;
  console.log(chatroomId);

  return <main className="w-full h-full"></main>;
}
