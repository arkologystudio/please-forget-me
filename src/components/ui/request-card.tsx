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
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onToggle}
    >
      <div className="p-6 flex flex-col" style={{ width: "300px" }}>
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-slate-600 mb-4">{description}</p>
        </div>
        <div className="mt-auto flex items-center">
          <div className="sr-only">
            <input
              type="checkbox" 
              checked={isSelected}
              onChange={onToggle}
              aria-label={`Select ${title}`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RequestCard;
