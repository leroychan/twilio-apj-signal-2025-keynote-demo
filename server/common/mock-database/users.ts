import {
  DEMO_USER_EMAIL,
  DEMO_USER_FIRST_NAME,
  DEMO_USER_LAST_NAME,
  DEMO_USER_PHONE_NUMBER,
  USER_ID,
  ALLOWED_PHONE_NUMBERS,
  DEMO_USER_PHONE_NUMBER_2,
} from "../../env.js";
import type { UserRecord } from "../session-context.js";

let additionalPhoneNumbers: string[] = [];
if (Array.isArray(ALLOWED_PHONE_NUMBERS))
  for (const pn of ALLOWED_PHONE_NUMBERS) {
    if (pn === DEMO_USER_PHONE_NUMBER) continue;
    if (pn === DEMO_USER_PHONE_NUMBER_2) continue;

    additionalPhoneNumbers.push(pn);
  }

export const users: UserRecord[] = [
  {
    id: USER_ID,
    first_name: DEMO_USER_FIRST_NAME,
    last_name: DEMO_USER_LAST_NAME,
    email: DEMO_USER_EMAIL,
    phone: DEMO_USER_PHONE_NUMBER,
  },
  {
    id: `us-` + `2`.padStart(5, "0"),
    first_name: DEMO_USER_FIRST_NAME,
    last_name: DEMO_USER_LAST_NAME,
    email: DEMO_USER_EMAIL,
    phone: DEMO_USER_PHONE_NUMBER_2,
  },
  ...additionalPhoneNumbers.map((phone, idx) => ({
    phone,
    id: `us-` + `${idx + 3}`.padStart(5, "0"),
    first_name: "Chris",
    last_name: "Customer",
    email: "ccustomer@gmail.com",
  })),
];

// ========================================
// Simulated Methods
// ========================================
export const fetchUserByPhone = async (phone: string) => {
  const _phone = phone.replace(/\D/g, "");
  const user = users.find(
    (record) => record.phone?.replace(/\D/g, "") === _phone,
  );

  if (!user) return;

  return {
    ...user,
    id: USER_ID,
    first_name: DEMO_USER_FIRST_NAME,
    last_name: DEMO_USER_LAST_NAME,
    email: DEMO_USER_EMAIL,
    phone: DEMO_USER_PHONE_NUMBER,
  };
};
