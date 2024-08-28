/**
 * Provides a Postmark API client for sending notifications.
 *
 * The Postmark API key is loaded from the `POSTMARK_API_KEY` environment variable.
 * If the API key is not set, an error will be thrown.
 */
import { ServerClient } from "postmark";

const postmarkApiKey = process.env.POSTMARK_API_KEY;

if (!postmarkApiKey) {
  throw new Error("POSTMARK_API_KEY environment variable is not set");
}

const postmarkClient = new ServerClient(postmarkApiKey);

export default postmarkClient;
