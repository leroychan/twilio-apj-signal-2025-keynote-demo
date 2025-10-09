import { useAppDispatch, useAppSelector } from "@/state/hooks";
import {
  getConnectedCallSids,
  getIncomingCallSids,
  removeConnectedCallSid,
  removeIncomingCallSid,
} from "@/state/sync";
import { twilioColor } from "@/styles/theme";
import { Loader, Notification, Text, Transition } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUIDSeed } from "react-uid";

export function CallNotifications() {
  const seed = useUIDSeed();

  const incomingCallSids = useAppSelector(getIncomingCallSids);
  const connectedCallSids = useAppSelector(getConnectedCallSids);

  const callSids = [...new Set([...incomingCallSids, ...connectedCallSids])];

  if (!callSids.length) return;

  return (
    <div
      style={{
        position: "absolute",
        top: `calc(var(--header-height) + 12px)`,
        right: `var(--main-padding)`,
      }}
    >
      {callSids.map((callSid) => (
        <CallNotification
          key={seed(callSid)}
          callSid={callSid}
          isConnected={connectedCallSids.includes(callSid)}
        />
      ))}
    </div>
  );
}

function CallNotification({
  callSid,
  isConnected,
}: {
  callSid: string;
  isConnected: boolean;
}) {
  const dispatch = useAppDispatch();

  // ========================================
  // Call Handling
  // ========================================

  const router = useRouter();
  const clear = () => {
    dispatch(removeIncomingCallSid(callSid));
    dispatch(removeConnectedCallSid(callSid));
  };
  const answer = () => {
    router.push(`/calls/${callSid}`);
    clear();
  };

  useEffect(() => {
    if (!callSid) return;
    if (!isConnected) return;

    const timer = setTimeout(() => {
      answer();
    }, 500);

    return () => clearTimeout(timer);
  }, [callSid, isConnected, answer]);

  // ========================================
  // Transition
  // ========================================
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!callSid) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [callSid]);

  return (
    <Transition
      mounted={visible}
      transition="fade-left"
      duration={400}
      timingFunction="ease"
    >
      {(styles) => (
        <Notification
          style={{
            border: "1px solid var(--mantine-color-gray-2)",
            ...styles,
          }}
          onClose={clear}
          color="rgba(0, 0, 0, 0)"
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text fw="bold">Incoming Call</Text>

            <div style={{ display: "flex", gap: "10px" }}>
              <Loader color={twilioColor} />
            </div>
          </div>
        </Notification>
      )}
    </Transition>
  );
}
