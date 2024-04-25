import AddReusme from "./canidate/add-resume";
import MainLanding from "./canidate/hero";

export default function Main() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <MainLanding />
        <AddReusme />
      </div>
    </div>
  );
}
