import type { FormNameType, SegmentInteractionLog } from "@/shared";
import { addOneChatMsg } from "@/state/chat";
import { getUserForm, updateOneForm } from "@/state/forms";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { selectSessionIds, selectSessionById } from "@/state/sessions";
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { nanoid } from "@reduxjs/toolkit";
import { IconPlus } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { ErrorModal, SuccessModal } from "./MortgageForm/FormModals";
import { AnimatedTextInput } from "./MortgageForm/TextInputAnimated";
import { useI18n } from "@/context/I18nContext";
const FS_INPUT = "md";
const FS_LABEL = "lg";

export function MortgageForm({ formName }: { formName: FormNameType }) {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => getUserForm(state, formName));

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<"success" | "error" | undefined>();

  const callSids = useAppSelector(selectSessionIds) ?? [];

  const lastCallSid = callSids[0] ?? "CA".padEnd(34, "0");
  const session = useAppSelector((state) =>
    selectSessionById(state, lastCallSid)
  );

  const { t, setLang } = useI18n();

  useEffect(() => {
    setLang(
      session?.call?.status !== "completed" && session?.screenControl?.language
        ? session.screenControl.language
        : "en-AU"
    );
  }, [session?.call?.status, session?.screenControl?.language, setLang]);

  if (!form) return null;

  const update = (changes: Partial<typeof form>) =>
    dispatch(updateOneForm({ id: form.id, changes }));
  const handleString =
    <K extends keyof typeof form & string>(field: K) =>
    (value: string) =>
      update({ [field]: value });

  const renderAddress = (prefix: "borrower_address" | "property_address") => (
    <Paper withBorder p="xs" radius="sm" mb="sm" className="paper">
      <Text fw={500} mb="xs" tt="capitalize" size={FS_LABEL}>
        {t(prefix)}
      </Text>
      <Group grow>
        {(["street", "city", "state", "zip"] as const).map((f) => (
          <AnimatedTextInput
            key={f}
            label={t(f)}
            defaultValue={form[prefix][f]}
            value={form[prefix][f]}
            onChange={(value) =>
              update({
                [prefix]: { ...form[prefix], [f]: value },
              })
            }
            size={FS_INPUT}
          />
        ))}
      </Group>
    </Paper>
  );

  const addBotMessage = (message: string) =>
    dispatch(
      addOneChatMsg({
        id: nanoid(),
        role: "bot",
        message,
        dateCreated: new Date().toISOString(),
      })
    );

  const submitD = async () => {
    setIsLoading(true);
    await sleep(500 + Math.floor(500 * Math.random()));
    setStatus("error");
    setIsLoading(false);

    if (formName !== "19B-8671-D") return;

    await sleep(7_000 + jitter());

    await sleep(500 + jitter());
    addBotMessage("Hi there, I'm Virtual AI agent for Owl Mortgage.");

    addBotMessage(
      "I see you're having trouble with your mortgage application. Would you like me to help?"
    );

    // dispatch(setIsChatOpen(true));

    // await sleep(1_500 + jitter());
    // addBotMessage("Hi there!");

    // await sleep(500 + jitter());
    // addBotMessage("I'm the Front Office AI agent for Owl Mortgage.");

    // await sleep(1000 + jitter());
    // addBotMessage(
    //   "I'm a generalist but I'm part of a larger borg with many AI specialists",
    // );

    // await sleep(3000 + jitter());
    // addBotMessage(
    //   "I see you're having trouble with your mortgage application. Would you like me to help?",
    // );

    // await sleep(1000 + jitter());
    // addBotMessage(
    //   `I can also speak with you on the phone. Or put you in touch with a human agent, if you prefer.`,
    // );

    // await sleep(1000 + jitter());
    // addBotMessage(
    //   "Owl Mortgage uses Twilio Conversation Relay so I'm fully enabled across all channels including voice.",
    // );

    // await sleep(2000 + jitter());
    // addBotMessage("My phone number is 1 (800) Owl-Mortgage");
  };

  const jitter = () => Math.floor(1000 * Math.random());

  const submitTPS = async () => {
    setIsLoading(true);
    await sleep(500 + jitter());
    if (formName !== "19B-8671-TPS") return;
    setStatus("success");

    const interaction: SegmentInteractionLog = {
      id: "success-" + `${Math.random()}`.slice(2, 10),
      callSid: lastCallSid,
      details: `New interaction added`,
      dateCreated: new Date().toISOString(),
      source: "segment",
      type: "interactions",
      interactions: [
        {
          event: `loan_app:submitted`,
          timestamp: new Date().toISOString(),
          properties: { form: formName },
        },
      ],
    };

    await fetch("/api/interactions", {
      method: "POST",
      body: JSON.stringify(interaction),
    });

    setIsLoading(false);
  };

  const submit = formName === "19B-8671-D" ? submitD : submitTPS;

  return (
    <>
      <ErrorModal
        opened={status === "error"}
        onClose={() => setStatus(undefined)}
      />
      <SuccessModal
        opened={status === "success"}
        onClose={() => setStatus(undefined)}
      />
      <Container size="md">
        <Group justify="space-between" align="center" mb="md">
          <Title order={3}>
            {t("mortgageForm")} {form.formName}
          </Title>

          <Button
            onClick={submit}
            loaderProps={{ type: "dots" }}
            loading={isLoading}
          >
            Submit
          </Button>
        </Group>

        {/* Application Details */}
        <Box mb="md">
          <Title order={4} mb="sm" size="h5">
            {t("loanDetails")}
          </Title>
          <Stack>
            <Paper withBorder p="xs" radius="sm" mb="sm" className="paper">
              <Group grow>
                <AnimatedTextInput
                  label={t("firstName")}
                  value={form.first_name}
                  defaultValue={form.first_name}
                  onChange={handleString("first_name")}
                  size={FS_INPUT}
                />
                <AnimatedTextInput
                  label={t("lastName")}
                  value={form.last_name}
                  defaultValue={form.last_name}
                  onChange={handleString("last_name")}
                  size={FS_INPUT}
                />
              </Group>
              <Group grow>
                <AnimatedTextInput
                  label={t("email")}
                  value={form.email}
                  defaultValue={form.email}
                  onChange={handleString("email")}
                  size={FS_INPUT}
                />
                <Select
                  size={FS_INPUT}
                  label={t("loanType")}
                  placeholder={t("pickValue")}
                  defaultValue={"Conventional"}
                  data={[
                    t("loanTypeConventional"),
                    t("loanTypeFHA"),
                    t("loanTypeJumbo"),
                    t("loanTypeVALoan"),
                  ]}
                />
              </Group>
            </Paper>
            {renderAddress("borrower_address")}
          </Stack>
        </Box>

        {/* Property Details */}
        <Box mb="md">{renderAddress("property_address")}</Box>
        <Divider my="xs" />
        {/* Income & Documents */}
        <Box mb="md">
          <Group mb="sm" justify="space-between">
            <Title order={4} size="h5">
              {t("incomeDocuments")}
            </Title>
            <ActionIcon color="blue" size={FS_LABEL} variant="light">
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
          {form.income.length === 0 ? (
            <Text c="dimmed" size={FS_LABEL}>
              {t("noIncomeSourcesAdded")}
            </Text>
          ) : (
            <Stack>
              {form.income.map((src, idx) => (
                <Paper
                  key={idx}
                  withBorder
                  p="xs"
                  radius="sm"
                  className="paper"
                >
                  <Text fw={500} size={FS_LABEL} mb="xs">
                    {t("source")} {idx + 1}
                  </Text>
                  <Group grow>
                    <AnimatedTextInput
                      label={t("employer")}
                      value={src.employer}
                      defaultValue={src.employer}
                      onChange={(value) =>
                        update({
                          income: form.income.map((s, i) =>
                            i === idx ? { ...s, employer: value } : s
                          ),
                        })
                      }
                      size={FS_INPUT}
                    />
                    <AnimatedTextInput
                      label={t("employmentType")}
                      value={src.employment_type}
                      defaultValue={src.employment_type}
                      onChange={(value) =>
                        update({
                          income: form.income.map((s, i) =>
                            i === idx
                              ? {
                                  ...s,
                                  employment_type: value,
                                }
                              : s
                          ),
                        })
                      }
                      size={FS_INPUT}
                    />
                    <NumberInput
                      label={t("monthlyIncome")}
                      value={src.monthly_income}
                      onChange={(value) =>
                        update({
                          income: form.income.map((s, i) =>
                            i === idx
                              ? { ...s, monthly_income: Number(value) }
                              : s
                          ),
                        })
                      }
                      prefix="$"
                      size={FS_INPUT}
                    />
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        <Divider my="xs" />

        {/* Debts */}
        {/*
        <Box mb="md">
          <Group mb="sm" justify="space-between">
            <Title order={4} size="h5">
              Debts
            </Title>
            <ActionIcon color="blue" size={FS_LABEL} variant="light">
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
          {form.debt.length === 0 ? (
            <Text c="dimmed" size={FS_LABEL}>
              No debts reported.
            </Text>
          ) : (
            <Stack>
              {form.debt.map((d, idx) => (
                <Paper
                  key={idx}
                  withBorder
                  p="xs"
                  radius="sm"
                  className="paper"
                >
                  <Text fw={500} mb="xs" size={FS_LABEL}>
                    Debt {idx + 1}
                  </Text>
                  <Group grow>
                    <AnimatedTextInput
                      label="Type"
                      value={d.type}
                      defaultValue={d.type}
                      onChange={(value) =>
                        update({
                          debt: form.debt.map((s, i) =>
                            i === idx ? { ...s, type: value as any } : s,
                          ),
                        })
                      }
                      size={FS_INPUT}
                    />
                    <NumberInput
                      label="Monthly Payment"
                      value={d.monthly_payment}
                      onChange={(value) =>
                        update({
                          debt: form.debt.map((s, i) =>
                            i === idx
                              ? { ...s, monthly_payment: Number(value) }
                              : s,
                          ),
                        })
                      }
                      prefix="$"
                      size={FS_INPUT}
                    />
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
            <Divider my="xs" />
*/}

        {/* CPA Details */}
        {"cpa_contact" in form && (
          <>
            <Divider my="xs" />
            <Box mb="md">
              <Title order={4} size="h5" mb="sm">
                {t("cpaDetails")}
              </Title>
              <Stack>
                <Group grow>
                  <AnimatedTextInput
                    label={t("firstName")}
                    value={form.cpa_contact.first_name}
                    defaultValue={form.cpa_contact.first_name}
                    onChange={(value) =>
                      update({
                        cpa_contact: {
                          ...form.cpa_contact,
                          first_name: value,
                        },
                      })
                    }
                    size={FS_INPUT}
                  />
                  <AnimatedTextInput
                    label={t("lastName")}
                    value={form.cpa_contact.last_name}
                    defaultValue={form.cpa_contact.last_name}
                    onChange={(value) =>
                      update({
                        cpa_contact: {
                          ...form.cpa_contact,
                          last_name: value,
                        },
                      })
                    }
                    size={FS_INPUT}
                  />
                </Group>
                <Group grow>
                  <AnimatedTextInput
                    label={t("phone")}
                    value={form.cpa_contact.phone}
                    defaultValue={form.cpa_contact.phone}
                    onChange={(value) =>
                      update({
                        cpa_contact: {
                          ...form.cpa_contact,
                          phone: value,
                        },
                      })
                    }
                    size={FS_INPUT}
                  />
                  <AnimatedTextInput
                    label={t("email")}
                    value={form.cpa_contact.email}
                    defaultValue={form.cpa_contact.email}
                    onChange={(value) =>
                      update({
                        cpa_contact: {
                          ...form.cpa_contact,
                          email: value,
                        },
                      })
                    }
                    size={FS_INPUT}
                  />
                </Group>
                <AnimatedTextInput
                  label={t("licenseID")}
                  value={form.cpa_contact.licenseId}
                  defaultValue={form.cpa_contact.licenseId}
                  onChange={(value) =>
                    update({
                      cpa_contact: {
                        ...form.cpa_contact,
                        licenseId: value,
                      },
                    })
                  }
                  size={FS_INPUT}
                />
              </Stack>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}

async function sleep(ms = 500) {
  return await new Promise((resolve) => setTimeout(() => resolve(null), ms));
}
