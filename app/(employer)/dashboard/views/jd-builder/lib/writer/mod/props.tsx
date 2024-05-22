import { EditorProps } from "@tiptap/pm/view";

/**
 * Default props for the editor component.
 */
export const defaultEditorProps: EditorProps = {
  handleDOMEvents: {
    /**
     * Event handler for keydown events.
     * Prevents default event listeners from firing when slash command is active.
     * @param _view - The editor view.
     * @param event - The keydown event.
     * @returns Whether the event was handled.
     */

    keydown: (_view, event) => {
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        const slashCommand = document.querySelector("#slash-command");
        if (slashCommand) {
          return true;
        }
      }
    },
  },
  /**
   * Event handler for paste events.
   * Prevents default paste behavior and performs custom logic.
   * @param view - The editor view.
   * @param event - The paste event.
   * @returns Whether the event was handled.
   */
  handlePaste: (view, event) => {
    if (
      event.clipboardData &&
      event.clipboardData.files &&
      event.clipboardData.files[0]
    ) {
      event.preventDefault();
      const file = event.clipboardData.files[0];
      const pos = view.state.selection.from;

      /* startImageUpload(file, view, pos); */
      return true;
    }
    return false;
  },

  /**
   * Event handler for drop events.
   * Prevents default drop behavior and performs custom logic.
   * @param view - The editor view.
   * @param event - The drop event.
   * @param _slice - The dropped slice.
   * @param moved - Whether the content was moved or copied.
   * @returns Whether the event was handled.
   */

  handleDrop: (view, event, _slice, moved) => {
    if (
      !moved &&
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files[0]
    ) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      const coordinates = view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });
      // here we deduct 1 from the pos or else the image will create an extra node
      /* startImageUpload(file, view, coordinates?.pos || 0 - 1); */
      return true;
    }
    return false;
  },
};
