import React from "react";
import { Card } from "./card";

interface RequestCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
  /**
   * Label text to display on a small "tab" above the card
   * (e.g. "Recommended", "Advanced", etc.).
   */
  label?: string;
}

/**
 * Returns a tailwind class for different label values.
 * You can expand or customize this as needed.
 */
function getLabelColor(label: string) {
  switch (label) {
    case "Recommended":
      return "bg-green-600 text-white border-green-600";
    case "Advanced":
      return "bg-blue-600 text-white border-blue-600";
    default:
      // Fallback label style
      return "bg-slate-200 text-slate-700 border-slate-300";
  }
}

const RequestCard: React.FC<RequestCardProps> = ({
  title,
  description,
  isSelected,
  onToggle,
  label,
}) => {
  // Pre-compute classes for the label background
  const labelClasses = label ? getLabelColor(label) : "";

  return (
    <div
      className={`
        relative
        inline-block
        cursor-pointer
        transition-all
        ${isSelected ? "ring-2 ring-blue-500 rounded-xl" : ""}
      `}
      style={{ width: "300px" }} // Fixed width so card size remains consistent
      onClick={onToggle}
    >
      {/* 
        If a label is provided, display a small tab above the card.
        We give it a higher z-index so it stays in front of the card.
      */}
      {label && (
        <div
          className={`
            absolute
            -top-7
            left-0
            px-3
            py-1
            pb-8
            text-sm
            border
            rounded-t-md
            shadow-sm
            z-0
            ${labelClasses}
          `}
        >
          {label}
        </div>
      )}

      <Card className="relative w-full" style={{ height: "250px" }}>
        {/* Checkbox indicator in the top-right corner */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "border-blue-500 bg-blue-500"
                : "border-slate-300 bg-white"
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

        {/* Main card content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-slate-600 mb-4">{description}</p>
        </div>

        {/* Hidden checkbox for screen readers */}
        <div className="sr-only">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            aria-label={`Select ${title}`}
          />
        </div>
      </Card>
    </div>
  );
};

export default RequestCard;
