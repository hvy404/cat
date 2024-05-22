import { Editor } from "@tiptap/core";

/**
 * Retrieves the text around the cursor in an editor.
 * 
 * @param editor - The editor instance.
 * @param chars - The number of characters to retrieve before the cursor.
 * @param offset - The offset to apply when retrieving text after the cursor.
 * @returns The text around the cursor.
 */
export const getTextAroundCursor = (
  editor: Editor,
  {
    chars,
    offset = 0,
  }: {
    chars: number;
    offset?: number;
  }
) => {
  // Retrieve 'chars' characters before the cursor
  const beforeText = editor.state.doc.textBetween(
    Math.max(0, editor.state.selection.from - chars),
    editor.state.selection.from - offset,
    "\n"
  );

  let afterText = '';
  // Retrieve additional text after the cursor if beforeText is less than 100 characters
  if (beforeText.length < 250) {
    // Retrieve text after the cursor up to the first period for a complete sentence
    const fullAfterText = editor.state.doc.textBetween(
      editor.state.selection.to + offset,
      editor.state.doc.content.size,
      "\n"
    );

    const periodPos = fullAfterText.indexOf('.');
    const endPos = periodPos !== -1 ? editor.state.selection.to + offset + periodPos + 1 : editor.state.selection.to + offset;

    afterText = editor.state.doc.textBetween(
      editor.state.selection.to + offset,
      endPos,
      "\n"
    );

    if (afterText) {
      afterText = "Further Context After The Cursor:\n\n" + afterText;
    }
  }

  // Concatenate beforeText and afterText
  return beforeText + (afterText ? "\n\n" + afterText : '');
};
