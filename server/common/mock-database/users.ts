import {
  DEMO_USER_EMAIL,
  DEMO_USER_FIRST_NAME,
  DEMO_USER_LAST_NAME,
  DEMO_USER_PHONE_NUMBER,
  USER_ID,
} from "../../env.js";
import type { UserRecord } from "../session-context.js";

export const users: UserRecord[] = [
  {
    id: USER_ID,
    first_name: DEMO_USER_FIRST_NAME,
    last_name: DEMO_USER_LAST_NAME,
    email: DEMO_USER_EMAIL,
    phone: DEMO_USER_PHONE_NUMBER,
  },
  {
    id: "us-00002",
    first_name: "Chris",
    last_name: "Customer",
    email: "ccustomer@gmail.com",
    phone: "+18885550001",
  },
];

// ========================================
// Simulated Methods
// ========================================
export const fetchUserByPhone = async (phone: string) => {
  const _phone = phone.replace(/\D/g, "");
  return users.find((record) => record.phone?.replace(/\D/g, "") === _phone);
};
