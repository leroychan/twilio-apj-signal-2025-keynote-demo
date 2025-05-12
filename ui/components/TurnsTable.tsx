import { useAppSelector } from "@/state/hooks";
import { selectCallTurns, selectTurnById } from "@/state/turns";
import { azureColor, twilioColor } from "@/styles/theme";
import { redactPhoneNumbers } from "@/utils/redact-phone-numbers";
import {
  Badge,
  Loader,
  Table,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { IconRobot, IconUser, IconSettings } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useUIDSeed } from "react-uid";

const MotionTr = motion(Table.Tr);

export function TurnsTable({ callSid }: { callSid: string }) {
  const seed = useUIDSeed();
  const turns = useAppSelector((state) => selectCallTurns(state, callSid));

  return (
    <Table.ScrollContainer minWidth={500} maxHeight={300}>
      <Table stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>turns</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <AnimatePresence>
            {turns.map((turn) => (
              <MotionTr
                key={seed(turn.id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {turn.role === "bot" && <BotRow turnId={turn.id} />}
                {turn.role === "human" && <HumanRow turnId={turn.id} />}
                {turn.role === "system" && <SystemRow turnId={turn.id} />}
              </MotionTr>
            ))}
          </AnimatePresence>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function BotRow({ turnId }: { turnId: string }) {
  const theme = useMantineTheme();
  const seed = useUIDSeed();

  const turn = useAppSelector((state) => selectTurnById(state, turnId));
  if (!turn) return;

  if (turn.role !== "bot") throw Error(`Expected bot turn`); // typeguard

  const content: string[] = (() => {
    if (turn.type === "tool") {
      return turn.tool_calls.map((t) =>
        `${t.function.name}(${redactPhoneNumbers(
          JSON.stringify(t.function.arguments),
        )})`.replaceAll("\\", ""),
      );
    }

    return [turn.content];
  })();

  const botColor = azureColor;
  const humanColor = twilioColor;

  return (
    <Table.Td style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
        {content.map((item) => {
          return (
            <Text key={seed(`${turnId}-${item}`)} size="md">
              <ThemeIcon
                component="span"
                color={botColor}
                variant="filled"
                radius="xl"
                size="sm"
                style={{
                  display: "inline-flex",
                  verticalAlign: "text-top",
                  marginRight: theme.spacing.xs,
                }}
              >
                <IconRobot />
              </ThemeIcon>
              {turn.type === "text" && (
                <SplitLine content={item} spoken={turn.spoken ?? ""} />
              )}
              {turn.type !== "text" && <NormalLine content={item} />}
            </Text>
          );
        })}
      </div>
      {turn.status === "interrupted" && (
        <Badge color={humanColor} ml="sm" size="sm" style={{ flex: "none" }}>
          Interrupt
        </Badge>
      )}
      {turn.status === "streaming" && (
        <Loader color={botColor} size="xs" ml="sm" />
      )}
    </Table.Td>
  );
}

function NormalLine({ content }: { content: string }) {
  return <span>{content}</span>;
}

function SplitLine({ content, spoken }: { content: string; spoken: string }) {
  // if (!spoken) return <span> {content}</span>;

  const unspoken = content.slice(spoken.length);
  const th = useMantineTheme();

  return (
    <>
      <span>{spoken}</span>
      <span style={{ color: th.colors.gray[5] }}>{unspoken}</span>
    </>
  );
}

function HumanRow({ turnId }: { turnId: string }) {
  const turn = useAppSelector((state) => selectTurnById(state, turnId));
  if (turn.role !== "human") throw Error(`Expected human turn`); // typeguard

  const th = useMantineTheme();

  return (
    <Table.Td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      <Text size="md">
        <ThemeIcon
          component="span"
          color={twilioColor}
          variant="filled"
          radius="xl"
          size="sm"
          style={{
            display: "inline-flex",
            verticalAlign: "text-top",
            marginRight: th.spacing.xs,
          }}
        >
          <IconUser />
        </ThemeIcon>
        {turn.content}
      </Text>
    </Table.Td>
  );
}

function SystemRow({ turnId }: { turnId: string }) {
  const turn = useAppSelector((state) => selectTurnById(state, turnId));
  if (turn.role !== "system") throw Error(`Expected human turn`); // typeguard

  const th = useMantineTheme();

  return (
    <Table.Td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
      <Text size="md">
        <ThemeIcon
          component="span"
          color={"black"}
          variant="filled"
          radius="xl"
          size="sm"
          style={{
            display: "inline-flex",
            verticalAlign: "text-top",
            marginRight: th.spacing.xs,
          }}
        >
          <IconSettings />
        </ThemeIcon>
        {turn.content}
      </Text>
    </Table.Td>
  );
}
