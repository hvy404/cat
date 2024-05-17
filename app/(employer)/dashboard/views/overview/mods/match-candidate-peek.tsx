import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
//import AIMatchCandidateChart from "@/app/(employer)/dashboard/views/overview/mods/match-candidate-peek-chart";

import dynamic from 'next/dynamic';

const AIMatchCandidateChart = dynamic(() => import('@/app/(employer)/dashboard/views/overview/mods/match-candidate-peek-chart'), {
  ssr: false
});


const candidateResume = {
  name: "Bryan Williams",
  title: "VP, Data Science",
  company: "TONIK+ (Acquired by Edisen in 2021)",
  contact: {
    email: "BRYNATWIL@GMAIL.COM",
    phone: "319-389-1347",
    location: "3928 IOWA ST, SAN DIEGO, CA 92104",
  },
  education: [
    {
      degree: "Master of Financial Engineering",
      end_date: "Dec 2015",
      start_date: "Nov 2014",
      institution: "UCLA Anderson School of Management",
    },
    {
      degree: "Masters of Science, Inorganic Chemistry",
      end_date: "Jun 2012",
      start_date: "Sep 2008",
      institution: "UCLA Department of Chemistry and Biochemistry",
    },
    {
      degree: "Bachelors of Arts, Chemistry",
      end_date: "May 2008",
      start_date: "Aug 2004",
      institution: "Grinnell College",
    },
  ],
  soft_skills: [
    "Proficient in statistical modeling (predictive and historical)",
  ],
  work_experience: [
    {
      end_date: "Present",
      job_title: "VP, Data Science",
      start_date: "Jul 2019",
      organization: "TONIK+ (Acquired by Edisen in 2021)",
      responsibilities:
        "Created, built, and refined the machine learning and analysis aspects of TONIK+ Video Intelligence, a video analysis tool that identifies the most-resonant portions of content based on retention data. Developed Data Science program at TONIK+, allowing the company to research and interpret performance and results across a broad scope of machine learning and quantitative implementations. Manage Edisen’s Data Science team (3x growth since acquisition), focusing primarily on developing skillsets of team members in an effort to make them more than ready for their next role, be it at Edisen or elsewhere. Work cross-discipline with Edisen’s product team to fully integrate TVI into the company platform as well as develop a fully automated and integrated internal reporting suite.",
    },
    {
      end_date: "Dec 2023",
      job_title: "Marketing Consultant",
      start_date: "Jul 2019",
      organization: "Cambria Investment Management",
      responsibilities:
        "Oversee and implement digital advertising strategy and execution for Cambria across multiple platforms and campaigns, growing Cambria’s digital advertising budget from nothing to $5k/week in spend as well as efficient KPI returns on four media platforms that helped Cambria reach the $1B AUM mark. Work with senior management across multiple departments at Cambria on ad strategy, content creation, and execution on ads across Cambria’s multitude of offerings (Website content, Funds, Podcast, etc.). Unique background combination of Financial Engineering and digital ad data science allows me to speak to both sides, allowing for a smooth translation of ideas and execution between finance, marketing, and platform reps.",
    },
    {
      end_date: "Jul 2019",
      job_title: "Director, Analytics",
      start_date: "Jan 2016",
      organization: "HYFN (Acquired by Nexstar in 2017)",
      responsibilities:
        "Created, managed, and contributed to HYFN’s Analytics department, mostly involving the execution, streamlining, and optimization of social advertising account reporting. Clients saw success on-platform that on-average outperformed in-house teams at Facebook, Instagram, Twitter, Snap, and Pinterest by 20-30% in KPI efficiency thanks to our advanced modelling of performance data. Developed FE-based machine learning models for application to HYFN’s ad performance data archive in order to build upon top-level analytics and reporting.",
    },
    {
      end_date: "Dec 2018",
      job_title: "Quantitative Finance Lead",
      start_date: "Oct 2018",
      organization: "Parallel Labs Inc",
      responsibilities:
        "Carried out LLM quant research on various aspects of Parallel’s Natural Language Processing (NLP)-produced company event data, including but not limited to event coverage % of idiosyncratic returns, significant abnormal returns related to confounding events, and pre- and post-event drift for present and future events. Served as an ‘in-situ’ QA analyst of Parallel’s data, helping guide the start-up toward tweaks and adjustments they should make to the data set to make it more user-friendly for quants. Served as a fresh voice from the quant side regarding their overarching paths for their product and packaging; provided perspective and viewpoints on their data that can only come from a new set of eyes and a quant-based advantage point.",
    },
    {
      end_date: "Sep 2015",
      job_title: "Research Analyst Intern",
      start_date: "Jun 2015",
      organization: "Los Angeles Capital Management and Equity Research",
      responsibilities:
        "Investigated the predictability of idiosyncratic risk on future realized idiosyncratic risk. Determined the influence and persistence of extreme events on an asset and how they affect its specific risk from period to period. Used a combination of machine learning and other quantitative methods to corroborate the effect and persistence of these extreme events and attempted to incorporate factors into the risk forecast.",
    },
    {
      end_date: "Dec 2015",
      job_title: "UCLA MFE Applied Financial Project",
      start_date: "Apr 2015",
      organization: "Geode Capital Management",
      responsibilities:
        "AFP collaboration with a 4-person team of UCLA MFE students and Geode Capital. This project served as our master’s thesis and gave us the opportunity to work on real-world problems with high-caliber quant firms. Replicated and statistically confirmed the findings of research articles regarding the creation of decile spread portfolios on trends in fundamentals. Implemented additional fundamental trends into the framework established to determine whether additional factors were alpha-significant. Investigated additional topics regarding scaling factors and a ‘per share effect’ that had either a constructive or destructive influence on the trends in fundamentals. Deliverables included a literature review, final report covering all research completed, and a final presentation to both Geode and to the UCLA MFE class.",
    },
    {
      end_date: "Oct 2014",
      job_title: "Business Data Analyst",
      start_date: "Jul 2013",
      organization: "Internet Brands",
      responsibilities:
        "Obtained and interpreted data of a variety of metrics from a multitude of sources to determine trends for 100,000+ merchants working with the Internet Brands Shopping vertical. Used a combination of BI, VBA, and web scraping tools to preemptively find potential gains and to flag and deal with potential problems before they happened. Composed several high-priority weekly, bi-monthly, and monthly reports to supply Marketing, Operations, and Business Operations Managers with vital information for their roles. Worked closely with said managers on any additional projects that required heavy data analysis.",
    },
    {
      end_date: "Jul 2013",
      job_title: "R&D Analytical Chemist",
      start_date: "Jul 2012",
      organization: "PPG Aerospace",
      responsibilities:
        "Led experimental testing for three top-priority PPG projects. Worked in a managerial role toward other departments regarding R/D Lab items. Responsible for gathering, analyzing, and presenting material from R/D research experiments. 6 Sigma lead for the lab, responsible for developing and maintaining a safe and functional laboratory. Obtained Secret Level Security Clearance for high-priority fighter jet project. Compiled and analyzed data for determining optimal production for manufacturing, formulations for use with our systems, and the path of research for future products.",
    },
    {
      end_date: "Jul 2013",
      job_title: "Lead Researcher",
      start_date: "Jul 2012",
      organization: "HYFN8",
      responsibilities:
        "Worked closely with R/D and team on the development of new transparencies products or the improvement of current products for both military and commercial use. Led Researcher on high-priority testing and modification for production use. Worked with project teams from top to bottom in a wide variety of product lines in order to determine the best course-of-action of the product from the research lab to the shipment to the buyer.",
    },
  ],
  technical_skills: ["Excel", "R (Python/SQL/Selenium usage via R libraries)"],
  fedcon_experience: ["TONIK+ Video Intelligence"],
  security_clearance: ["Secret Level Security Clearance"],
  industry_experience: [
    "TONIK+ (Acquired by Edisen in 2021)",
    "Cambria Investment Management",
    "HYFN (Acquired by Nexstar in 2017)",
    "Parallel Labs Inc",
    "Los Angeles Capital Management and Equity Research",
    "Geode Capital Management",
    "Internet Brands",
    "PPG Aerospace",
    "HYFN8",
  ],
  professional_certifications: ["IBM AI Professional Certified"],
};

