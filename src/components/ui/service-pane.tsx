import React from "react";
import { Button } from "./button";

interface ServicePaneProps {
  title: string;
  description: string;
  onBegin: () => void;
}

const ServicePane: React.FC<ServicePaneProps> = ({
  title,
  description,
  onBegin,
}) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
      style={{ height: "450px", width: "300px" }}
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-slate-600 mb-4">{description}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-auto"
        onClick={onBegin}
      >
        BEGIN
      </Button>
    </div>
  );
};

export default ServicePane;
