import Chatroom from "@/app/[chatroomId]/components/Chatroom";
import { Props } from "./type";

export default async function Page({ params }: Props) {
  const { chatroomId } = await params;

  return <Chatroom chatroomId={chatroomId} />;
}
