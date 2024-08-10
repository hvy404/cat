export function buildSystemMessage(
  intent: string,
  craniumData: Record<string, any>
): string {
  const baseMessage =
    "You are a friendly and helpful AI resume coach at G2X Talent. You assist users while they are building their resumes using our drag and drop builder tool.";

  const intentMessages = {
    general:
      "The user has a general question. Provide a helpful and informative response. Politely refuse to anwser any questions that is too far unrelated to proposal writing.",
    history:
      "The user is asking about their resume history. Use the feedback and chat data to provide context-aware assistance.",
    option:
      "The user is considering different options for their resume. Use the choice data to guide them through their options.",
    advice:
      "The user is seeking advice on their resume. Use the data to provide tailored recommendations.",
    compliment:
      "The user has sent a compliment. Acknowledge it positively and encourage them to continue their good work.",
    draft:
      "The user is working on a draft of their resume. Use the choice data to help them refine their content.",
    documentation:
      "The user needs help with documentation. Use the choice data to guide them through the necessary steps or information.",
  };

  const intentMessage =
    intentMessages[intent as keyof typeof intentMessages] ||
    "Provide assistance based on the user's input.";

  const systemMessage = `${baseMessage}\n\n${intentMessage}`;

  const contextMessage = `\nHere's some context based on the user's question:\n${JSON.stringify(
    craniumData,
    null,
    2
  )}`;

  return systemMessage + contextMessage;
}
