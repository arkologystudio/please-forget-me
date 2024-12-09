export interface MailgunWebhook {
  signature: MailgunWebhookSignature;
  "event-data": MailgunEventData;
}

export interface MailgunWebhookSignature {
  token: string;
  timestamp: string;
  signature: string;
}

export interface MailgunEventData {
  id: string;
  timestamp: number;
  "log-level": string;
  event: string;
  "delivery-status": MailgunDeliveryStatus;
  flags: MailgunFlags;
  envelope: MailgunEnvelope;
  message: MailgunMessage;
  recipient: string;
  "recipient-domain": string;
  storage: MailgunStorage;
  campaigns: MailgunCampaign[];
  tags: string[];
  "user-variables": Record<string, string>;
}

export interface MailgunDeliveryStatus {
  tls: boolean;
  "mx-host": string;
  code: number;
  description: string;
  "session-seconds": number;
  utf8: boolean;
  "attempt-no": number;
  message: string;
  "certificate-verified": boolean;
}

export interface MailgunFlags {
  "is-routed": boolean;
  "is-authenticated": boolean;
  "is-system-test": boolean;
  "is-test-mode": boolean;
}

export interface MailgunEnvelope {
  transport: string;
  sender: string;
  "sending-ip": string;
  targets: string;
}

export interface MailgunMessage {
  headers: MailgunMessageHeaders;
  attachments: File[];
  size: number;
}

export interface MailgunMessageHeaders {
  to: string;
  "message-id": string;
  from: string;
  subject: string;
}

// TODO: Add attachment properties

export interface MailgunStorage {
  url: string;
  key: string;
}

export interface MailgunCampaign {
  to_do: string;
}
