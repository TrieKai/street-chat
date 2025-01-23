import sanitizeHtml from "sanitize-html";

export const sanitizeMessage = (text: string): string => {
  // handle URL
  const urlRegex = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  const linkedText = text.replace(
    urlRegex,
    '<a href="$1$2" target="_blank" rel="noopener noreferrer">$1$2</a>'
  );

  return sanitizeHtml(linkedText, {
    allowedTags: [
      "a", // link
      "b", // bold
      "strong", // bold (semantic)
      "i", // italic
      "em", // italic (semantic)
      "u", // underline
      "p", // paragraph
      "br", // line break
      "span", // for styling
      "code", // code
      "pre", // preformatted text
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class"],
      code: ["class"],
      pre: ["class"],
    },
    allowedClasses: {
      span: ["emoji", "mention", "hashtag"],
      code: ["language-*"],
      pre: ["language-*"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
};

// optional: add conversion function for specific formats
export const formatMessage = (text: string): string => {
  // handle emoji
  const emojiRegex = /(:[\w+-]+:)/g;
  text = text.replace(emojiRegex, '<span class="emoji">$1</span>');

  // handle mention
  const mentionRegex = /(@\w+)/g;
  text = text.replace(mentionRegex, '<span class="mention">$1</span>');

  // handle hashtag
  const hashtagRegex = /(#\w+)/g;
  text = text.replace(hashtagRegex, '<span class="hashtag">$1</span>');

  // handle code block
  const codeRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
  text = text.replace(
    codeRegex,
    '<pre class="language-$1"><code>$2</code></pre>'
  );

  // handle inline code
  const inlineCodeRegex = /`([^`]+)`/g;
  text = text.replace(inlineCodeRegex, "<code>$1</code>");

  // finally, sanitize the text
  return sanitizeMessage(text);
};

export const createAssistantId = (id = ""): string => {
  return `assistant_${id ? id : crypto.randomUUID()}`;
};

export const isAssistantId = (id: string): boolean => {
  return id.startsWith("assistant_");
};
