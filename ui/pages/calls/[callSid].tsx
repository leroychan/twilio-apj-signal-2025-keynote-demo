import { CallMisc } from "@/components/CallMisc";
import { DemoLogTable } from "@/components/DemoLogTable";
import { RecallTable } from "@/components/RecallTable";
import { TurnsTable } from "@/components/TurnsTable";
import { Paper, Title } from "@mantine/core";
import { useRouter } from "next/router";

export default function CallPage() {
  const router = useRouter();

  const callSid = router.query.callSid as string;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--mantine-spacing-sm)",
      }}
    >
      <Paper className="paper">
        <TurnsTable callSid={callSid} />
      </Paper>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--mantine-spacing-xs)",
        }}
      >
        <Paper className="paper">
          <CallMisc callSid={callSid} />
        </Paper>
        <Paper className="paper" style={{ flex: 1 }}>
          <Title order={6}>vector memory</Title>
          <RecallTable callSid={callSid} expanded={false} />
        </Paper>
      </div>

      <Paper className="paper">
        <DemoLogTable callSid={callSid} />
      </Paper>
    </div>
  );
}
