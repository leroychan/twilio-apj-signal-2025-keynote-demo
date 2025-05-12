import { formName_1, formName_2 } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { selectSessionById, selectSessionIds } from "@/state/sessions";
import { useInitializeCall } from "@/state/sync";
import { selectAllUsers, setActiveUserId } from "@/state/users";
import Link from "next/link";
import { useUIDSeed } from "react-uid";

export default function DebugPage() {
  const callSids = useAppSelector(selectSessionIds);

  const seed = useUIDSeed();

  return (
    <div>
      Home Page
      <div>
        <b>Forms</b>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link href={`/owl/forms`}>Form Home</Link>
          <Link href={`/owl/forms/${formName_1}`}>{formName_1}</Link>
          <Link href={`/owl/forms/${formName_2}`}>{formName_2}</Link>
        </div>
      </div>
      <SelectUser />
      <div>
        <b>Calls</b>
        <div>
          {callSids.map((callSid) => (
            <CallCard key={seed(callSid)} callSid={callSid} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectUser() {
  const users = useAppSelector(selectAllUsers);
  const seed = useUIDSeed();

  const dispatch = useAppDispatch();

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "400px" }}>
      <b>Select Active User</b>
      {users.map((user) => (
        <button
          key={seed(user.id)}
          onClick={() => dispatch(setActiveUserId(user.id))}
        >
          {`${user.id} - ${user.first_name} ${user.last_name} - ${user.phone}`}
        </button>
      ))}
    </div>
  );
}

function CallCard({ callSid }: { callSid: string }) {
  useInitializeCall(callSid);
  const session = useAppSelector((state) => selectSessionById(state, callSid));

  const dt = new Date(session.dateCreated);
  const date = dt.toLocaleDateString();
  const time = dt.toLocaleTimeString().padStart(11, "0");
  const timestamp = `${date} at ${time}`;

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Link href={`/calls/${callSid}`} style={{ width: "310px" }}>
          {callSid}
        </Link>
        <div>{timestamp}</div>
      </div>
    </div>
  );
}
