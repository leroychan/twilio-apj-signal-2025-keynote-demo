import { nanoid } from "nanoid";
import { SegmentInteraction, UserRecord } from "./session-context.js";
import { FORM_NAME_1 } from "./forms.js";

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

export function fetchSegmentInteractions(user: UserRecord) {
  const userId = user.id;
  const formId = `${Math.random()}`.slice(2, 9);

  const now = new Date();
  const start = addDays(now, -5 * 30); // ≈ five months ago

  const interactions: SegmentInteraction[] = [];

  const TT = {
    account: "account",
    pre_approval: "pre_approval",
    credit_check: "credit_check",
    loan_app: "loan_app",
    underwriting: "underwriting",
    support: "support",
  };

  const loanAmts = [500_000, 775_000];

  // --- 5 months ago ---------------------------------------------------------
  const preApprove1Start = start;
  interactions.push({
    event: `${TT.account}:created`,
    timestamp: preApprove1Start.toISOString(),
    properties: {
      userId: user.id,
      channel: "web",
    },
  });

  interactions.push({
    event: `${TT.pre_approval}:submitted`,
    timestamp: preApprove1Start.toISOString(),
    properties: {
      loanType: "conventional",
      amountRequested: loanAmts[0],
      channel: "web",
    },
  });

  interactions.push({
    event: `${TT.credit_check}:soft`,
    timestamp: addDays(preApprove1Start, 1).toISOString(),
    properties: {
      transUnionScore: 801,
    },
  });

  interactions.push({
    event: `${TT.pre_approval}:approved`,
    timestamp: addDays(preApprove1Start, 2).toISOString(),
    properties: {
      approvedAmount: loanAmts[0],
      loanTermMonths: 360,
    },
  });

  // --- 3 months ago ---------------------------------------------------------
  const preApprove2Start = addDays(start, 60);
  interactions.push({
    event: `${TT.pre_approval}:submitted`,
    timestamp: preApprove2Start.toISOString(),
    properties: {
      loanType: "conventional",
      amountRequested: loanAmts[1],
      channel: "agent",
    },
  });

  interactions.push({
    event: `${TT.credit_check}:soft`,
    timestamp: preApprove2Start.toISOString(),
    properties: {
      equifaxScore: 803,
    },
  });

  interactions.push({
    event: `${TT.pre_approval}:approved`,
    timestamp: addDays(preApprove2Start, 1).toISOString(),
    properties: {
      approvedAmount: loanAmts[1],
      loanTermMonths: 360,
    },
  });

  // --- 1 month ago ----------------------------------------------------------
  const formStarted = addDays(start, 130);
  interactions.push({
    event: `${TT.loan_app}:started`,
    timestamp: formStarted.toISOString(),
    properties: {
      formId,
      type: FORM_NAME_1,
    },
  });

  // --- 2 weeks ago ----------------------------------------------------------
  const docsUploaded = addDays(now, -14);
  interactions.push({
    event: `${TT.loan_app}:doc_upload:1065`,
    timestamp: docsUploaded.toISOString(),
    properties: {
      name: "Urban Cafe, LLC",
      type: "1065",
    },
  });

  interactions.push({
    event: `${TT.loan_app}:doc_upload:1120s`,
    timestamp: docsUploaded.toISOString(),
    properties: {
      name: "Harvest Kitchen, Inc.",
      type: "1120S",
    },
  });

  interactions.push({
    event: `${TT.loan_app}:doc_upload:1120s`,
    timestamp: addDays(docsUploaded, -2).toISOString(),
    properties: {
      name: "The Sandwich Shop",
      type: "1120S",
    },
  });

  const cdViewed = addDays(now, -2);
  interactions.push({
    event: `${TT.loan_app}:disclosure:signed`,
    timestamp: cdViewed.toISOString(),
    properties: {},
  });

  interactions.push({
    event: `${TT.loan_app}:error:missing_tps`,
    timestamp: now.toISOString(),
    properties: {
      formId,
      errorCode: "TPS-MISSING",
    },
  });

  // 3. Return profile + sorted interactions
  return interactions.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}
