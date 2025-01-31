import { ChevronLeft, Settings } from "lucide-react";
import { Button } from "@headlessui/react";
import AvatarDropdown from "./AvatarDropdown";
import type { User } from "@/types/chatroom";

interface Props {
  chatroomName: string;
  handleBack: () => void;
  user: User | null;
  handleClickSettings: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
}

export default function ChatroomHeader({
  chatroomName,
  handleBack,
  user,
  handleClickSettings,
  handleLogin,
  handleLogout,
}: Props) {
  return (
    <header className="bg-white shadow-sm px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">{chatroomName}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleClickSettings}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <AvatarDropdown
          user={user}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
        />
      </div>
    </header>
  );
}
