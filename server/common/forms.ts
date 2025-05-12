import { users } from "./mock-database/users.js";
import { UserRecord } from "./session-context.js";

export const FORM_NAME_1 = "19B-8671-D" as const;
export const FORM_NAME_2 = "19B-8671-TPS" as const;
export type FormNameType_1 = typeof FORM_NAME_1;
export type FormNameType_2 = typeof FORM_NAME_2;

export type FormNameType = FormNameType_1 | FormNameType_2;

export type FormRecord = FormRecord_1 | FormRecord_2;

interface BaseForm {
  type: "mortgage-application";
  userId: string;
  status: FormStatus;
  step: FormStep;
  error: ApplicationError | null;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  borrower_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };

  annunal_income_estimate: number;

  income: IncomeSource[];
  debt: DebtSource[];

  property_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

type FormStatus = "not-started" | "started" | "complete" | "error";
export type FormStep =
  | "application-details"
  | "income-and-documents"
  | "debts"
  | "property-details"
  | "cpa-details";

interface IncomeSource {
  employer: string;
  employment_type: string;
  monthly_income: number;
  additional_details: string;
}

interface DebtSource {
  type: "auto-loan" | "credit-card" | "student-loan" | "other";
  monthly_payment: number;
  additional_details: string;
}

interface ApplicationError {
  code: string;
  message: string;
}

function makeBaseForm(user: UserRecord): BaseForm {
  return {
    userId: user.id,
    type: "mortgage-application",
    status: "not-started",
    error: null,
    step: "application-details",

    first_name: "",
    last_name: "",
    email: "",
    phone: "",

    borrower_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },

    annunal_income_estimate: 0,
    income: [],
    debt: [],

    property_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
  };
}

export interface FormRecord_1 extends BaseForm {
  id: string;
  formName: FormNameType_1; // referenced by ui
}

export function makeForm1(user: UserRecord): FormRecord_1 {
  const base = makeBaseForm(user);
  return {
    ...base,
    status: "started",
    id: `${user.id}-${FORM_NAME_1}`, // this must match the sync-ids creator
    formName: FORM_NAME_1,
    step: "property-details",
    error: {
      code: "TPS-MISSING",
      message: `Application missing TPS Report`,
    },
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    borrower_address: {
      ...base,
      street: "101 Spear Street",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
    },

    property_address: {
      street: "318 Forest Avenue",
      city: "Oak Park",
      state: "IL",
      zip: "60302",
    },

    annunal_income_estimate: 250000,

    income: [
      {
        employer: "Harvest Kitchen",
        employment_type: "partner (majority)",
        monthly_income: 15000,
        additional_details: "70% ownership",
      },
      {
        employer: "Urban Cafe",
        employment_type: "partner (minority)",
        monthly_income: 3500,
        additional_details: "30% ownership",
      },
      {
        employer: "The Sandwich Shop",
        employment_type: "partner (minority)",
        monthly_income: 5000,
        additional_details: "30% ownership",
      },
    ],

    debt: [{ type: "auto-loan", monthly_payment: 500, additional_details: "" }],
  };
}

export interface FormRecord_2 extends BaseForm {
  id: string;
  formName: FormNameType; // referenced by ui

  cpa_contact: {
    first_name: string;
    last_name: string;

    phone: string;
    email: string;

    licenseId: string;
  };
}

export function makeForm2(user: UserRecord): FormRecord_2 {
  const base = makeBaseForm(user);

  return {
    ...base,
    id: `${user.id}-${FORM_NAME_2}`, // this must match the sync-ids creator
    formName: FORM_NAME_2,

    cpa_contact: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      licenseId: "",
    },
  };
}
