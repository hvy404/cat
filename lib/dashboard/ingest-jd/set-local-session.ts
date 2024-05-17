/**
 * Sets the upload session ID in the session storage.
 * If a session already exists, it returns an error message.
 *
 * @param sessionID - The ID of the upload session.
 * @returns An object indicating the success of setting the upload session.
 */
export async function setUploadSession(sessionID: string) {
    const session = sessionStorage.getItem("hyperdrive");
    if (session) {
      return { success: false, message: "Session already exists" };
    }
  
    // Set the session ID in the session storage
    sessionStorage.setItem("hyperdrive", sessionID);
  
    return { success: true };
  }
  
  /**
   * Removes the "hyperdrive" item from the sessionStorage and returns a success object.
   * @returns A promise that resolves to an object with a "success" property set to true.
   */
  export async function closeUploadSession() {
    sessionStorage.removeItem("hyperdrive");
  
    return { success: true };
  }
  
  /**
   * Checks if there is an upload session stored in the session storage.
   * @returns {Promise<{ success: boolean, session?: string }>} An object indicating the success status and the session if available.
   */
  export async function checkUploadSession() {
    const session = sessionStorage.getItem("hyperdrive");
    if (session) {
      return { status: true, session: session };
    }
  
    return { status: false };
  }
  