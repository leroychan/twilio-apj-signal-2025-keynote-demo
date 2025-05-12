import { CallDetails } from "@/shared";
import { useMantineTheme } from "@mantine/core";
import {
  IconCircleCheck,
  IconExclamationCircle,
  IconPhoneCall,
} from "@tabler/icons-react";
import styles from "./CallStatusIcon.module.css";

export function CallStatusIcon({
  status,
}: {
  status: CallDetails["status"] | undefined;
}) {
  const th = useMantineTheme();

  switch (status) {
    case "queued":
    case "ringing":
      return (
        <div className={styles.jitterContainer}>
          <div className={styles.jitterIcon}>
            <IconPhoneCall color={th.colors.orange[5]} />
          </div>
        </div>
      );

    case "in-progress":
      return (
        <div className={styles.jitterContainer}>
          <div className={styles.jitterIcon}>
            <IconPhoneCall color={th.colors.orange[5]} />
          </div>
        </div>
      );

    case "completed":
      return <IconCircleCheck color={th.colors.green[8]} />;

    case undefined:
      return;
    case "busy":
    default:
      return (
        <div>
          <IconExclamationCircle color="red" />
        </div>
      );
  }
}
