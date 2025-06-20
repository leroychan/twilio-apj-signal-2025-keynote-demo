import { ChatWidget } from "@/components/ChatWidget";
import { MortgageForm } from "@/components/MortgageForm";
import type { FormNameType } from "@/shared";
import { useAppSelector } from "@/state/hooks";
import { selectSessionIds } from "@/state/sessions";
import { useInitializeCall } from "@/state/sync";
import { useRouter } from "next/router";
import { useUIDSeed } from "react-uid";

export default function FormPage() {
  const seedCall = useUIDSeed();

  const router = useRouter();
  const formName = router.query.formName as FormNameType;
  const callSids = useAppSelector(selectSessionIds);

  return (
    <div>
      <MortgageForm formName={formName} />
      {callSids.slice(0, 5).map((callSid) => (
        <CallLoader key={seedCall(callSid)} callSid={callSid} />
      ))}
      <ChatWidget />
    </div>
  );
}

// ensure all calls are hydrated & subscribed to
function CallLoader({ callSid }: { callSid: string }) {
  useInitializeCall(callSid);

  return <></>;
}
