import { useAppSelector } from "@/state/hooks";
import { selectCallSummary } from "@/state/sessions";
import { Text, Title } from "@mantine/core";
import { useUIDSeed } from "react-uid";

export function CallMisc({ callSid }: { callSid: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Sentiment callSid={callSid} />
      <TopicsList callSid={callSid} />
    </div>
  );
}

function Sentiment({ callSid }: { callSid: string }) {
  const summary = useAppSelector((state) => selectCallSummary(state, callSid));
  const sentiment = summary?.sentiment ?? "";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "var(--mantine-spacing-xs)",
        alignItems: "center",
      }}
    >
      <Title order={6}>sentiment</Title>
      <Text>{sentiment}</Text>
    </div>
  );
}

function TopicsList({ callSid }: { callSid: string }) {
  const summary = useAppSelector((state) => selectCallSummary(state, callSid));
  const topics = summary?.topics ?? [];

  const seed = useUIDSeed();

  return (
    <div>
      <Title order={6}>topics</Title>
      {topics.map((topic) => (
        <div key={seed(callSid + topic)}>
          <Text>{topic}</Text>
        </div>
      ))}
    </div>
  );
}
