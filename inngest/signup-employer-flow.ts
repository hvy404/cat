import { inngest } from "@/lib/inngest/client";
import { addNewEmployerToDB } from "@/lib/employer/new-account-flow/add-to-db";

/**
 * Handles the employer signup process.
 * @param event - The event triggering the function.
 * @param step - The step in the function execution.
 * @returns A promise that resolves to an object indicating the success of the operation.
 */
export const employerSignupHandler = inngest.createFunction(
  { id: "handle-employer-signup" },
  { event: "app/employer-signed-up" },
  async ({ event, step }) => {
    const result = await step.run("Log employer signup", async () => {
      console.log("New employer signed up with ID:", event.data.employerId);

      const addUser = await addNewEmployerToDB({
        employer_id: event.data.employerId,
        contact_email: event.data.email,
      });

      if (!addUser.success) {
        console.error("Error adding new employer to database:", addUser.error);
        throw new Error(
          `Failed to add employer to database: ${addUser.message}`
        );
      }

      return { success: true };
    });

    // You can add more logic here, such as:
    // - Sending a welcome email
    // - Creating default settings for the employer
    // - Triggering any necessary backend processes
    return result;
  }
);
