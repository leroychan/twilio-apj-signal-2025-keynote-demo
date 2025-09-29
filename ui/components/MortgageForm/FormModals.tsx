import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { IconAlertHexagon, IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";

type ErrorModalProps = {
  opened: boolean;
  onClose: () => void;
};

const MotionAlertHexagon = motion(IconAlertHexagon);

export const ErrorModal = ({ opened, onClose }: ErrorModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <MotionAlertHexagon
            size={24}
            color="red"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -15, 15, -10, 10, -5, 5, 0] }}
            transition={{
              duration: 0.6,
              times: [0, 0.1, 0.3, 0.4, 0.6, 0.7, 0.9, 1],
              ease: "easeInOut",
              repeat: 2,
              repeatDelay: 0.2,
              repeatType: "loop",
            }}
          />
          <Title order={3}>Error</Title>
        </Group>
      }
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap="md">
        <Group gap="sm" align="center">
          <Text size="lg" fw="bold">
            Missing TPS Report
          </Text>
        </Group>
        <Text size="sm" c="dimmed">
          We couldn&apos;t process your mortgage application due to missing
          information. Please check your inputs and try again.
        </Text>
        <Text size="sm" c="dimmed">
          Contact Owl Support at +61468031717
        </Text>
        <Button color="red" onClick={onClose} fullWidth mt="md">
          Close
        </Button>
      </Stack>
    </Modal>
  );
};

type SuccessModalProps = {
  opened: boolean;
  onClose: () => void;
};

const MotionCheck = motion(IconCheck);

export const SuccessModal = ({ opened, onClose }: SuccessModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <MotionCheck
            size={24}
            color="green"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 0.6,
              times: [0, 0.5, 1],
              ease: "easeInOut",
              repeat: 2,
              repeatDelay: 0.2,
              repeatType: "loop",
            }}
          />
          <Title order={3}>Success</Title>
        </Group>
      }
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap="md">
        <Group gap="sm" align="center">
          <Text size="lg" fw="bold">
            Application Submitted
          </Text>
        </Group>
        <Text size="sm" c="dimmed">
          We&apos;ve received your mortgage application and will begin
          processing it immediately. You&apos;ll receive a confirmation email
          shortly.
        </Text>
        <Text size="sm" c="dimmed">
          Processing typically takes 1-2 business days.
        </Text>
        <Button color="green" onClick={onClose} fullWidth mt="md">
          Great!
        </Button>
      </Stack>
    </Modal>
  );
};
