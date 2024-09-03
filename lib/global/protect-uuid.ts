"use server";
import { createCipheriv, createDecipheriv } from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.UUID_OBFUSCATION_KEY || "", "utf-8");
const iv = Buffer.from(process.env.UUID_OBFUSCATION_IV || "", "utf-8");

if (key.length !== 32 || iv.length !== 16) {
  throw new Error("Invalid encryption key or IV length");
}

export async function obfuscateUUID(uuid: string): Promise<string> {
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(uuid, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function deobfuscateUUID(obfuscatedUUID: string): Promise<string> {
  const decipher = createDecipheriv(algorithm, key, iv);
  const paddedObfuscatedUUID =
    obfuscatedUUID.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (obfuscatedUUID.length % 4)) % 4);
  let decrypted = decipher.update(paddedObfuscatedUUID, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
