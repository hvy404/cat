interface JobData {
    jobID?: string;
    jobTitle?: string;
    jobSummary?: string;
    employmentType?: string;
    applicationDeadline?: string;
    embedding?: number[];
    company?: string;
    department?: string;
    workLocation?: {
        remotePossible?: boolean;
        address?: string;
    };
    salaryRange?: {
        min?: number;
        max?: number;
    };
    securityClearance?: string;
    travelRequired?: boolean;
    compatibilityWithRemoteWork?: boolean;
    managementLevel?: {
        managementLevelDescription?: string;
        isManagement?: boolean;
    };
    jobDescription_id?: string;
    skills?: string[];
    responsibilities?: string[];
    requiredQualifications?: { qualification?: string, importance?: string }[];
    certifications?: string[];
    educationRequirements?: { level?: string, field?: string }[];
    experienceRequirements?: { years?: number, field?: string }[];
    complianceRequirements?: string[];
    potentialCandidateTraits?: { trait?: string, importance?: string }[];
}

// Helper function to format the embedding array
function formatArrayForCypher(array: number[]) {
    return `[${array.join(", ")}]`;  // Adds a space after each comma
  }

export function generateJobCypher(data: JobData): string {
    let cypher = `
CREATE (j:Job {
    jobID: "${data.jobDescription_id || 'N/A'}",
    jobTitle: "${(data.jobTitle || '').replace(/"/g, '\\"')}",
    jobSummary: "${(data.jobSummary || '').replace(/"/g, '\\"')}",
    employmentType: "${data.employmentType || 'N/A'}",
    applicationDeadline: "${data.applicationDeadline || 'N/A'}",
    embedding: ${data.embedding ? formatArrayForCypher(data.embedding) : "[]"},
    company: "${data.company || 'N/A'}",
    department: "${data.department || 'N/A'}",
    remotePossible: ${data.workLocation?.remotePossible || false},
    address: "${data.workLocation?.address || 'N/A'}",
    salaryMin: ${data.salaryRange?.min || 'null'},
    salaryMax: ${data.salaryRange?.max || 'null'},
    securityClearance: "${data.securityClearance || 'N/A'}",
    travelRequired: ${data.travelRequired || false},
    compatibilityWithRemoteWork: ${data.compatibilityWithRemoteWork || false},
    managementLevelDescription: "${data.managementLevel?.managementLevelDescription || 'N/A'}",
    isManagement: ${data.managementLevel?.isManagement || false},
})
WITH j`;

    if (data.skills && data.skills.length > 0) {
        let skillsCypherPart = data.skills.map((skill: string) => 
            `MERGE (s:Skill {name: "${(skill || '').replace(/"/g, '\\"')}"})
             MERGE (j)-[:REQUIRES_SKILL]->(s)`
        ).join('\nWITH j\n');
        cypher += `
WITH j
${skillsCypherPart}
WITH j`;
    }

        if (data.responsibilities && data.responsibilities.length > 0) {
            data.responsibilities.forEach((resp: string, index: number) => {
                cypher += `
    MERGE (r:Responsibility {description: "${(resp || '').replace(/"/g, '\\"')}"})
    MERGE (j)-[:ENTAILS]->(r)
    ${index < (data.responsibilities?.length ?? 0) - 1 ? 'WITH j' : ''}`;
            });
            cypher += 'WITH j';
        }

        // Handling certifications
if (data.certifications && data.certifications.length > 0) {
    let certificationsCypherPart = data.certifications.map((certification: string) => 
        `MERGE (c:Certification {name: "${(certification || '').replace(/"/g, '\\"')}"})
         MERGE (j)-[:REQUIRES_CERTIFICATION]->(c)`
    ).join('\nWITH j\n');
    cypher += `
WITH j
${certificationsCypherPart}
WITH j`;
}

    ['requiredQualifications', 'certifications', 'educationRequirements'].forEach(key => {
        const items = data[key as keyof JobData] as { qualification?: string, importance?: string, level?: string, field?: string, name?: string }[] | undefined;
        if (items && items.length > 0) {
            items.forEach(item => {
                let itemName = item.qualification || item.level || item.name || '';
                cypher += `
MERGE (q:${key.slice(0, -1)} {name: "${itemName.replace(/"/g, '\\"')}"})
ON CREATE SET q.importance = "${item.importance || 'N/A'}"
MERGE (j)-[:REQUIRES_${key.toUpperCase()}]->(q)
WITH j`;
            });
        }
    });

    if (data.experienceRequirements && data.experienceRequirements.length > 0) {
        data.experienceRequirements.forEach((exp: { years?: number, field?: string }) => {
            if (exp.years !== undefined && exp.field !== undefined) {
                cypher += `
MERGE (e:Experience {years: ${exp.years}, field: "${exp.field.replace(/"/g, '\\"')}"})
MERGE (j)-[:REQUIRES_EXPERIENCE]->(e)
WITH j`;
            }
        });
    }

    if (data.potentialCandidateTraits && data.potentialCandidateTraits.length > 0) {
        data.potentialCandidateTraits.forEach((trait: { trait?: string, importance?: string }) => {
            if (trait.trait !== undefined && trait.importance !== undefined) {
                cypher += `
MERGE (t:CandidateTrait {trait: "${trait.trait.replace(/"/g, '\\"')}", importance: "${trait.importance}"})
MERGE (j)-[:SEEKS_TRAIT]->(t)
WITH j`;
            }
        });
    }

    cypher += `
RETURN j;`;

    return cypher;
}
