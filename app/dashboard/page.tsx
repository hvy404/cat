import JDUploadBox from "./upload-box"
import JDGenerator from "./wizard/page"

export default function EmployerDashboard() {
  return (
    <div className="flex flex-col space-y-4">
        <h1>Employer Dashboard</h1>
        <JDUploadBox />
        <JDGenerator />
    </div>
  )
}
