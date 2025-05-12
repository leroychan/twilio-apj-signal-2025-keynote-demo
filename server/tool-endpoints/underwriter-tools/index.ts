import type { Request, RequestHandler } from "express";
import { nanoid } from "nanoid";
import {
  FORM_NAME_1,
  FORM_NAME_2,
  FormNameType,
  makeForm1,
} from "../../common/forms.js";
import { users } from "../../common/mock-database/users.js";
import { fetchUserForm, sendDemoLog } from "../../common/sync-rest.js";

/* ------------------------------------------------------------------
 *  Mortgage-Agent dummy handlers WITH mocked results
 *  Each logs the inbound params and returns a representative payload.
 * ------------------------------------------------------------------ */

/** 1. get_application */
export const get_application: RequestHandler = async (req, res) => {
  const toolName = "get_application";

  const args = parseArgs(req) as { userId: string; formName: string };

  console.log(toolName, args);

  let formName: FormNameType =
    args.formName === FORM_NAME_2 ? FORM_NAME_2 : FORM_NAME_1;

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  const [formResult] = await Promise.allSettled([
    fetchUserForm(args.userId, formName),
    sendToolStartLog(baseLogParams),
  ]);

  const form =
    formResult.status === "fulfilled" ? formResult.value : makeForm1(users[0]);

  const result = {
    ...form,
    applicationId: form.id,
    formName: form.formName,
    loan: { amount: 750000, purpose: "Purchase", propertyType: "SFR" },
    status: "in_progress",
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 2. analyze_document */
export const analyze_document: RequestHandler = async (req, res) => {
  const args = parseArgs(req) as { documentType: string; userId: string };

  const toolName = "analyze_document";

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  console.log(toolName, args);
  sendToolStartLog(baseLogParams);
  await sleep();

  const result = {
    documentType: args.documentType,
    pages: 3,
    anomalies: [],
    overallConfidence: 0.94,
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 3. extract_document_data */
export const extract_document_data: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "extract_document_data";

  const args = parseArgs(req) as { documentType: string; userId: string };
  console.log(toolName, args);

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = {
    documentType: args.documentType,
    fields: {
      grossMonthlyIncome: 37500,
      ytdProfit: 210000,
      businessName: "Harvest Kitchen",
    },

    cpa_contact: {
      first_name: "John",
      last_name: "Bookman",

      phone: "+18885550001",
      email: "jbookman@gmail.com",

      licenseId: "CPA-1234",
    },
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 4. get_customer_profile */
export const get_customer_profile: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "get_customer_profile";

  const args = parseArgs(req) as { userId: string };
  console.log(toolName, args);

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = {
    userId: args.userId,
    fullName: "Ivan Indie",
    creditScore: 712,
    primaryState: "CO",
    phone: "303-555-0199",
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 5. get_income_history */
export const get_income_history: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "get_income_history";

  const args = parseArgs(req) as { userId: string };
  console.log(toolName, args);

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = [
    { year: 2023, amount: 140000 },
    { year: 2024, amount: 450000 },
  ];

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 6. validate_cpa_credentials */
export const validate_cpa_credentials: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "validate_cpa_credentials";

  const args = parseArgs(req) as { licenseNumber: string; stateCode: string };
  console.log(toolName, args);
  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = {
    licenseNumber: args.licenseNumber,
    state: args.stateCode,
    active: true,
    expiration: "2026-08-31",
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 7. assess_income_stability */
export const assess_income_stability: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "assess_income_stability";

  const args = parseArgs(req) as { userId: string; formName: string };
  console.log(toolName, args);

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = {
    stable: false,
    spikeDetected: true,
    twoYearAverage: 295000,
    comment: "Income increased > 200 % YOY; CPA letter required.",
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 8. calculate_dti_ratio */
export const calculate_dti_ratio: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "calculate_dti_ratio";

  const args = parseArgs(req) as {
    userId: string;
    formName: string;
    qualifyingIncome: number;
  };

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  console.log(toolName, args);
  sendToolStartLog(baseLogParams);
  await sleep();

  const result = {
    frontEnd: 31.2,
    backEnd: 51.0,
    qualifyingIncomeUsed: args.qualifyingIncome,
  };

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 9. suggest_required_documents */
export const suggest_required_documents: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "suggest_required_documents";

  const args = parseArgs(req) as { userId: string; formName: string };
  console.log(toolName, args);

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = [
    "CPA income-stability letter",
    "YTD Profit & Loss statement",
    "Business bank statements - last 2 months",
  ];

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

/** 10. fetch_market_rates */
export const fetch_market_rates: RequestHandler = async (req, res) => {
  const id = nanoid();
  const toolName = "fetch_market_rates";

  const args = parseArgs(req) as {
    loanAmount: number;
    ltv: number;
    fico: number;
  };
  console.log(toolName, args);

  const baseLogParams: ToolStarting = { id: nanoid(), args, toolName };

  sendToolStartLog(baseLogParams);
  await sleep();

  const result = [
    { rate: 7.25, points: 0.5, apr: 7.34 },
    { rate: 7.0, points: 1.0, apr: 7.28 },
    { rate: 6.75, points: 1.5, apr: 7.21 },
  ];

  sendToolFinishLog({ ...baseLogParams, result });

  res.status(200).json(result);
};

// ========================================
// Utilities
// ========================================
function parseArgs(req: Request) {
  const body = req.body ?? {};
  let query = req.query ?? {};
  query = { ...query };

  return { ...body, ...query };
}

interface ToolStarting {
  id: string;
  toolName: string;
  args: object;
}

async function sendToolStartLog({ id, args, toolName }: ToolStarting) {
  sendDemoLog({
    id: id ?? nanoid(),
    source: "underwriter",
    type: "tool",
    details: `${toolName}: starting`,
    args,
    result: undefined,
  });
}

interface ToolFinished {
  id: string;
  toolName: string;
  args: object;

  result: object;
}

async function sendToolFinishLog({ id, args, result, toolName }: ToolFinished) {
  sendDemoLog({
    id: id ?? nanoid(),
    source: "underwriter",
    type: "tool",
    details: `${toolName}: finished`,
    args,
    result,
  });
}

async function sleep(ms = 250) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(null);
    }, ms),
  );
}
