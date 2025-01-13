import { forwardRef } from "react";
import HeadShot from "@/app/components/HeadShot";
import { formatMessage } from "@/helpers/common";

interface IMessage {
  isSelf: boolean;
  userAvatarUrl: string;
  userName: string;
  text: string;
  time: number;
  className?: string;
}

const HEAD_SHOT_SIZE = 44;

const Message = forwardRef<HTMLDivElement, IMessage>(
  (
    { isSelf, userAvatarUrl, userName, text, time, className },
    ref
  ): JSX.Element => {
    return (
      <div
        ref={ref}
        className={`w-full p-2 flex ${
          isSelf ? "flex-row-reverse" : "flex-row"
        } gap-2 ${className}`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <HeadShot
            headShotURL={userAvatarUrl}
            width={HEAD_SHOT_SIZE}
            height={HEAD_SHOT_SIZE}
            title={userName}
          />
        </div>

        {/* Message content */}
        <div
          className={`flex flex-col max-w-[70%] ${
            isSelf ? "items-end" : "items-start"
          }`}
        >
          <span className="text-sm text-gray-600 mb-1">{userName}</span>

          <div className={`relative group`}>
            <div
              className={`p-2.5 rounded-2xl ${
                isSelf ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
              } break-words`}
              dangerouslySetInnerHTML={{ __html: formatMessage(text) }}
            />

            <span
              className={`text-xs text-gray-500 mt-1 ${
                isSelf ? "text-right" : "text-left"
              }`}
            >
              {new Date(time).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "message";

export default Message;
