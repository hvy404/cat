"use client";
import { useEffect, useRef, useState } from "react";
import useStore from "@/app/state/useStore";
import { defaultEditorProps } from "./mod/props";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { useCompletion } from "ai/react";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { EditorBubbleMenu } from "./mod/bubble-menu";
import { getPrevText } from "./mod/get-prev-text";
import { getTextAroundCursor } from "./mod/cursor-surrounding";
import { RetreiveGeneratedJD } from "./hooks/retreive-generated-jd";
import { syncWriter, restoreWriter } from "./hooks/content-sync";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { publishDraftJD } from "@/lib/jd-builder/connector/publish"; // Send draft job description to upload process
import { v4 as uuidv4 } from "uuid";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";

/* Extensions */
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import History from "@tiptap/extension-history";
import TiptapUnderline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import SlashCommand from "./extensions/slash-command";
import Placeholder from "@tiptap/extension-placeholder";
import CustomKeymap from "./extensions/custom-keymap";
import DragAndDrop from "./extensions/drag-and-drop";

/* Confirm Upload */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const JDWriter = () => {
  // Get state from the store
  const {
    user,
    jdBuilderWizard,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
    setSelectedMenuItem,
    setAddJD,
  } = useStore();

  // useState to manage the default value
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [generatedJobDescriptionID, setGeneratedJobDescriptionID] =
    useState("");

  //const [expandDetail, setExpandDetail] = useState(""); // State for expanded detail
  //const [commandOpen, setCommandOpen] = useState(false); // State for command center
  //const [commandContext, setCommandContext] = useState(""); // State for command context
  //const [editChoice, setEditChoice] = useState(""); // State for edit choice

  const [selectionRange, setSelectionRange] = useState<{
    from: number;
    to: number;
  } | null>(null); // State for selection range

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "leading-7",
          },
        },
        bulletList: {
          itemTypeName: "listItem",
          HTMLAttributes: {
            class: "list-disc list-outside leading-2 -mt-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside leading-2 -mt-2",
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
      DragAndDrop,
      History,
    ],
    editorProps: {
      ...defaultEditorProps,
      attributes: {
        class:
          "max-w-full max-h-[65vh] overflow-auto prose dark:prose-invert prose-sm sm:prose-xs lg:prose-sm xl:prose-sm m-2 focus:outline-none prose-headings:font-title font-default",
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
        debouncedSaveToLocalStorage();
        //console log the content of the ditor
        //console.log(e.editor.getHTML());
      }
    },
  });

  // Fetch content. User modified content is fetched first, if not available, then generated content is fetched
  useEffect(() => {
    const jobDescriptionId = jdBuilderWizard.jobDescriptionId;

    const restoreAndFetchJD = async () => {
      if (!jobDescriptionId) return;

      let isRestorationSuccessful = false;

      try {
        // Attempt to restore content first
        const result = await restoreWriter(jobDescriptionId);
        if (result.success && result.data) {
          const parsedData = JSON.parse(result.data);

          //console.log("parsedData", parsedData);
          // Check if parsedData is not null and editor instance exists
          if (editor && parsedData && Object.keys(parsedData).length > 0) {
            editor.commands.setContent(parsedData);
            isRestorationSuccessful = true; // Mark restoration as successful
          }
        }
      } catch (error) {
        console.error("Failed to restore content", error);
      }

      // Fetch new content if restoration was not successful
      if (!isRestorationSuccessful) {
        try {
          const content = await RetreiveGeneratedJD(jobDescriptionId);
          if (content) {
            // Ensure editor instance exists before setting content
            if (editor) {
              editor.commands.setContent(content);
            }
          }
        } catch (error) {
          //console.error("Failed to fetch job description", error);
        }
      }
    };

    restoreAndFetchJD();
  }, [jdBuilderWizard.jobDescriptionId, editor]);

  // Function to save to local storage
  const saveWorkingBackup = async () => {
    if (editor) {
      const jsonContent = JSON.stringify(editor.getJSON());

      setIsBackingUp(true);

      try {
        const result = await syncWriter(
          jdBuilderWizard.jobDescriptionId!,
          jsonContent
        );
      } catch (error) {
        //console.error("Failed to sync content", error); // Capture any errors thrown
      }
    } else {
      //console.log("Editor instance not found"); // Check if editor instance exists
    }

    setTimeout(() => {
      setIsBackingUp(false);
    }, 3000);
  };

  // Debounce the save to local storage
  const debouncedSaveToLocalStorage = useDebouncedCallback(async () => {
    saveWorkingBackup();
  }, 10000); // Debounce for 10 seconds

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

  // Function to handle publish. Grab text from the editor and send it to publishDraftJD
  const handlePublishJD = async () => {
    const sessionID = uuidv4();
    if (editor && sessionID && jdBuilderWizard.jobDescriptionId && user?.uuid) {
      setIsPublishing(true);
      const currentEditorContent = JSON.stringify(editor.getText());
      const result = await publishDraftJD(user?.uuid, currentEditorContent);

      if (!result.success) {
        console.error("Failed to publish JD", result.message);
        setIsPublishing(false);
        return;
      }
      if (result.success) {
        console.log("Published successfully", result.event);

        // Add 1.5 second delay
        setTimeout(() => {
          setJDBuilderWizard({
            ...jdBuilderWizard,
            sowParseRunnerID: result.event[0],
          });
        }, 1500);

        // Add generated job description ID -- publishDraftJD created the job description ID
        setGeneratedJobDescriptionID(result.jobID);
      }
    }
  };

  // Check status of the job description upload process and move to the next step
  useEffect(() => {
    if (!jdBuilderWizard.sowParseRunnerID) {
      return;
    }

    let isPollingActive = true; // This flag will control the active state of polling

    const polling = async () => {
      const runnerID = jdBuilderWizard.sowParseRunnerID;

      if (!runnerID) {
        return;
      }

      const status = await QueryEventStatus(runnerID);

      if (status === "Completed") {
        setIsPublishing(false);
        isPollingActive = false;

        // Redirect to the confirmation page
        // Set jdEntryID (which is th job ID entry in database)
        setAddJD({
          ...setAddJD,
          step: 2,
          jdEntryID: generatedJobDescriptionID,
          publishingRunnerID: null, // Ensure no background runner is active
        });

        // Clean up the wizard state
        setJDBuilderWizard({
          sowID: "",
          sowFile: [],
          sowParseRunnerID: "",
          jobDescriptionId: "",
          jdGenerationRunnerID: "",
          roleToGenerate: "",
          step: 1,
        });

        setSelectedMenuItem("add-job") // Move to the next step (add job)
      } else if (
        status === "Running" ||
        status === "Failed" ||
        status === "Cancelled"
      ) {
        setTimeout(polling, 3500);
      } else {
        // Log any unexpected status or errors
        //console.error(`Unexpected status received: ${status}`);
        isPollingActive = false;
      }
    };

    polling();

    // Cleanup function to stop polling when component unmounts or pollingStatus becomes true
    return () => {
      isPollingActive = false;
    };
  }, [jdBuilderWizard.sowParseRunnerID]);

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
    >
      <div className="flex flex-row justify-end items-center gap-4">
        <div>
          {isBackingUp ? (
            <>
              <Badge>
                <Loader className="h-4 w-4 animate-spin" />{" "}
                <span className="ml-2">Auto-saving</span>
              </Badge>
            </>
          ) : (
            <>
              <Badge variant={"outline"}>Autosave On</Badge>
            </>
          )}
        </div>
        <Dialog>
          <DialogTrigger>
            <Button variant="outline">Publish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Almost there! Your job post is being processed.</DialogTitle>
              <DialogDescription className="py-4">
                {isPublishing
                  ? "We're finalizing your job description. This typically takes 2-3 minutes. Once complete, you'll review and confirm all details before publishing."
                  : "Your job description will be processed. You will soon be redirected to a final step to confirm details before publishing."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {isPublishing ? (
                <Button variant="outline" disabled>
                  <div className="flex flex-row gap-2 items-center">
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                </Button>
              ) : (
                <Button onClick={handlePublishJD} variant="outline">
                  Start
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {editor && (
        <EditorBubbleMenu
          editor={editor}
          /* expandDetail={setExpandDetail} */
          /* commandContext={setCommandContext} */
          setSelectionRange={setSelectionRange}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default JDWriter;
