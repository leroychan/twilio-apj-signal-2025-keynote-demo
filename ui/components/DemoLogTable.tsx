import { DemoLogSource, SegmentInteractionLog } from "@/shared";
import { useAppSelector } from "@/state/hooks";
import { selectCallDemoLogs, selectLogById } from "@/state/logs";
import { Table, Text, useMantineTheme } from "@mantine/core";
import { AnimatePresence, motion } from "motion/react";
import { useUIDSeed } from "react-uid";
import IconAzureCognative from "./icons/IconAzureCognative";
import IconAzureFoundry from "./icons/IconAzureFoundry";
import IconLlama from "./icons/IconLlama";
import { IconSegment } from "./icons/IconSegment";

const MotionTr = motion(Table.Tr);

export function DemoLogTable({ callSid }: { callSid: string }) {
  const seed = useUIDSeed();
  const items = useAppSelector((state) => selectCallDemoLogs(state, callSid));

  return (
    <Table.ScrollContainer minWidth={500} maxHeight={500}>
      <Table stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: "60px", textAlign: "center" }}>
              source
            </Table.Th>
            <Table.Th style={{ width: "90px", textAlign: "center" }}>
              process
            </Table.Th>
            <Table.Th>details</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <AnimatePresence>
            {items.map((item) => (
              <MotionTr
                key={seed(item.id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <ItemSwitch callSid={callSid} itemId={item.id} />
              </MotionTr>
            ))}
          </AnimatePresence>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

interface LogItemProps {
  callSid: string;
  itemId: string;
}

function ItemSwitch(props: LogItemProps) {
  const item = useAppSelector((state) => selectLogById(state, props.itemId));

  if (!item) {
    console.error("demo log not found, props", props);
    return;
  }

  switch (item.source) {
    case "recall":
      return <RecallDemoLog {...props} />;

    case "segment":
      if (item.type === "interactions")
        return <SegmentInteractionLogDisplay {...props} />;
      if (item.type === "profile")
        return <SegmentProfileLogDisplay {...props} />;

    case "summary":
      return <SummaryDemoLog {...props} />;

    case "underwriter":
      return <UnderwriterItem {...props} />;

    default:
      console.warn(`unhandled demo log type. props`, props);
      return <BaseDemoLog {...props} />;
  }
}

function UnderwriterItem({ callSid, itemId }: LogItemProps) {
  const item = useAppSelector((state) => selectLogById(state, itemId));

  if (item?.source !== "underwriter") return;

  return (
    <>
      <DemoLogSourceTd source={item.source} />
      <Table.Td>
        <ProcessText text={"AI Underwriter"} />
      </Table.Td>
      <Table.Td>
        <TextDetails text={item.details} />
      </Table.Td>
    </>
  );
}

function SegmentProfileLogDisplay({ callSid, itemId }: LogItemProps) {
  const item = useAppSelector((state) => selectLogById(state, itemId));

  if (!item) return;

  return (
    <>
      <DemoLogSourceTd source={item.source} />
      <Table.Td>
        <ProcessText text="Profiles" />
      </Table.Td>
      <Table.Td>
        <TextDetails text={item.details} />
      </Table.Td>
    </>
  );
}

function SegmentInteractionLogDisplay({ itemId }: LogItemProps) {
  const seed = useUIDSeed();
  const item = useAppSelector((state) =>
    selectLogById(state, itemId),
  ) as SegmentInteractionLog;

  const delaySec = 0.075;

  const interactions = [...(item?.interactions ?? [])].reverse();

  const th = useMantineTheme();

  if (!item) return;

  return (
    <>
      <DemoLogSourceTd source={item.source} />
      <Table.Td>
        <ProcessText text="Interactions" />
      </Table.Td>
      <Table.Td>
        <TextDetails text={item.details} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: th.spacing.xs,
            maxHeight: "250px",
            overflowY: "scroll",
          }}
        >
          {interactions.map((interaction, index) => {
            const dt = new Date(interaction.timestamp);
            return (
              <motion.div
                key={seed(`${itemId}${interaction.timestamp}${index}`)}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 20.3 }}
                transition={{
                  duration: delaySec,
                  delay: (interactions.length - index) * delaySec - delaySec,
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 200px auto",
                  gap: th.spacing.xs,
                }}
              >
                <Text size="sm">
                  {dt.toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                  })}
                </Text>
                <Text size="sm">{interaction.event}</Text>
                <Text size="sm">
                  {JSON.stringify(interaction?.properties ?? {})}
                </Text>
              </motion.div>
            );
          })}
        </div>
      </Table.Td>
    </>
  );
}

function RecallDemoLog({ callSid, itemId }: LogItemProps) {
  const item = useAppSelector((state) => selectLogById(state, itemId));

  if (!item) return;

  return (
    <>
      <DemoLogSourceTd source={item.source} />
      <Table.Td>
        <ProcessText text={"Memory"} />
      </Table.Td>
      <Table.Td>
        <TextDetails text={item.details} />
      </Table.Td>
    </>
  );
}

function SummaryDemoLog({ callSid, itemId }: LogItemProps) {
  const item = useAppSelector((state) => selectLogById(state, itemId));

  if (!item) return;

  return (
    <>
      <DemoLogSourceTd source={item.source} />
      <Table.Td>
        <ProcessText text={"Intent Analyzer"} />
      </Table.Td>
      <Table.Td>
        <TextDetails text={item.details} />
      </Table.Td>
    </>
  );
}

// used for unknown
function BaseDemoLog({ callSid, itemId }: LogItemProps) {
  const item = useAppSelector((state) => selectLogById(state, itemId));

  if (!item) return;

  return (
    <>
      <DemoLogSourceTd source={item.source} />
      <Table.Td>
        <ProcessText text={item.source} />
      </Table.Td>
      <Table.Td>
        <TextDetails text={item.details} />
      </Table.Td>
    </>
  );
}

function DemoLogSourceTd({ source }: { source: DemoLogSource }) {
  const SourceIcon = () => {
    switch (source) {
      case "recall":
        return <IconAzureCognative size={28} />;

      case "underwriter":
        return <IconAzureFoundry size={28} />;

      case "segment":
        return <IconSegment size={28} />;

      case "summary":
        return <IconLlama size={24} />;

      default:
        return <Text size="sm">{source}</Text>;
    }
  };

  return (
    <Table.Td>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <SourceIcon />
      </div>
    </Table.Td>
  );
}

function ProcessText({ text }: { text: string }) {
  return (
    <Text size="sm" style={{ textAlign: "center" }}>
      {text}
    </Text>
  );
}

function TextDetails({ text }: { text: string }) {
  return <Text size="sm">{text}</Text>;
}
