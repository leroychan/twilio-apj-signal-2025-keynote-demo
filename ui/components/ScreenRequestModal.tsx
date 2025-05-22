import { ScreenControlState } from "@/shared";
import { useAppSelector } from "@/state/hooks";
import {
  selectScreenRequestSessions,
  selectSessionById,
} from "@/state/sessions";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconCheck, IconScreenShare, IconX } from "@tabler/icons-react";
import lowerCase from "lodash.lowercase";
import { useUIDSeed } from "react-uid";
import { AnimatePresence, motion } from "motion/react";

export function ScreenRequestModal() {
  const requests = useAppSelector(selectScreenRequestSessions);
  const seed = useUIDSeed();

  return (
    <div
      style={{
        position: "absolute",
        top: `calc(var(--header-height) + 12px)`,
        right: `var(--main-padding)`,
      }}
    >
      <AnimatePresence>
        {requests.map((session) => (
          <motion.div
            key={seed(session.callSid)}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: "12px" }}
          >
            <ScreenRequest callSid={session.callSid} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ScreenRequest({ callSid }: { callSid: string }) {
  const session = useAppSelector((state) => selectSessionById(state, callSid));

  const accept = async () => {
    const screenControl: ScreenControlState = {
      ...((session.screenControl ?? {}) as ScreenControlState),
      permission: "approved",
    };
    await fetch(`/api/calls/${callSid}/screenControl`, {
      method: "POST",
      body: JSON.stringify(screenControl),
    });
  };

  const reject = async () => {
    const screenControl: ScreenControlState = {
      ...((session.screenControl ?? {}) as ScreenControlState),
      permission: "rejected",
    };
    await fetch(`/api/calls/${callSid}/screenControl`, {
      method: "POST",
      body: JSON.stringify(screenControl),
    });
  };

  const scope = session?.screenControl?.scope ?? "view_and_control";

  return (
    <Paper p="md" shadow="sm" withBorder radius="md" w={350}>
      <Stack gap="md">
        <Group gap="xs">
          <IconScreenShare size={20} />
          <Text>Screen Control Request</Text>
        </Group>

        <Group gap="xs">
          <Text size="sm">
            Allow Virtual Agent to <b>{lowerCase(scope)}</b> your screen?
          </Text>
        </Group>

        <Group justify="space-between" gap="xs">
          <Button
            leftSection={<IconX size={16} />}
            color="red"
            onClick={reject}
            variant="light"
            size="xs"
          >
            Decline
          </Button>
          <Button
            leftSection={<IconCheck size={16} />}
            color="green"
            onClick={accept}
            variant="light"
            size="xs"
          >
            Accept
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
