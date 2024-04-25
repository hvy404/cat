import { v4 as uuidv4 } from "uuid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface IdentityUUID {
  newUUID: string;
  newFingerprint: string;
}

export async function getIdentityUUID(): Promise<IdentityUUID> {
  // Change return type to IdentityUUID
  // Check if the UUID exists in the session storage
  const existingUUID = sessionStorage.getItem("gate");
  const existingFingerprint = sessionStorage.getItem("gate-access");
  if (existingUUID && existingFingerprint) {
    return { newUUID: existingUUID, newFingerprint: existingFingerprint }; // Return empty fingerprint or fetch if needed
  }

  // Initialize FingerprintJS
  const fpPromise = FingerprintJS.load();

  // Generate a new UUID based on device fingerprint
  const fp = await fpPromise;
  const result = await fp.get();
  const fingerprint = result.visitorId;

  // Create a new UUID
  const newUUID = uuidv4(); // Generate a new UUID for the fingerprint
  const newFingerprint = fingerprint;

  // Store the new UUID in session storage
  sessionStorage.setItem("gate", newUUID);
  sessionStorage.setItem("gate-public-code", newFingerprint);

  return { newUUID, newFingerprint };
}

export default getIdentityUUID;
