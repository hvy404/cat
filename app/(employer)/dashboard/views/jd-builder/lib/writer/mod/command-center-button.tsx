import { Dispatch, FC, SetStateAction } from "react";
import { Editor } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";
import { ChevronRightSquareIcon } from "lucide-react";

interface CommandCenterToggleProps {
  editor: Editor;
  /* commandContext: (text: string) => void; */
  setSelectionRange: (range: { from: number; to: number }) => void;
}

export const CommandCenterToggle: FC<CommandCenterToggleProps> = ({
  editor,
  /* commandContext, */
  setSelectionRange,
}) => {
  const setCommandContextText = () => {
    const { from, to } = editor.state.selection;
    const slice = editor.state.selection.content();
    let text = "";
    slice.content.forEach((node) => {
      text += node.textContent;
    });

   /*  commandContext(text); // Set the command context text */

    // Store the current selection range
    setSelectionRange({ from, to });

    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from)) // Set the selection to the start of the current selection
    );
  };

  return (
    <div
      onClick={setCommandContextText}
      className="flex items-center cursor-pointer px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200"
    >
      Command
      <ChevronRightSquareIcon className="ml-2 h-4 w-4" />
    </div>
  );
};
