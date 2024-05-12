import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{name}</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
