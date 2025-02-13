export type RequestType = {
  label: RequestID;
  type: string;
  description: string;
};

export type RequestID = "RTBF" | "RTOOT" | "RTBH";