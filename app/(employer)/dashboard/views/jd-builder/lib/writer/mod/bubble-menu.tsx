import {
  BubbleMenu,
  BubbleMenuProps,
  isNodeSelection,
  Editor,
} from "@tiptap/react";
import { FC, useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";
import { NodeSelector } from "./node-selector";
import { ScopeDetail } from "./scope-detail";
import { CommandCenterToggle } from "./command-center-button";
import { cn } from "@/lib/utils";

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

// Add Editor type to your props
interface EditorBubbleMenuProps extends Omit<BubbleMenuProps, "children"> {
  editor: Editor;
  /* expandDetail: (text: string) => void; */
  commandContext: (text: string) => void;
  setSelectionRange: (range: { from: number; to: number }) => void;
}

/* type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children">;
 */
export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  if (!props.editor) {
    // Handle the case where props.editor is undefined.
    return null; // or some other fallback behavior
  }

  const items: BubbleMenuItem[] = [
    {
      name: "bold",
      isActive: () => props.editor.isActive("bold"),
      command: () => props.editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: () => props.editor.isActive("italic"),
      command: () => props.editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: () => props.editor.isActive("underline"),
      command: () => props.editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: () => props.editor.isActive("strike"),
      command: () => props.editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
  ];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    shouldShow: ({ state, editor }) => {
      const { selection } = state;
      const { empty } = selection;

      if (editor.isActive("image") || empty || isNodeSelection(selection)) {
        return false;
      }
      return true;
    },
    tippyOptions: {
      moveTransition: "transform 0.15s ease-out",
      onHidden: () => {
        setIsNodeSelectorOpen(false);
      },
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="flex min-w-max divide-x divide-stone-200 rounded border border-stone-200 bg-white shadow-xl"
    >
      {/*  <ScopeDetail editor={props.editor} expandDetail={props.expandDetail} /> */}
      <CommandCenterToggle
        editor={props.editor}
        commandContext={props.commandContext}
        setSelectionRange={props.setSelectionRange}
      />
      <NodeSelector
        editor={props.editor}
        isOpen={isNodeSelectorOpen}
        setIsOpen={() => {
          setIsNodeSelectorOpen(!isNodeSelectorOpen);
        }}
      />
      <div className="flex">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.command}
            className="p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200"
            type="button"
          >
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(),
              })}
            />
          </button>
        ))}
      </div>
    </BubbleMenu>
  );
};
