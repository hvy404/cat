"use server";
import { write, read } from "@/lib/neo4j/utils";
import { Integer, RecordShape } from "neo4j-driver";

// Define interface for Company data structure
export interface CompanyNode {
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
  admin: string[];
  manager?: string[];
}

export interface NodeWithId {
  labels: string[];
  _id: number;
  customId?: string;
}

/* CRUD - Create operation for Company node */
/**
 * Creates a new Company node in the database.
 *
 * @param {CompanyNode} companyData - The data for the company to be created.
 * @returns {Promise<(CompanyNode & NodeWithId) | null>} - The created company node with its properties and labels, or null if creation failed.
 *
 * @example
 * const newCompany = {
 *   id: "123",
 *   name: "Example Corp",
 *   industry: "Technology",
 *   size: "500-1000",
 *   foundedYear: 2010,
 *   website: "https://example.com",
 *   description: "An example company",
 *   admin: ["admin1"]
 * };
 *
 * const createdCompany = await createCompanyNode(newCompany);
 * console.log(createdCompany);
 */
export async function createCompanyNode(
  companyData: CompanyNode
): Promise<(CompanyNode & NodeWithId) | null> {
  const query = `
      CREATE (c:Company $companyData)
      RETURN c, ID(c) as nodeId
    `;

  const serializedData = {
    ...companyData,
    admin: companyData.admin || [],
    manager: companyData.manager || [],
  };

  try {
    const result = await write(query, { companyData: serializedData });
    if (result && result.length > 0) {
      const createdNode = result[0].c;
      const nodeId = result[0].nodeId;
      return {
        ...createdNode.properties,
        labels: ["Company"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };
    }
    return null;
  } catch (error) {
    console.error("Error creating new Company node:", error);
    throw error;
  }
}

/* CRUD - Read operation for Company node */
/**
 * Retrieves a Company node from the database by its ID.
 *
 * @param {string} companyId - The ID of the company to retrieve.
 * @returns {Promise<(CompanyNode & NodeWithId) | null>} - The retrieved company node with its properties and labels, or null if not found.
 *
 * @example
 * const companyId = "123";
 * const company = await getCompanyNode(companyId);
 * console.log(company);
 */
export async function getCompanyNode(
  companyId: string
): Promise<(CompanyNode & NodeWithId) | null> {
  const query = `
        MATCH (c:Company {id: $companyId})
        RETURN c, ID(c) as nodeId
      `;

  try {
    const result = await read(query, { companyId });
    if (result && result.length > 0) {
      const companyNode = result[0].c.properties;
      const nodeId = result[0].nodeId;

      const serializedNode: Partial<CompanyNode> = {};

      (Object.keys(companyNode) as Array<keyof CompanyNode>).forEach((key) => {
        const value = companyNode[key];
        if (value instanceof Integer) {
          serializedNode[key] = value.toNumber() as any;
        } else if (typeof value === "object" && value !== null) {
          serializedNode[key] = JSON.parse(JSON.stringify(value));
        } else {
          serializedNode[key] = value as any;
        }
      });

      // Ensure all required properties are present
      if (!serializedNode.id || !serializedNode.name || !serializedNode.admin) {
        throw new Error(
          "Retrieved company data is missing required properties"
        );
      }

      const finalNode: CompanyNode & NodeWithId = {
        ...(serializedNode as CompanyNode),
        labels: ["Company"],
        _id: nodeId instanceof Integer ? nodeId.toNumber() : nodeId,
      };

      return finalNode;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving Company node:", error);
    throw error;
  }
}

/* CRUD - Update operation for Company node */
/**
 * Updates properties of a Company node in the database.
 *
 * @param {string} companyId - The ID of the company to update.
 * @param {Partial<CompanyNode>} properties - The properties to update.
 * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
 *
 * @example
 * const companyId = "123";
 * const updatedProperties = {
 *   name: "Updated Corp",
 *   website: "https://updated.com"
 * };
 * const isUpdated = await updateCompanyProperties(companyId, updatedProperties);
 * console.log(isUpdated);
 */
export async function updateCompanyProperties(
  companyId: string,
  properties: Partial<CompanyNode>
): Promise<boolean> {
  const query = `
      MATCH (c:Company {id: $companyId})
      SET c += $properties
      RETURN c
    `;

  try {
    const result = await write(query, { companyId, properties });
    return result && result.length > 0;
  } catch (error) {
    console.error("Error updating Company properties:", error);
    throw error;
  }
}

/* CRUD - Delete operation for Company node */
/**
 * Deletes a Company node from the database by its ID.
 *
 * @param {string} companyId - The ID of the company to delete.
 * @returns {Promise<boolean>} - True if the deletion was successful, false otherwise.
 *
 * @example
 * const companyId = "123";
 * const isDeleted = await deleteCompanyNode(companyId);
 * console.log(isDeleted);
 */
export async function deleteCompanyNode(companyId: string): Promise<boolean> {
  const query = `
      MATCH (c:Company {id: $companyId})
      DETACH DELETE c
      RETURN count(c) AS deletedCount
    `;

  try {
    const result = await write(query, { companyId });
    return result && result[0] && result[0].deletedCount > 0;
  } catch (error) {
    console.error("Error deleting Company node:", error);
    throw error;
  }
}

/* Utility function to search for Companies based on criteria */
/**
 * Searches for Companies based on specified criteria.
 *
 * @param {Partial<CompanyNode>} criteria - The criteria to search for.
 * @returns {Promise<(CompanyNode & NodeWithId)[]>} - An array of matching company nodes with their properties and labels.
 *
 * @example
 * const searchCriteria = { industry: "Technology" };
 * const companies = await searchCompanies(searchCriteria);
 * console.log(companies);
 */
export async function searchCompanies(
  criteria: Partial<CompanyNode>
): Promise<(CompanyNode & NodeWithId)[]> {
  let whereClause = Object.entries(criteria)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `c.${key} =~ '(?i).*${value}.*'`; // Case-insensitive partial match for strings
      } else {
        return `c.${key} = $${key}`;
      }
    })
    .join(" AND ");

  const query = `
      MATCH (c:Company)
      WHERE ${whereClause}
      RETURN c, ID(c) as nodeId
    `;

  try {
    const result = await read(query, criteria);
    return result.map((record: any) => ({
      ...record.c.properties,
      labels: ["Company"],
      _id:
        record.nodeId instanceof Integer
          ? record.nodeId.toNumber()
          : record.nodeId,
    }));
  } catch (error) {
    console.error("Error searching for Companies:", error);
    throw error;
  }
}

