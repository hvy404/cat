import Image from "next/image";
import leftArrow from "@/app/(employer)/dashboard/views/candidate/assets/left-arrow.svg";

/**
 * Renders a loading animation for the search feature.
 * @returns The JSX element representing the loading animation.
 */
export function LeftArrowGraphic() {
  return (
    <Image
      src={leftArrow}
      alt="Left arrow"
    />
  );
}