export default function AIMatchCandidateResumeView({
  isOpen,
  setIsOpen,
  name,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  name: string;
}) {
  return (
    <Sheet open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <SheetContent className="md:min-w-[650px] lg:min-w-[800px] overflow-auto">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold leading-7 text-gray-900">
            {name}
          </SheetTitle>

          <div className="px-4 sm:px-0">
            <Badge variant={"default"}>AI Matched</Badge>
          </div>
        </SheetHeader>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Full name
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {name}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Recent role
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {candidateResume.title}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Email address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                email@example.com
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                {candidateResume.technical_skills.length > 1
                  ? "Technical skills"
                  : "Technical skill"}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {candidateResume.technical_skills.map((skill) => (
                  <p key={skill}>{skill}</p>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Salary expectation
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                $120,000
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Education
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 space-y-2">
                {candidateResume.education.map((education) => (
                  <div key={education.institution}>
                    <p className="font-medium">{education.degree}</p>
                    <p>{education.institution}</p>
                  </div>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Attachments
              </dt>
              <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul
                  role="list"
                  className="divide-y divide-gray-100 rounded-md border border-gray-200"
                >
                  <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip
                        className="h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">resume.pdf</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href="#"
                        className="font-medium text-slate-600 hover:text-slate-500"
                      >
                        Download
                      </a>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        <AIMatchCandidateChart />
      </SheetContent>
    </Sheet>
  );
}