/* Utility function to get Companies by industry */
/**
 * Retrieves Companies by their industry.
 *
 * @param {string} industry - The industry to filter by.
 * @returns {Promise<(CompanyNode & NodeWithId)[]>} - An array of company nodes in the specified industry with their properties and labels.
 *
 * @example
 * const industry = "Technology";
 * const companies = await getCompaniesByIndustry(industry);
 * console.log(companies);
 */
export async function getCompaniesByIndustry(
  industry: string
): Promise<(CompanyNode & NodeWithId)[]> {
  const query = `
    MATCH (c:Company {industry: $industry})
    RETURN c, ID(c) as nodeId
  `;

  try {
    const result = await read(query, { industry });
    return result.map((record: any) => ({
      ...record.c.properties,
      labels: ["Company"],
      _id:
        record.nodeId instanceof Integer
          ? record.nodeId.toNumber()
          : record.nodeId,
    }));
  } catch (error) {
    console.error("Error getting Companies by industry:", error);
    throw error;
  }
}

/* Utility function to get company count by various criteria */
/**
 * Gets the count of Companies based on various criteria.
 *
 * @param {Object} criteria - The criteria to filter by.
 * @param {string} [criteria.byIndustry] - The industry to filter by.
 * @param {string} [criteria.bySize] - The size to filter by.
 * @param {number} [criteria.byFoundedYear] - The founded year to filter by.
 * @returns {Promise<number>} - The count of companies matching the criteria.
 *
 * @example
 * const countCriteria = { byIndustry: "Technology" };
 * const companyCount = await getCompanyCount(countCriteria);
 * console.log(companyCount);
 */
export async function getCompanyCount(criteria: {
  byIndustry?: string;
  bySize?: string;
  byFoundedYear?: number;
}): Promise<number> {
  let whereClause = [];
  if (criteria.byIndustry) whereClause.push("c.industry = $industry");
  if (criteria.bySize) whereClause.push("c.size = $size");
  if (criteria.byFoundedYear) whereClause.push("c.foundedYear = $foundedYear");

  const query = `
    MATCH (c:Company)
    ${whereClause.length > 0 ? "WHERE " + whereClause.join(" AND ") : ""}
    RETURN count(c) as companyCount
  `;

  try {
    const result = await read(query, {
      industry: criteria.byIndustry,
      size: criteria.bySize,
      foundedYear: criteria.byFoundedYear,
    });
    return result[0].companyCount.low;
  } catch (error) {
    console.error("Error getting company count:", error);
    throw error;
  }
}

