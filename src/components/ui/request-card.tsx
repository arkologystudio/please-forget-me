import React from "react";
import { Card } from "./card";

interface RequestCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
  height?: string;
  width?: string;
}

const RequestCard: React.FC<RequestCardProps> = ({
  title,
  description,
  isSelected,
  onToggle,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onToggle}
    >
      <div className="absolute top-3 right-3">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
          ${isSelected 
            ? 'border-blue-500 bg-blue-500' 
            : 'border-slate-300 bg-white'
          }`}
        >
          {isSelected && (
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col" style={{ width: "300px" }}>
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-slate-600 mb-4">{description}</p>
        </div>
        <div className="sr-only">
          <input
            type="checkbox" 
            checked={isSelected}
            onChange={onToggle}
            aria-label={`Select ${title}`}
          />
        </div>
      </div>
    </Card>
  );
};

export default RequestCard;
