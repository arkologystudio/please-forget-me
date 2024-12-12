"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationNames = exports.organisations = void 0;
exports.organisations = [
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
];
// Get array of organisation names
exports.organisationNames = exports.organisations.map(function (org) { return org.name; });
