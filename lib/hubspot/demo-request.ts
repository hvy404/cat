"use server";

interface DemoRequestFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
}

export async function submitDemoRequest(formData: DemoRequestFormData) {
  const url =
    "https://api.hsforms.com/submissions/v3/integration/secure/submit/23635143/8ce1c2d7-717b-4d04-bc5e-de7f0b1487b5";

  const payload = {
    fields: [
      { name: "firstname", value: formData.firstName },
      { name: "lastname", value: formData.lastName },
      { name: "company", value: formData.companyName },
      { name: "email", value: formData.email },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUBSPOT_DEMO_REQUEST}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: "We've received your demo request!" };
  } catch (error) {
    console.error("Error submitting demo request:", error);
    return { success: false, message: "Failed to submit demo request" };
  }
}
