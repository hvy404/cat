"use client";
import { useEffect, useRef, useState } from "react";
import { defaultEditorProps } from "./mod/props";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { useCompletion } from "ai/react";
import { useDebouncedCallback } from "use-debounce";
import { EditorBubbleMenu } from "./mod/bubble-menu";
import useLocalStorage from "./hooks/use-local-storage";
import { getPrevText } from "./mod/get-prev-text";
import { getTextAroundCursor } from "./mod/cursor-surrounding";
import { Fragment, Node } from "prosemirror-model";

/* Extensions */
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import History from "@tiptap/extension-history";
import TiptapUnderline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Heading from "@tiptap/extension-heading";
import SlashCommand from "./extensions/slash-command";
import Placeholder from "@tiptap/extension-placeholder";
import CustomKeymap from "./extensions/custom-keymap";
import DragAndDrop from "./extensions/drag-and-drop";

interface ContentItem {
  text: string;
  type: string;
}

interface ContentBlock {
  type: string;
  content: ContentItem[];
}

interface EditorContent {
  content: ContentBlock[];
  type: string;
}

const JDWriter = () => {
  const defaultValue = "Hello";

  //const [expandDetail, setExpandDetail] = useState(""); // State for expanded detail
  const [commandOpen, setCommandOpen] = useState(false); // State for command center
  const [commandContext, setCommandContext] = useState(""); // State for command context
  const [editChoice, setEditChoice] = useState(""); // State for edit choice
  const [selectionRange, setSelectionRange] = useState<{
    from: number;
    to: number;
  } | null>(null); // State for selection range

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside leading-3 -mt-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside leading-3 -mt-2",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "leading-normal -mb-2",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-stone-700",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-sm bg-stone-100 p-5 font-mono font-medium text-stone-800",
          },
        },
        code: {
          HTMLAttributes: {
            class:
              "rounded-md bg-stone-200 px-1.5 py-1 font-mono font-medium text-stone-900",
            spellcheck: "false",
          },
        },
        horizontalRule: false,
        dropcursor: {
          color: "#DBEAFE",
          width: 4,
        },
        gapcursor: false,
        history: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return "Press '/' for commands, or '++' for AI autocomplete...";
        },
        includeChildren: true,
      }),
      Typography,
      SlashCommand,
      CustomKeymap,
      TiptapUnderline,
      Markdown.configure({
        breaks: true,
      }),
      TextStyle,
      /*       Highlight.configure({
        multicolor: true,
      }), */
      DragAndDrop,
      History,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: defaultValue,
    editorProps: {
      ...defaultEditorProps,
      attributes: {
        class:
          "max-w-full prose dark:prose-invert prose-sm sm:prose-xs lg:prose-sm xl:prose-sm m-2 focus:outline-none prose-headings:font-title font-default",
      },
    },
    onUpdate: (e) => {
      const selection = e.editor.state.selection;
      const lastTwo = getPrevText(e.editor, {
        chars: 2,
      });
      if (lastTwo === "++" && !isLoading) {
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });
        complete(
          getTextAroundCursor(e.editor, {
            chars: 1500,
          })
        );
      } else {
        // Call the debounced save function to save to local storage
        //debouncedSaveToLocalStorage();
      }
    },
  });

  // AI Autocomplete
  const { complete, completion, isLoading, stop } = useCompletion({
    id: "govaiq",
    api: "/api/autocomplete",
    onFinish: (_prompt, completion) => {
      // highlight the completion
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: (err) => {
      //console.log("Error");
      /* if (err.message === "You have reached your request limit for the day.") {
        va.track("Rate Limit Reached");
      } */
    },
  });

  const prev = useRef("");

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
    prev.current = completion;
    editor?.commands.insertContent(diff);
  }, [isLoading, editor, completion]);

  useEffect(() => {
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
        stop();
        if (e.key === "Escape") {
          editor?.commands.deleteRange({
            from: editor.state.selection.from - completion.length,
            to: editor.state.selection.from,
          });
        }
        editor?.commands.insertContent("++");
      }
    };
    const mousedownHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
      if (window.confirm("AI writing paused. Continue?")) {
        complete(editor?.getText() || "");
      }
    };
    if (isLoading) {
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("mousedown", mousedownHandler);
    } else {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    };
  }, [stop, isLoading, editor, complete, completion.length]);

  /*   // Function to handle replace text with command center choice
  function replaceTextInRange(
    editor: Editor,
    range: { from: number; to: number },
    newText: string
  ) {
    const { from, to } = range;

    // Split the newText at each occurrence of '\n\n'
    const segments = newText.split("\n\n");
    const nodes: Node[] = [];

    segments.forEach((segment, index) => {
      // Add a text node for each segment
      nodes.push(editor.schema.text(segment));

      // Insert two hardBreak nodes between segments, except after the last segment
      if (index < segments.length - 1) {
        nodes.push(editor.schema.nodes.hardBreak.create());
        nodes.push(editor.schema.nodes.hardBreak.create()); // Extra hardBreak for more space
      }
    });

    // Create a document fragment from the nodes
    const fragment = Fragment.fromArray(nodes);

    // Begin a transaction to replace text with the new fragment
    editor.view.dispatch(editor.state.tr.replaceWith(from, to, fragment));

    // Calculate the new end position for the selection
    const newTo = from + fragment.size;
    editor.commands.setTextSelection({ from, to: newTo });
  } */

  /*   // Handle edit choice and close CommandCenter
  useEffect(() => {
    if (editChoice && selectionRange && editor) {
      replaceTextInRange(editor, selectionRange, editChoice);

      // Close the CommandCenter once the text is replaced
      setCommandOpen(false); // Set commandOpen to false to close the CommandCenter

      // Clear the selection and context
      //setSelectionRange(null); // Clear the selection after replacing
      setCommandContext("");
      setEditChoice("");
    }
  }, [
    editChoice,
    selectionRange,
    editor,
    setCommandOpen,
    setCommandContext,
    setEditChoice,
  ]); */

  /*   if (content === null) {
    return <div>Loading...</div>;
  } */

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
    >
      {editor && (
        <EditorBubbleMenu
          editor={editor}
          /* expandDetail={setExpandDetail} */
          commandContext={setCommandContext}
          setSelectionRange={setSelectionRange}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default JDWriter;
