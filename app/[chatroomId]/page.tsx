import Chatroom from "@/app/components/Chatroom";
import { Props } from "./type";

export default async function Page({ params }: Props) {
  const { chatroomId } = await params;

  return <Chatroom chatroomId={chatroomId} />;
}
