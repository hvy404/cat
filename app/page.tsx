import AddReusme from "./candidate/add-resume";
import MainLanding from "./candidate/hero";
import JDGenerator from "./dashboard/wizard/page";

export default function Main() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <MainLanding />
        <JDGenerator />
      </div>
    </div>
  );
}
