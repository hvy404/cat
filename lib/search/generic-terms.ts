"use server";

// Tuple: ["Role", "Qualifier"]
const genericRoles: [string, string][] = [
  ["engineer", "software"],
  ["developer", "web"],
  ["designer", "user interface"],
  ["analyst", "business"],
  ["manager", "project"],
  ["coordinator", "event"],
  ["specialist", "marketing"],
  ["consultant", "management"],
  ["technician", "IT"],
  ["assistant", "administrative"],
  ["associate", "research"],
  ["director", "creative"],
  ["administrator", "system"],
  ["supervisor", "shift"],
  ["officer", "compliance"],
  ["planner", "urban"],
  ["advisor", "financial"],
  ["strategist", "digital"],
  ["researcher", "market"],
  ["scientist", "data"],
  ["operator", "machine"],
  ["representative", "customer service"],
  ["agent", "real estate"],
  ["trainer", "corporate"],
  ["architect", "solutions"],
  ["executive", "chief"],
  ["lead", "team"],
  ["expert", "subject matter"],
  ["educator", "special needs"],
  ["programmer", "full-stack"],
  ["controller", "air traffic"],
  ["technologist", "medical"],
  ["therapist", "physical"],
  ["clerk", "data entry"],
  ["editor", "content"],
  ["writer", "technical"],
  ["producer", "film"],
  ["inspector", "quality control"],
  ["investigator", "private"],
  ["facilitator", "group"],
  ["liaison", "community"],
  ["conductor", "orchestra"],
  ["counselor", "career"],
  ["curator", "museum"],
  ["superintendent", "construction"],
  ["coach", "life"],
  ["advocate", "patient"],
  ["practitioner", "medical"],
  ["apprentice", "electrical"],
  ["intern", "marketing"],
  ["partner", "business"],
  ["secretary", "executive"],
  ["trader", "stock"],
  ["auditor", "internal"],
  ["handler", "baggage"],
  ["installer", "solar panel"],
  ["fabricator", "metal"],
  ["dispatcher", "emergency"],
  ["estimator", "construction"],
  ["examiner", "insurance"],
  ["interpreter", "sign language"],
  ["mediator", "conflict resolution"],
  ["navigator", "maritime"],
  ["patron", "arts"],
  ["recruiter", "talent"],
  ["surveyor", "land"],
  ["tester", "software"],
  ["translator", "language"],
  ["underwriter", "insurance"],
  ["wholesaler", "produce"],
  ["chef", "executive"],
  ["teacher", "elementary"],
  ["driver", "delivery"],
  ["artist", "graphic"],
  ["nurse", "registered"],
  ["mechanic", "automotive"],
  ["photographer", "wildlife"],
  ["pilot", "commercial"],
  ["lawyer", "corporate"],
  ["banker", "investment"],
  ["sales", "account"],
  ["instructor", "fitness"],
  ["security", "cyber"],
  ["baker", "pastry"],
  ["stylist", "hair"],
  ["contractor", "general"],
  ["attendant", "flight"],
  ["host", "restaurant"],
  ["guide", "tour"],
  ["laborer", "construction"],
  ["broadcaster", "sports"],
  ["buyer", "retail"],
  ["farmer", "organic"],
  ["librarian", "digital"],
  ["merchant", "e-commerce"],
  ["performer", "street"],
  ["publisher", "book"],
  ["realtor", "commercial"],
  ["reporter", "investigative"],
  ["tutor", "online"],
  ["veterinarian", "exotic animal"],
  ["ambassador", "brand"],
  ["collector", "art"],
  ["commissioner", "police"],
  ["courier", "bike"],
  ["custodian", "museum"],
  ["entertainer", "children's"],
  ["influencer", "social media"],
  ["mentor", "youth"],
  ["moderator", "online forum"],
  ["promoter", "event"],
  ["referee", "sports"],
  ["regulator", "financial"],
];

function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Determines if a given query string represents a generic role based on a list of known generic roles and qualifiers.
 *
 * @param query - The query string to check.
 * @param threshold - The maximum Levenshtein distance between the query and a known role to consider it a match. Defaults to 2.
 * @returns An object with the following properties:
 *   - `isGeneric`: `true` if the query matches a known generic role, `false` otherwise.
 *   - `role`: The matched generic role, if any.
 *   - `qualifier`: The matched qualifier for the generic role, if any.
 */
export async function isGenericRole(
  query: string,
  threshold: number = 2
): Promise<{ isGeneric: boolean; role?: string; qualifier?: string }> {
  const lowercaseQuery = query.toLowerCase();
  for (const [role, qualifier] of genericRoles) {
    const distance = levenshteinDistance(lowercaseQuery, role.toLowerCase());
    if (distance <= threshold) {
      return Promise.resolve({ isGeneric: true, role, qualifier });
    }
  }
  return Promise.resolve({ isGeneric: false });
}
