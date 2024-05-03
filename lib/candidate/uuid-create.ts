import { v4 as uuidv4 } from "uuid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import base32Encode from 'base32-encode';


interface IdentityUUID {
  newUUID: string;
  newFingerprint: string;
  finger32: string;
}

export async function getIdentityUUID(): Promise<IdentityUUID> {
  // Change return type to IdentityUUID
  // Check if the UUID exists in the session storage
  const existingUUID = sessionStorage.getItem("gate");
  const existingFingerprint = sessionStorage.getItem("gate-access");

  const buffer = existingUUID ? Buffer.from(existingUUID.replace(/-/g, ''), 'hex') : null;
  const fingerprint32 = buffer ? base32Encode(buffer, 'RFC4648', { padding: false }) : null;

  if (existingUUID && existingFingerprint && fingerprint32) {
    return { newUUID: existingUUID, newFingerprint: existingFingerprint, finger32: fingerprint32 }; // Return empty fingerprint or fetch if needed
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

  // Generate a base32 encoded string from the UUID
  const uuidBuffer = Buffer.from(newUUID.replace(/-/g, ''), 'hex');
  const finger32 = base32Encode(uuidBuffer, 'RFC4648', { padding: false });

  // Store the new UUID in session storage
  sessionStorage.setItem("gate", newUUID);
  sessionStorage.setItem("gate-public-code", newFingerprint);

  return { newUUID, newFingerprint, finger32 };
}

export default getIdentityUUID;
