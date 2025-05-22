import { useAppSelector } from "@/state/hooks";
import { selectCallSummary } from "@/state/sessions";
import { Badge, Text, Title, useMantineTheme } from "@mantine/core";
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

  const th = useMantineTheme();

  let color = "";
  if (sentiment === "negative") color = th.colors.red[6];
  else if (sentiment === "neutral") color = th.colors.gray[6];
  else if (sentiment === "positive") color = th.colors.green[6];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",

        gap: "var(--mantine-spacing-xs)",
      }}
    >
      <Title order={5}>sentiment</Title>
      <Badge color={color} size="lg">
        {sentiment}
      </Badge>
    </div>
  );
}

function TopicsList({ callSid }: { callSid: string }) {
  const summary = useAppSelector((state) => selectCallSummary(state, callSid));
  const topics = summary?.topics ?? [];

  const seed = useUIDSeed();

  return (
    <div>
      <Title order={5}>topics</Title>
      {topics.map((topic) => (
        <div key={seed(callSid + topic)}>
          <Text>{topic}</Text>
        </div>
      ))}
    </div>
  );
}
