"use server";
import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { staticSchema } from './data/staticSchema';

const jsonSchema = zodToJsonSchema(staticSchema, 'ResumeSchema');

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

export async function generateStatic() {
  console.log('Generating static resume data');

  const data: string = 'VIRA SALIIEVA\n' +
  'BA & OPERATIONS INTERN\n' +
  '@ GENESIS GROWTH ACCELERATOR\n' +
  'programming (Python, basic\n' +
  'knowledge of SQL, Java, C++)\n' +
  'market research\n' +
  'data analysis & visualization\n' +
  'experience with Jira and\n' +
  'Confluence\n' +
  'SKILLS &\n' +
  'KNOWLEDGE\n' +
  '+380634003787\n' +
  'Lviv/Vinnytsia, Ukraine\n' +
  'vira.saliieva@ucu.edu.ua\n' +
  'I am an ambitious and hard-working student seeking for a\n' +
  'part-time internship to continue my growth in business\n' +
  'analysis. I am detail-oriented, learn quickly, and have\n' +
  'experience of working in a team with tight deadlines.\n' +
  'SUMMARY\n' +
  'EDUCATION\n' +
  'Ukrainian Catholic University, Sep 2020 - June 2024\n' +
  'IT & BUSINESS ANALYTICS\n' +
  'CERTIFICATES\n' +
  'INTERNSHIPS & EXPERIENCE\n' +
  'Contact me:\n' +
  'UCU Development Department, Feb 2023 - present\n' +
  'PROJECT & PROGRAM MANAGER (PART-TIME)\n' +
  'information gathering & project research\n' +
  'writing grants and reports & analysing risks\n' +
  'Blue Media S.A. (Gdańsk, Poland), July 2022\n' +
  'IT SUPPORT INTERN\n' +
  'UCU, Nov - Dec 2022\n' +
  'DEVELOPMENT DEPARTMENT\n' +
  'INTERN\n' +
  'UCU, 2021\n' +
  'PITCH SUMMER SCHOOL\n' +
  'ACADEMIC IELTS C1\n' +
  '2018\n' +
  '4th-year student with solid analytical and learning capabilities;\n' +
  'Completed Business Analysis Practices course: learned\n' +
  'document and UI analysis, business process modeling,\n' +
  'requirements elicitation and prioritization, other key BA\n' +
  'techniques;\n' +
  'Studied software architecture, system analysis, startups &\n' +
  'entrepreneurship, design thinking, econometrics;\n' +
  'Gained substantial teamwork experience: developed business\n' +
  'plans, tech specs, and web applications in a team;\n' +
  'Improved communication skills as a teaching assistant for the\n' +
  'Linear Algebra course. \n' +
  'DATA TRAINING\n' +
  'Fisher Center For Business Analytics\n' +
  'May 2023\n' +
  'public speaking, presentation &\n' +
  'interviewing skills\n' +
  'advanced verbal and written\n' +
  'English, spoken Polish\n' +
  'strong MS Office and GSuite\n' +
  'user\n' +
  'ELEKS,  July-August 2023\n' +
  'BUSINESS ANALYSIS INTERN\n' +
  'Worked on a team pet project:\n' +
  'Selected development methodologies;\n' +
  'Prepared user stories & acceptance criteria;\n' +
  'Worked with a backlog;\n' +
  'Delivered presentations to stakeholders.\n' +
  'LVIV PRODUCT MANAGEMENT\n' +
  'SUMMER SCHOOL\n' +
  'UCU, Aug 2023';

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
        'The following is resume data. Use the resume data to populate relevant fields the resume schema, and answer in JSON. If key values are not relevant, leave it empty. Do not make anything up.',
      },
      {
        role: 'user',
        content: JSON.stringify(data),
      },
    ],
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    temperature: 0.3,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: 'json_object', schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);
  console.log({ output });
  return output;
}