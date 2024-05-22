import { Editor } from "@tiptap/core";

/**
 * Retrieves the previous text from the editor based on the specified number of characters and offset.
 *
 * @param editor - The editor instance.
 * @param chars - The number of characters to retrieve.
 * @param offset - The optional offset to adjust the retrieval position.
 * @returns The previous text from the editor.
 */
export const getPrevText = (
  editor: Editor,
  {
    chars,
    offset = 0,
  }: {
    chars: number;
    offset?: number;
  }
) => {
  return editor.state.doc.textBetween(
    Math.max(0, editor.state.selection.from - chars),
    editor.state.selection.from - offset,
    "\n"
  );
  //complete(editor.storage.markdown.getMarkdown());
};