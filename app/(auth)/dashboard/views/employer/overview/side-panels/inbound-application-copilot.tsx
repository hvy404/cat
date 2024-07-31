import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

interface CopilotResponseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  response: string;
  title: string;
}

const CopilotResponseSheet: React.FC<CopilotResponseSheetProps> = ({ isOpen, onClose, response, title }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[425px] md:min-w-[500px] p-6 m-4 rounded-lg shadow-lg flex flex-col h-[calc(100vh-2rem)]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Copilot's analysis for this section.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-grow overflow-y-auto">
          <ReactMarkdown 
            className="prose dark:prose-invert max-w-none text-sm"
            components={{
              h1: ({node, ...props}) => <h1 className="text-base font-medium mb-3" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-base font-medium mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-medium mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-sm mb-3" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-3" {...props} />,
              li: ({node, ...props}) => <li className="mb-1 text-sm" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-500 hover:underline text-sm" {...props} />,
              code: ({node, className, ...props}) => 
                className === 'language-js' || className === 'language-javascript' || className === 'language-typescript'
                  ? <code className="block bg-gray-100 dark:bg-gray-800 rounded p-2 mb-3 text-xs" {...props} />
                  : <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-xs" {...props} />,
            }}
          >
            {response}
          </ReactMarkdown>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CopilotResponseSheet;