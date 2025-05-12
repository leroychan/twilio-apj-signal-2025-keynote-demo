import { CallNotifications } from "@/components/CallNotifications";
import { CallTable } from "@/components/CallTable";
import { Paper } from "@mantine/core";

export default function CallsHomePage() {
  return (
    <>
      <div>
        <Paper className="paper">
          <CallTable />
        </Paper>
      </div>
      <CallNotifications />
    </>
  );
}
