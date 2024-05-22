import useStore from "@/app/state/useStore";

export default function AddJobBreadcrumb() {
  const { addJD, updateAddJDStep } = useStore(state => ({
    addJD: state.addJD,
    updateAddJDStep: state.updateAddJDStep
  }));

  // Define the steps and their initial statuses
  const steps = [
    { name: 'Step 1', href: '#', status: 'upcoming', unlocked: true }, // Assuming step 1 is always unlocked
    { name: 'Step 2', href: '#', status: 'upcoming', unlocked: false },
    { name: 'Step 3', href: '#', status: 'upcoming', unlocked: false },
  ];

  // Update statuses based on the current step from Zustand store
  steps.forEach((step, index) => {
    // Unlock the step if it's the current one or any previous step
    step.unlocked = index <= addJD.step - 1;

    if (index < addJD.step - 1) {
      step.status = 'complete';
    } else if (index === addJD.step - 1) {
      step.status = 'current';
    } else {
      step.status = 'upcoming';
    }
  });

  return (
    <nav className="flex items-center justify-center" aria-label="Progress">
      <p className="text-sm font-medium">
        Step {addJD.step} of {steps.length}
      </p>
      <ol role="list" className="ml-8 flex items-center space-x-5">
        {steps.map((step, index) => (
          <li key={step.name} onClick={() => {
            // Only allow navigation if the step is unlocked and it's not the first step
            if (step.unlocked && index !== 0) {
              updateAddJDStep(index + 1);
            }
          }}>
            {step.status === 'complete' ? (
              <a href={step.href} className="block h-2.5 w-2.5 rounded-full bg-slate-600 hover:bg-slate-900">
                <span className="sr-only">{step.name}</span>
              </a>
            ) : step.status === 'current' ? (
              <a href={step.href} className="relative flex items-center justify-center" aria-current="step">
                <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                  <span className="h-full w-full rounded-full bg-slate-200" />
                </span>
                <span className="relative block h-2.5 w-2.5 rounded-full bg-slate-600" aria-hidden="true" />
                <span className="sr-only">{step.name}</span>
              </a>
            ) : (
              <a href={step.href} className={`block h-2.5 w-2.5 rounded-full ${step.unlocked ? 'bg-gray-200 hover:bg-gray-400' : 'bg-gray-200 cursor-not-allowed'}`}>
                <span className="sr-only">{step.name}</span>
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
