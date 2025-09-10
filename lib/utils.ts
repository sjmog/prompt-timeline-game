export function sanitized(output: string) {
  const SENTENCE_ENDERS = [".", "!", "?"];

  const sentences = output.split(SENTENCE_ENDERS.join("|"));
  if (sentences) {
    if (sentences.length > 1) sentences.pop();
    output = sentences.join(".");
  } else {
    output = output.trim();
  }

  // ensure the end of the sentence makes sense!
  switch (output[output.length - 1]) {
    case ".":
      break;
    case "!":
      break;
    case "?":
      break;
    case '"':
      break;
    case ",":
      output = `${output.slice(0, -1)}...`;
    case ";":
      output = `${output.slice(0, -1)}...`;
    case ":":
      output = `${output.slice(0, -1)}...`;
    case "(":
      output = `${output.slice(0, -1)}...`;
    default:
      output = `${output}...`;
  }

  return output;
}
