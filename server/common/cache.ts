let activeCallSid: string | undefined = undefined;

export const getActiveCallSid = () => activeCallSid;

export const setActiveCallSid = (callSid: string | undefined) =>
  (activeCallSid = callSid);
