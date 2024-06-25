import Image from "next/image";
import federalJobSearchAnimation from "@/app/(auth)/dashboard/views/search/assets/federal-job-search-animation.svg";

/**
 * Renders a loading animation for the search feature.
 * @returns The JSX element representing the loading animation.
 */
export function SearchingAnimation() {
  return (
    <Image
      src={federalJobSearchAnimation}
      alt="Loading animation"
      width={240}
      height={240}
    />
  );
}
