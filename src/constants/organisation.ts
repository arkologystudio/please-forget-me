import {
  OrganisationInput,
  OrganisationInputWithEvidenceFields,
} from "@/types/organisation";

export const rtbfReasons = [
  {
    id: "personal_impact",
    label: "Personal or Professional Impact",
    tooltip:
      "The data is no longer necessary or it significantly impacts your personal or professional life. This includes situations where outdated or irrelevant data affects your reputation or opportunities.",
  },
  {
    id: "unlawful_processing",
    label: "Data Processing Was Unlawful",
    tooltip:
      "Your personal data has been processed without legal basis or consent. This includes data collected without proper authorization or used beyond its intended purpose.",
  },
  {
    id: "inaccuracy",
    label: "Inaccuracy or Misrepresentation",
    tooltip:
      "Your personal data is inaccurate or misrepresents you. This ensures that AI systems don't perpetuate or learn from incorrect information about you.",
  },
] as const;

export const organisations: OrganisationInput[] = [
  {
    slug: "openai",
    label: "OpenAI (ChatGPT)",
    email: "info@arkology.co.za", // TODO
  },

  {
    slug: "anthropic",
    label: "Anthropic (Claude)",
    email: "info@arkology.co.za", // TODO
  },

  {
    slug: "meta",
    label: "Meta (LLama)",
    email: "info@arkology.co.za", // TODO
  },
] as const;

export const organisationsWithEvidenceFields: OrganisationInputWithEvidenceFields[] =
  [
    {
      slug: "openai",
      label: "OpenAI (ChatGPT)",
      email: "info@arkology.co.za", // TODO
      evidenceFields: {
        chatLinks: {
          label: "ChatGPT Chat Links",
          placeholder: "https://chat.openai.com/...",
          required: false,
        },
      },
    },
    {
      slug: "anthropic",
      label: "Anthropic (Claude)",
      email: "info@arkology.co.za", // TODO
      evidenceFields: {
        chatLinks: {
          label: "Claude Chat Links",
          placeholder: "https://claude.ai/...", // TODO
          required: false,
        },
      },
    },
    {
      slug: "meta",
      label: "Meta (LLama)",
      email: "info@arkology.co.za", // TODO
      evidenceFields: {
        chatLinks: {
          label: "LLama Chat Links",
          placeholder: "https://...", // TODO
          required: false,
        },
      },
    },
  ] as const;
