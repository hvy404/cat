"use server";

const genericRoles = [
  "engineer",
  "developer",
  "designer",
  "analyst",
  "manager",
  "coordinator",
  "specialist",
  "consultant",
  "technician",
  "assistant",
  "associate",
  "director",
  "administrator",
  "supervisor",
  "officer",
  "planner",
  "advisor",
  "strategist",
  "researcher",
  "scientist",
  "operator",
  "representative",
  "agent",
  "trainer",
  "architect",
  "executive",
  "lead",
  "expert",
  "educator",
  "programmer",
  "controller",
  "technologist",
  "therapist",
  "clerk",
  "editor",
  "writer",
  "producer",
  "inspector",
  "investigator",
  "facilitator",
  "liaison",
  "conductor",
  "counselor",
  "curator",
  "superintendent",
  "coach",
  "advocate",
  "practitioner",
  "apprentice",
  "intern",
  "partner",
  "secretary",
  "trader",
  "auditor",
  "handler",
  "installer",
  "fabricator",
  "dispatcher",
  "estimator",
  "examiner",
  "interpreter",
  "mediator",
  "navigator",
  "patron",
  "recruiter",
  "surveyor",
  "tester",
  "translator",
  "underwriter",
  "wholesaler",
  "chef",
  "teacher",
  "driver",
  "artist",
  "nurse",
  "mechanic",
  "photographer",
  "pilot",
  "lawyer",
  "banker",
  "sales",
  "instructor",
  "security",
  "baker",
  "stylist",
  "contractor",
  "attendant",
  "host",
  "guide",
  "laborer",
  "broadcaster",
  "buyer",
  "farmer",
  "librarian",
  "merchant",
  "performer",
  "publisher",
  "realtor",
  "reporter",
  "tutor",
  "veterinarian",
  "ambassador",
  "collector",
  "commissioner",
  "courier",
  "custodian",
  "entertainer",
  "influencer",
  "mentor",
  "moderator",
  "promoter",
  "referee",
  "regulator",
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

export async function isGenericRole(query: string, threshold: number = 2): Promise<boolean> {
    const lowercaseQuery = query.toLowerCase();
    return Promise.resolve(genericRoles.some((role) => {
      const distance = levenshteinDistance(lowercaseQuery, role.toLowerCase());
      return distance <= threshold;
    }));
  }
  