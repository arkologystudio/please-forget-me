"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationNames = exports.organisations = void 0;
exports.organisations = [
    {
        name: "OpenAI",
        email: "info@arkology.co.za", //TODO: Change this to a real email
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
        email: "admin@arkology.co.za", //TODO: Change this to a real email
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
        name: "Meta",
        email: "test@arkology.co.za", //TODO: Change this to a real email
        slug: "meta",
        label: "Meta (LLama)",
        id: 3,
        evidenceFields: {
            chatLinks: {
                label: "LLama Chat Links",
                placeholder: "https://...", // TODO
                required: false,
            },
        },
    },
    {
        name: "Google",
        email: "info@arkology.co.za", //TODO: Change this to a real email
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
        email: "info@arkology.co.za", //TODO: Change this to a real email ##privacy@x.ai
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
        email: "info@arkology.co.za", //TODO: Change this to a real email
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
        email: "info@arkology.co.za", //TODO: Change this to a real email ##privacy@mistral.ai
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
];
// Get array of organisation names
exports.organisationNames = exports.organisations.map(function (org) { return org.name; });
