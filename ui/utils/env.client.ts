export const NEXT_PUBLIC_USER_ID = process.env.NEXT_PUBLIC_USER_ID as string;

if (!NEXT_PUBLIC_USER_ID) throw Error("Missing env var NEXT_PUBLIC_USER_ID");
