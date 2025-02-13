export type RequestType = {
  label: RequestID;
  type: string;
  description: string;
};

export type RequestID = "rtbf" | "rtoot" | "rtbh";