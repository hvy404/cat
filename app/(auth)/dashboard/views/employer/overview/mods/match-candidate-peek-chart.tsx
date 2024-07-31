import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  {
    subject: 'Hard Skills',
    A: 60,
    fullMark: 100,
  },
  {
    subject: 'Soft Skills',
    A: 98,
    fullMark: 100,
  },
  {
    subject: 'Education',
    A: 86,
    fullMark: 100,
  },
  {
    subject: 'Work Experience',
    A: 59,
    fullMark: 100,
  },
  {
    subject: 'Certifications',
    A: 99,
    fullMark: 100,
  },
];


export default function AIMatchCandidateChart() {
  return (
    <ResponsiveContainer width="75%" height="75%" className="mx-auto">
    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" className="text-sm text-gray-900"/>
      <PolarRadiusAxis angle={15} domain={[0, 100]}/>
      <Radar name="Score" dataKey="A" stroke="#84aad8" fill="#84aad8" fillOpacity={0.6} />
    </RadarChart>
  </ResponsiveContainer>
  )
}
