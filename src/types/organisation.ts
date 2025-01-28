export type OrganisationInput = {
  slug: string;
  label: string;
  email: string;
};

type EvidenceField = {
  label: string;
  placeholder: string;
  required: boolean;
};

export type OrganisationInputWithEvidenceFields = OrganisationInput & {
  evidenceFields: {
    chatLinks?: EvidenceField;
  };
};
