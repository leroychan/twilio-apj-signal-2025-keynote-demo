import { useAppSelector } from "@/state/hooks";
import { selectRecallItems } from "@/state/sessions";
import { clipString } from "@/utils/clip-string";
import { Table } from "@mantine/core";
import { AnimatePresence, motion } from "motion/react";
import { useUIDSeed } from "react-uid";

const MotionTr = motion(Table.Tr);

export function RecallTable({
  callSid,
  expanded,
}: {
  callSid: string;
  expanded: boolean;
}) {
  const seed = useUIDSeed();

  const items = useAppSelector((state) => selectRecallItems(state, callSid));

  const height = expanded ? 500 : 300;

  const truncate = (str: string) => clipString(str, 100);

  return (
    <Table.ScrollContainer minWidth={500} maxHeight={height}>
      <Table stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>cosine</Table.Th>
            <Table.Th>call summary</Table.Th>
            <Table.Th>guidance</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <AnimatePresence>
            {items.map((item) => (
              <MotionTr
                key={seed(item.document.id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <Table.Td style={{ width: "25px", textAlign: "center" }}>
                  {cosineScoreToAngle(item.score ?? 0).toFixed(2)}°
                </Table.Td>
                <Table.Td>{truncate(item.document.summary)}</Table.Td>
                <Table.Td>{truncate(item.document.feedback)}</Table.Td>
              </MotionTr>
            ))}
          </AnimatePresence>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function cosineScoreToAngle(cosineScore: number): number {
  // Ensure the score is within the valid range
  if (cosineScore < 0 || cosineScore > 1) {
    throw new Error("Cosine similarity score must be between 0 and 1");
  }

  // Calculate the angle in radians using the inverse cosine
  const angleInRadians: number = Math.acos(cosineScore);

  // Convert radians to degrees (180/π)
  const angleInDegrees: number = angleInRadians * (180 / Math.PI);

  return angleInDegrees;
}
