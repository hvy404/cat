"use server";
import { Client } from "@hubspot/api-client";

interface DemoRequestFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
}

export async function submitDemoRequest(formData: DemoRequestFormData) {
  const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_DEMO_REQUEST });

  try {
    const response = await hubspotClient.apiRequest({
      method: 'POST',
      path: `/marketing/v3/forms/23635143/8ce1c2d7-717b-4d04-bc5e-de7f0b1487b5/submissions`,
      body: {
        fields: [
          { name: 'firstname', value: formData.firstName },
          { name: 'lastname', value: formData.lastName },
          { name: 'company', value: formData.companyName },
          { name: 'email', value: formData.email },
        ],
      },
    });

    console.log("HubSpot API Response:", response);
    return { success: true, message: "Demo request submitted successfully" };
  } catch (error) {
    console.error("Error submitting demo request:", error);
    return { success: false, message: "Failed to submit demo request" };
  }
}
