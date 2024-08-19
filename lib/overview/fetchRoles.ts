"use server";
import { format, parseISO } from 'date-fns';
import { createClerkSupabaseClient } from "@/lib/supabase/supabaseClerkServer";

const supabase = createClerkSupabaseClient();

function remapClearanceLevel(level: string) {
  switch (level) {
    case "none":
      return "Unclassified";
    case "basic":
      return "Public Trust";
    case "confidential":
      return "Secret";
    case "critical":
      return "Top Secret";
    case "paramount":
      return "Top Secret/SCI";
    case "q_clearance":
      return "Q Clearance";
    case "l_clearance":
      return "L Clearance";
    default:
      return level;
  }
}

function remapLocationType(type: string) {
  switch (type) {
    case "remote":
      return "Remote";
    case "onsite":
      return "On Site";
    case "hybrid":
      return "Hybrid";
    default:
      return type;
  }
}


function formatDate(dateString: string) {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original string if parsing fails
  }
}

export async function fetchDetailedJobPosts(userID: string, filter: string) {
  const filterBoolean = filter === "active" ? true : false;

  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "jd_id, title, location, location_type, security_clearance, posted_date, private_employer, active"
    )
    .eq("employer_id", userID)
    .eq("processed", true)
    .eq("active", filterBoolean);

  if (error) {
    return {
      message: "Failed to fetch active job posts.",
      error: error,
    };
  }

  // Remap the security clearance levels and location types
  const remappedData = data?.map(job => ({
    ...job,
    security_clearance: remapClearanceLevel(job.security_clearance),
    location_type: remapLocationType(job.location_type),
    posted_date: formatDate(job.posted_date),
  }));

  return { data: remappedData };
}


const jobTypeMap: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  "contract": "Contract",
  "temporary": "Temporary",
};

const compensationTypeMap: Record<string, string> = {
  salary: "Salary",
  hourly: "Hourly",
  commission: "Commission",
};

export async function fetchJobPostSpecifics(userId: string, jobId: string) {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "description, job_type, active, private_employer, min_salary, max_salary, location_type, security_clearance, salary_disclose, commission_percent, ote_salary, compensation_type, hourly_comp_min, hourly_comp_max"
    )
    .eq("employer_id", userId)
    .eq("jd_id", jobId);

  if (error) {
    console.error("Fetch error:", error);
    return { error, message: "Failed to fetch active job posts." };
  }

  if (!data || data.length === 0) {
    return { data: null, message: "No data found." };
  }

  const formattedData = data.map((item) => ({
    ...item,
    job_type: jobTypeMap[item.job_type] || item.job_type,
    location_type: remapLocationType(item.location_type),
    security_clearance: remapClearanceLevel(item.security_clearance),
    description: item.description || "No description provided.",
    compensation_type:
      compensationTypeMap[item.compensation_type] || item.compensation_type,
  }));

  return { data: formattedData };
}

export interface Location {
  city: string;
  state: string;
  zipcode: string;
}

export interface Opportunity {
  title: string;
  security_clearance: string;
  location: Location[];
  location_type: string;
  job_uuid: string;
}

export interface OpportunitiesData {
  timestamp: string;
  opportunities: Opportunity[];
}

export async function getSimplifiedJobPosts(userID: string, filter: string) {
  try {
    const response = await fetchDetailedJobPosts(userID, filter);

    if (response.error) {
      throw new Error(response.message || 'Failed to fetch job posts');
    }

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map(job => ({
      title: job.title,
      security_clearance: job.security_clearance, 
      location: job.location,
      location_type: job.location_type,
      job_uuid: job.jd_id,
    }));
  } catch (error) {
    console.error('Error fetching simplified job posts:', error);
    throw error;
  }
}

export async function jobPostStatus(
  userID: string,
  jobID: string,
  status: boolean
) {
  const { error } = await supabase
    .from("job_postings")
    .update({ active: status })
    .eq("jd_id", jobID)
    .eq("employer_id", userID);

  if (error) {
    console.error(error);
    return {
      error: error,
    };
  }

  return { message: "Success" };
}