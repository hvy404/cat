type GuideSection = {
  title: string;
  content: (string | { subtitle: string; steps: string[] })[];
};

export const ResumeBuilderGuide: GuideSection[] = [
  {
    title: "Getting Started",
    content: [
      "To begin, locate the \"Available Items\" panel and the \"Resume\" panel on your screen.",
      "Drag a resume element from the \"Available Items\" panel into the \"Resume\" panel to add it to your resume."
    ]
  },
  {
    title: "AI Coach Review",
    content: [
      "When you add an item to your resume, our AI coach will automatically:",
      {
        subtitle: "",
        steps: [
          "Review its impact on the resume as a whole",
          "Evaluate how it optimizes your resume for the role you've selected"
        ]
      }
    ]
  },
  {
    title: "Editing Resume Items",
    content: [
      "To edit an item on your resume, click the \"Pencil\" icon on the right side of each card.",
      "Edited versions are specific to this resume and won't be saved globally to your account."
    ]
  },
  {
    title: "Custom Sections",
    content: [
      {
        subtitle: "",
        steps: [
          "Click \"Add Custom Section\" to create a new section for your resume.",
          "After creating a custom section, you can add custom items under it.",
          "Note: Custom sections are specific to this resume and not saved globally."
        ]
      }
    ]
  },
  {
    title: "Available Items",
    content: [
      "The \"Available Items\" panel contains all items extracted from your originally uploaded resume.",
      "These items are also managed within the \"Experience\", \"Education\", \"Personal\", and \"Certification\" tabs on the left side menu."
    ]
  },
  {
    title: "Removing Items",
    content: [
      "To remove an item from your resume, simply drag it out of the \"Resume\" panel."
    ]
  },
  {
    title: "Exporting Your Resume",
    content: [
      {
        subtitle: "",
        steps: [
          "Locate the \"Export Resume\" button on the right side control panel.",
          "Click this button to download your resume as a .docx file."
        ]
      }
    ]
  },
  {
    title: "Saving and Managing Resumes",
    content: [
      "You can save this resume version for later use when applying for opportunities.",
      "To set a default resume version to be sent to employers when matched with an opportunity:",
      {
        subtitle: "",
        steps: [
          "Go to your account settings",
          "Look for the option to set a default resume",
          "Select the desired resume version"
        ]
      }
    ]
  }
];