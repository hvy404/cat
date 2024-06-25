/**
 * Array of welcome messages for the job description builder.
 * These messages provide guidance and instructions to the user.
 */
const messages = [
  "Crafting the perfect job description is a breeze with our help. Upload your SOW/PWS and guide us as we work together to create a posting that attracts top talent.",
  "Looking to create a standout job posting? Simply upload your SOW/PWS and let us assist you in developing a compelling description that draws in the best candidates.",
];

export async function getWelcomeUploadMessage() {
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)]; // Randomly select a message
    return selectedMessage;
  }