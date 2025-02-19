export const organisations = [
  {
    name: "OpenAI",
    email: "dsar@openai.com",
    slug: "openai",
    label: "OpenAI (ChatGPT)",
    id: 1,
    evidenceFields: {
      chatLinks: {
        label: "ChatGPT Chat Links",
        placeholder: "https://chat.openai.com/...",
        required: false,
      },
    },
  },
  {
    name: "Anthropic",
    email: "privacy@anthropic.com", 
    slug: "anthropic",
    label: "Anthropic (Claude)",
    id: 2,
    evidenceFields: {
      chatLinks: {
        label: "Claude Chat Links",
        placeholder: "https://claude.ai/...", // TODO
        required: false,
      },
    },
  },
  {
    name: "Google",
    email: "apps-help@google.com", //TODO: Change this to a real email
    slug: "google",
    label: "Google (Gemini)",
    id: 4,
    evidenceFields: {
      chatLinks: {
        label: "Gemini Chat Links",
        placeholder: "https://...", // TODO
        required: false,
      },
    },
  },
  {
    name: "X",
    email: "support@x.ai", //TODO: Change this to a real email ##privacy@x.ai
    slug: "x",
    label: "X (Grok)",
    id: 5,
    evidenceFields: {
      chatLinks: {
        label: "Grok Chat Links",
        placeholder: "https://...", // TODO
        required: false,
      },
    },
  },
  {
    name: "Perplexity",
    email: "support@perplexity.ai", //TODO: Change this to a real email
    slug: "perplexity",
    label: "Perplexity",
    id: 6,
    evidenceFields: {
      chatLinks: {
        label: "Perplexity Chat Links",
        placeholder: "https://...", // TODO
        required: false,
      },
    },
  },
  {
    name: "Mistral",
    email: "privacy@mistral.ai", //TODO: Change this to a real email ##privacy@mistral.ai
    slug: "mistral",
    label: "Mistral (le Chat)",
    id: 7,
    evidenceFields: {
      chatLinks: {
        label: "Mistral / le Chat Chat Links",
        placeholder: "https://...", // TODO
        required: false,
      },
    },
  },
] as const;

// Type for individual organisation
export type Organisation = (typeof organisations)[number];

// Get array of organisation names
export const organisationNames = organisations.map((org) => org.name);