/* Utility function to add an admin to a Company */
/**
 * Adds an admin to a Company node.
 *
 * @param {string} companyId - The ID of the company.
 * @param {string} adminId - The ID of the admin to add.
 * @returns {Promise<boolean>} - True if the admin was added successfully, false otherwise.
 *
 * @example
 * const companyId = "123";
 * const adminId = "admin2";
 * const isAdminAdded = await addCompanyAdmin(companyId, adminId);
 * console.log(isAdminAdded);
 */
export async function addCompanyAdmin(
  companyId: string,
  adminId: string
): Promise<boolean> {
  const query = `
      MATCH (c:Company {id: $companyId})
      SET c.admin = CASE
        WHEN NOT $adminId IN c.admin THEN c.admin + $adminId
        ELSE c.admin
      END
      RETURN c
    `;

  try {
    const result = await write(query, { companyId, adminId });
    return result && result.length > 0;
  } catch (error) {
    console.error("Error adding admin to Company:", error);
    throw error;
  }
}

/* Utility function to remove an admin from a Company */
/**
 * Removes an admin from a Company node.
 *
 * @param {string} companyId - The ID of the company.
 * @param {string} adminId - The ID of the admin to remove.
 * @returns {Promise<boolean>} - True if the admin was removed successfully, false otherwise.
 *
 * @example
 * const companyId = "123";
 * const adminId = "admin1";
 * const isAdminRemoved = await removeCompanyAdmin(companyId, adminId);
 * console.log(isAdminRemoved);
 */
export async function removeCompanyAdmin(
  companyId: string,
  adminId: string
): Promise<boolean> {
  const query = `
      MATCH (c:Company {id: $companyId})
      SET c.admin = [x IN c.admin WHERE x <> $adminId]
      RETURN c
    `;

  try {
    const result = await write(query, { companyId, adminId });
    return result && result.length > 0;
  } catch (error) {
    console.error("Error removing admin from Company:", error);
    throw error;
  }
}

/* Utility function to add a manager to a Company */
/**
 * Adds a manager to a Company node.
 *
 * @param {string} companyId - The ID of the company.
 * @param {string} managerId - The ID of the manager to add.
 * @returns {Promise<boolean>} - True if the manager was added successfully, false otherwise.
 *
 * @example
 * const companyId = "123";
 * const managerId = "manager1";
 * const isManagerAdded = await addCompanyManager(companyId, managerId);
 * console.log(isManagerAdded);
 */
export async function addCompanyManager(
  companyId: string,
  managerId: string
): Promise<boolean> {
  const query = `
      MATCH (c:Company {id: $companyId})
      SET c.manager = CASE
        WHEN c.manager IS NULL THEN [$managerId]
        WHEN NOT $managerId IN c.manager THEN c.manager + $managerId
        ELSE c.manager
      END
      RETURN c
    `;

  try {
    const result = await write(query, { companyId, managerId });
    return result && result.length > 0;
  } catch (error) {
    console.error("Error adding manager to Company:", error);
    throw error;
  }
}

/* Utility function to remove a manager from a Company */
/**
 * Removes a manager from a Company node.
 *
 * @param {string} companyId - The ID of the company.
 * @param {string} managerId - The ID of the manager to remove.
 * @returns {Promise<boolean>} - True if the manager was removed successfully, false otherwise.
 *
 * @example
 * const companyId = "123";
 * const managerId = "manager1";
 * const isManagerRemoved = await removeCompanyManager(companyId, managerId);
 * console.log(isManagerRemoved);
 */
export async function removeCompanyManager(
  companyId: string,
  managerId: string
): Promise<boolean> {
  const query = `
      MATCH (c:Company {id: $companyId})
      SET c.manager = CASE
        WHEN c.manager IS NOT NULL THEN [x IN c.manager WHERE x <> $managerId]
        ELSE null
      END
      RETURN c
    `;

  try {
    const result = await write(query, { companyId, managerId });
    return result && result.length > 0;
  } catch (error) {
    console.error("Error removing manager from Company:", error);
    throw error;
  }
}
