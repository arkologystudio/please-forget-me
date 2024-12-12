export const organisations = [
  {
    name: "OpenAI",
    email: "info@arkology.co.za", //TODO: Change this to a real email
    slug: "openai",
    id: 1,  
  },
  {
    name: "Anthropic",
    email: "admin@arkology.co.za", //TODO: Change this to a real email
    slug: "anthropic",
    id: 2,
  },
  {
    name: "Meta",
    email: "test@arkology.co.za", //TODO: Change this to a real email
    slug: "meta",
    id: 3,
  },
] as const;

// Type for individual organisation
export type Organisation = typeof organisations[number];

// Get array of organisation names
export const organisationNames = organisations.map(org => org.name); 