export type Company = {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  foundedYear?: number;
  website?: string;
  description?: string;
  headquarters?: {
    city?: string;
    state?: string;
    country?: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  contactEmail?: string;
  phoneNumber?: string;
  admin: string[]; // Array of UUID strings
  manager?: string[]; // Array of UUID strings, can be null
};

// Helper function to escape double quotes in strings
function escapeString(str: string = ""): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Generates a Cypher query string for creating a new company node in the database.
 * @param company - The company object containing the company details.
 * @returns The Cypher query string.
 */
export function generateCompanyCypherQuery(company: Company): string {
  const escapedCompany = Object.entries(company).reduce((acc, [key, value]) => {
    if (typeof value === "string") {
      acc[key] = escapeString(value);
    } else if (Array.isArray(value)) {
      acc[key] = JSON.stringify(value);
    } else if (typeof value === "object" && value !== null) {
      acc[key] = JSON.stringify(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  const companyProperties = {
    id: escapedCompany.id,
    name: escapedCompany.name,
    industry: escapedCompany.industry || null,
    size: escapedCompany.size || null,
    foundedYear: escapedCompany.foundedYear || null,
    website: escapedCompany.website || null,
    description: escapedCompany.description || null,
    headquarters: escapedCompany.headquarters || null,
    socialMedia: escapedCompany.socialMedia || null,
    contactEmail: escapedCompany.contactEmail || null,
    phoneNumber: escapedCompany.phoneNumber || null,
    admin: escapedCompany.admin,
    manager: escapedCompany.manager || null,
  };

  const propertyStrings = Object.entries(companyProperties).map(
    ([key, value]) => {
      if (typeof value === "string") {
        return `${key}: "${value}"`;
      } else if (value === null) {
        return `${key}: null`;
      } else {
        return `${key}: ${value}`;
      }
    }
  );

  let cypher = `
      MERGE (c:Company { id: "${escapedCompany.id}" })
      ON CREATE SET
        ${propertyStrings.join(",\n      ")}
      RETURN c;
    `;

  return cypher;
}

/* How to use this function:
  const newCompany: Company = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Acme Corp",
    industry: "Technology",
    admin: ["123e4567-e89b-12d3-a456-426614174001", "123e4567-e89b-12d3-a456-426614174002"],
    manager: ["123e4567-e89b-12d3-a456-426614174003"]
    // ... other fields
  };
  const cypherQuery = generateCompanyCypherQuery(newCompany);
  */

/* Access control
  Querying: Use Cypher's array operations to check for membership. For example:
cypherCopyMATCH (c:Company)
WHERE "123e4567-e89b-12d3-a456-426614174001" IN c.admin
RETURN c
 */
