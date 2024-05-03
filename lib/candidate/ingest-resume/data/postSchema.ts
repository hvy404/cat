// Define the TypeScript interface for the schema
interface PostSchema {
  applicant_id?: string | null;
  matching_opt_in?: boolean | null;
  active_looking?: boolean | null;
  active_looking_confirmed_date?: string | null;
  applied_at?: string[] | null;
  jds_viewed?: string[] | null;
  interviewed_by?: string[] | null;
  resume_matched_to_jd?: string[] | null;
  resume_requested_by_company?: string[] | null;
  embedding?: string | null;
  professional_network?: ProfessionalNetwork;
}

// Define the types for the professional network section
interface ProfessionalNetwork {
  mentors: Mentor[];
  references: Reference[];
  colleagues: Colleague[];
}

interface Mentor {
  name: string;
  relationship: string;
  contact: Contact;
}

interface Reference {
  name: string;
  relationship: string;
  contact: Contact;
}

interface Colleague {
  name: string;
  company: string;
  job_title: string;
  contact: Contact;
}

interface Contact {
  email: string;
  phone?: string;
}

// Function to create an empty instance of PostSchema including ProfessionalNetwork
export function createEmptyPostSchema(): PostSchema {
  return {
    applicant_id: null,
    embedding: null,
    matching_opt_in: null,
    active_looking: null,
    active_looking_confirmed_date: null,
    applied_at: [],
    jds_viewed: [],
    interviewed_by: [],
    resume_matched_to_jd: [],
    resume_requested_by_company: [],
    professional_network: {
      mentors: [],
      references: [],
      colleagues: []
    }
  };
}
