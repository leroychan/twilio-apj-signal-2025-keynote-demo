import { FormRecord_2 } from "@/shared";
import { updateOneForm } from "@/state/forms";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { selectSessionById } from "@/state/sessions";
import { twilioColor } from "@/styles/theme";
import { clipString } from "@/utils/clip-string";
import {
  ActionIcon,
  HoverCard,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowBackUp, IconRecordMail } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function BackendHeader() {
  const router = useRouter();

  const callSid = router.query.callSid as string | undefined;

  const th = useMantineTheme();

  const href = router.asPath === "/calls" ? "/" : "/calls";

  return (
    <header className="backend-header">
      <Link href={href}>
        {/* <img className="header-logo" alt="owl" src={"/owl-homes-icon.svg"} /> */}
        <Image alt="owl" src={"/owl-homes-icon.svg"} />
      </Link>

      <div
        style={{ display: "flex", alignItems: "center", gap: th.spacing.xs }}
      >
        {callSid && <CallSummary callSid={callSid} />}
        {callSid && <RecordingLink callSid={callSid} />}
      </div>
    </header>
  );
}

function CallSummary({ callSid }: { callSid: string }) {
  const session = useAppSelector((state) => selectSessionById(state, callSid));

  const title = session?.summary?.title;
  const current = session?.summary?.current ?? "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <Title order={6}>Summary</Title>
      <Text size="sm">{clipString(current, 95)}</Text>
    </div>
  );
}

function RecordingLink({ callSid }: { callSid: string }) {
  const session = useAppSelector((state) => selectSessionById(state, callSid));
  const call = session?.call;

  return (
    <HoverCard>
      <HoverCard.Target>
        <a
          href={call?.recordingUrl ?? ""}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ActionIcon color={twilioColor} radius="xl">
            <IconRecordMail />
          </ActionIcon>
        </a>
      </HoverCard.Target>

      <HoverCard.Dropdown>
        <Text size="xs">Call Recording</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export function FrontendHeader() {
  const router = useRouter();

  const formType = router.asPath?.includes("TPS") ? "D" : "TPS";

  const th = useMantineTheme();

  const dispatch = useAppDispatch();

  const reset = () => {
    const form = makeForm2();
    dispatch(updateOneForm({ id: form.id, changes: form }));
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500 + Math.floor(Math.random() * 1000));

    return () => clearInterval(timeout);
  }, [loading]);

  return (
    <header className="backend-header">
      <Link href={`/owl/forms/19B-8671-${formType}`}>
        <img className="header-logo" alt="owl" src={"/owl-homes-icon.svg"} />
      </Link>

      <HoverCard>
        <HoverCard.Target>
          <ActionIcon
            color={th.colors.gray[6]}
            radius="xl"
            onClick={() => {
              setLoading(true);

              reset();
            }}
            loading={loading}
          >
            <IconArrowBackUp size={16} />
          </ActionIcon>
        </HoverCard.Target>

        <HoverCard.Dropdown>
          <Text size="xs">Reset</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </header>
  );
}

function makeForm2(form: Partial<FormRecord_2> = {}): FormRecord_2 {
  const base: FormRecord_2 = {
    id: "us-00001-19B-8671-TPS",
    type: "mortgage-application",
    status: "not-started",
    error: null,
    step: "application-details",
    userId: "us-00001",
    formName: "19B-8671-TPS",

    first_name: "",
    last_name: "",
    email: "",
    phone: "",

    annunal_income_estimate: 0,
    borrower_address: { city: "", state: "", street: "", zip: "" },
    property_address: { city: "", state: "", street: "", zip: "" },
    cpa_contact: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      licenseId: "",
    },
    income: [],
    debt: [],
  };

  return { ...base, ...form };
}
