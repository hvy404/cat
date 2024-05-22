import { FC } from "react";
import { Editor } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";
import { Wand } from "lucide-react";

interface ScopeDetailProps {
  editor: Editor;
  expandDetail: (text: string) => void;
}

/**
 * Renders the ScopeDetail component.
 *
 * @param {Object} props - The component props.
 * @param {Editor} props.editor - The editor instance.
 * @param {Function} props.expandDetail - The function to expand the detail.
 * @returns {JSX.Element} The rendered ScopeDetail component.
 */

export const ScopeDetail: FC<ScopeDetailProps> = ({ editor, expandDetail }) => {
  const saveHighlightedText = () => {
    const slice = editor.state.selection.content();
    let text = "";
    slice.content.forEach((node) => {
      text += node.textContent;
    });
    expandDetail(text);

    // Collapse the bubble menu
    const { from } = editor.state.selection;
    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from))
    );
  };

  return (
    <div
      onClick={saveHighlightedText}
      className="flex items-center cursor-pointer px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200"
    >
      Chat
      <Wand className="ml-2 h-4 w-4" />
    </div>
  );
};
