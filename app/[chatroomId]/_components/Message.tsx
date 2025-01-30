import { forwardRef } from "react";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import HeadShot from "@/app/components/HeadShot";

interface IMessage {
  type: "user" | "assistant";
  isSelf: boolean;
  userAvatarUrl?: string;
  userName: string;
  text: string;
  time: number;
  isLoading?: boolean;
  className?: string;
}

const HEAD_SHOT_SIZE = 44;

const Message = forwardRef<HTMLDivElement, IMessage>(
  (
    {
      type,
      isSelf,
      userAvatarUrl,
      userName,
      text,
      time,
      isLoading = false,
      className,
    },
    ref
  ): JSX.Element => {
    return (
      <div
        ref={ref}
        className={clsx(
          "w-full p-2 flex gap-2",
          isSelf ? "flex-row-reverse" : "flex-row",
          className
        )}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <HeadShot
            headShotURL={userAvatarUrl || ""}
            type={type}
            width={HEAD_SHOT_SIZE}
            height={HEAD_SHOT_SIZE}
            title={userName}
          />
        </div>

        {/* Message content */}
        <div
          className={clsx(
            "flex flex-col max-w-[70%]",
            isSelf ? "items-end" : "items-start"
          )}
        >
          <span className="text-sm text-gray-600 mb-1">{userName}</span>

          <div className="relative group">
            <div
              className={clsx(
                "p-2.5 rounded-2xl break-words min-h-[44px]",
                isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
              )}
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin text-gray-600" />
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {text}
                </ReactMarkdown>
              )}
            </div>

            <span
              className={clsx(
                "text-xs text-gray-500 mt-1",
                isSelf ? "text-right" : "text-left"
              )}
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
