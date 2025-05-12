"use client";

import type { ChatMessageRecord } from "@/shared";
import {
  getIsChatOpen,
  selectAllChatMsgs,
  setIsChatOpen,
  setOneChatMsg,
} from "@/state/chat";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { IconRobot, IconUser } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const ChatWidget = () => {
  const theme = useMantineTheme();

  const open = useAppSelector(getIsChatOpen);
  const messages = useAppSelector(selectAllChatMsgs);

  const dispatch = useAppDispatch();
  const setOpen = (value: boolean) => dispatch(setIsChatOpen(value));
  const toggle = () => setOpen(!open);
  const setMessage = (message: ChatMessageRecord) =>
    dispatch(setOneChatMsg(message));

  const [input, setInput] = useState("");

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever a new message arrives
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const userMessage: ChatMessageRecord = {
      id: `${Math.random()}`.slice(0, 15),
      role: "user",
      message: input,
      dateCreated: now.toISOString(),
    };

    setMessage(userMessage);
    setInput("");
  };

  // Bubble colours – bot blue, user theme‑appropriate gray
  const bubbleBg = theme.colors.gray[1];

  return (
    <>
      {/* Floating Chat Icon */}
      <Box style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <ActionIcon
          radius="xl"
          size={56}
          variant="filled"
          color="blue"
          onClick={toggle}
        >
          <IconRobot size={32} />
        </ActionIcon>
      </Box>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: 500,
              height: "70vh",
              maxWidth: "80vw",
              zIndex: 1000,
            }}
          >
            <Paper withBorder shadow="lg" radius="md" h="100%" p="sm">
              <Stack h="100%" justify="space-between" gap="xs">
                {/* Header */}
                <Group justify="space-between">
                  <Group
                    gap={4}
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpen(false)}
                  >
                    <IconRobot size={20} color={theme.colors.blue[6]} />
                    <Text fw="bold" c="blue.9">
                      Front Office Virtual Assistant
                    </Text>
                  </Group>
                </Group>
                <Divider my="xs" />

                {/* Messages */}
                <ScrollArea
                  h="calc(100% - 160px)"
                  offsetScrollbars
                  viewportRef={viewportRef}
                >
                  <Stack gap="xs" pr="xs">
                    {messages.map((msg) => {
                      const isUser = msg.role === "user";

                      return (
                        <Box
                          key={msg.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: isUser ? "flex-end" : "flex-start",
                          }}
                        >
                          {/* Agent icon */}
                          {!isUser && (
                            <IconRobot
                              size={20}
                              style={{ marginRight: 4 }}
                              color={theme.colors.blue[6]}
                            />
                          )}

                          <Paper
                            p="xs"
                            radius="md"
                            bg={bubbleBg}
                            style={{ maxWidth: "75%" }}
                          >
                            <Text>{msg.message}</Text>
                          </Paper>

                          {/* User icon */}
                          {isUser && (
                            <IconUser
                              size={20}
                              style={{ marginLeft: 4 }}
                              color={theme.colors.gray[6]}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </ScrollArea>

                {/* Input */}
                <Box>
                  <Textarea
                    placeholder="Type your message..."
                    autosize
                    minRows={1}
                    maxRows={3}
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Group justify="flex-end" mt="xs">
                    <Button size="xs" onClick={handleSend}>
                      Send
                    </Button>
                  </Group>
                </Box>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
