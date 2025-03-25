import { forwardRef, useCallback, useState } from "react";
import clsx from "clsx";
import { Check, Copy, LoaderCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import HeadShot from "@/app/components/HeadShot";
import { Button } from "@headlessui/react";

interface IMessage {
  type: "user" | "assistant";
  isSelf: boolean;
  userAvatarUrl?: string;
  userName: string;
  text: string;
  time: number;
  isLoading?: boolean;
  isError?: boolean;
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
      isError = false,
      className,
    },
    ref
  ): JSX.Element => {
    const [isCopied, setIsCopied] = useState(false);
    const [isHover, setIsHover] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy text:", error);
      }
    }, [text]);

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
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <span className="text-sm text-gray-600 mb-1">{userName}</span>

          <div className="relative group">
            <div
              className={clsx(
                "p-2.5 rounded-2xl break-words min-h-[44px]",
                isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
              )}
            >
              {isError && (
                <span className="text-red-500">Error loading message</span>
              )}
              {isLoading && !isError && (
                <LoaderCircle className="animate-spin text-gray-600" />
              )}
              {!isLoading && !isError && (
                <div className="relative">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {text}
                  </ReactMarkdown>

                  {isHover && (
                    <Button
                      className="absolute bottom-[-4rem] left-0 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white/80 rounded-md"
                      onClick={handleCopy}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
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
