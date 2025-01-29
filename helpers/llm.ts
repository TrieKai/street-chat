// Fix various problems in web-llm generation
export const fixMessage = (message: string): string => {
  // RedPajama model incorrectly includes `<human` in response
  message = message.replace(/(<human\s*)+$/, "");

  return message;
};

// Get model size from model id
export const getSize = (model_id: string): string | undefined => {
  const sizeRegex = /-(\d+(\.\d+)?[BK])-?/;
  const match = model_id.match(sizeRegex);
  if (match) {
    return match[1];
  }
  return undefined;
};

// Get quantization method from model id
export const getQuantization = (model_id: string): string | undefined => {
  const quantizationRegex = /-(q[0-9]f[0-9]+(?:_[0-9])?)-/;
  const match = model_id.match(quantizationRegex);
  if (match) {
    return match[1];
  }
  return undefined;
};
