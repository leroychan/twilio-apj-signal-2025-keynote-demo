import { ActionIcon, Button, Group, Loader, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export function DeleteCallModal({
  selectedSids,
  setSelectedSids,
}: {
  selectedSids: string[];
  setSelectedSids: (sids: string[]) => any;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    console.log("Deleting calls:", selectedSids);
    setIsDeleting(true);

    for (const callSid of selectedSids) {
      await fetch(`/api/calls/${callSid}`, { method: "DELETE" });
    }
    setIsDeleting(false);
    setSelectedSids([]);
    close();
  };

  return (
    <>
      {!!selectedSids.length && (
        <ActionIcon
          size="sm"
          color="red"
          variant="light"
          onClick={open}
          title="Delete selected calls"
        >
          <IconTrash />
        </ActionIcon>
      )}

      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Text size="sm">
          Are you sure you want to delete {selectedSids.length} selected call
          {selectedSids.length !== 1 ? "s" : ""}?
        </Text>
        <Group mt="md">
          <Button variant="subtle" onClick={close} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>

          {isDeleting && <Loader />}
        </Group>
      </Modal>
    </>
  );
}
