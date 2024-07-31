import { Skeleton } from "@/components/ui/skeleton";

export function CollectionLoading() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-[250px]" />
        <div className="grid md:grid-cols-1 lg:grid-cols-2 text-sm gap-4">
          <Skeleton className="h-12" />
        </div>
      </div>
    </div>
  );
}
