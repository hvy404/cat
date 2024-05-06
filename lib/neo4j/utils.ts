/**
 * Executes a write operation in Neo4j using the provided Cypher query and parameters.
 * Having dynamic parameters is optional.
 * @param cypher - The Cypher query to execute.
 * @param params - The parameters to pass to the Cypher query.
 * @returns A Promise that resolves to an array of result values.
 */

import neo4j from "neo4j-driver";

// Neo driver
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
);

// lib/neo4j.js
export async function read(cypher: string, params = {}) {
  // 1. Open a session
  const session = driver.session();

  try {
    // 2. Execute a Cypher Statement
    const res = await session.executeRead((tx) => tx.run(cypher, params));

    // 3. Process the Results
    const values = res.records.map((record) => record.toObject());

    return values;
  } finally {
    // 4. Close the session
    await session.close();
  }
}

/* export async function write(cypher: string, params = {}) {
  // 1. Open a session
  const session = driver.session();

  try {
    // 2. Execute a Cypher Statement
    const res = await session.executeWrite((tx) => tx.run(cypher, params));

    // 3. Process the Results
    const values = res.records.map((record) => record.toObject());

    return values;
  } finally {
    // 4. Close the session
    await session.close();
  }
}
 */

// Better errror propagation
export async function write(cypher: string, params = {}) {
  const session = driver.session();
  try {
    const res = await session.executeWrite((tx) => tx.run(cypher, params));
    return res.records.map((record) => record.toObject());
  } catch (error) {
    // Handle or log the error
    console.error("Error executing write operation in Neo4j:", error);
  
    // Optionally rethrow or return an error object
    throw error;  // or return { success: false, error: error.message };
  } finally {
    await session.close();
  }
}
