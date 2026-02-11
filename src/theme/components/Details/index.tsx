import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface DetailsProps {
  children: React.ReactNode;
}

export function Details({ children }: DetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        <span className="font-medium">Details</span>
      </button>
      {isOpen && <div className="px-4 py-4">{children}</div>}
    </div>
  );
}
