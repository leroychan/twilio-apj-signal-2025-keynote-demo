import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

/****************************************************
 - This is a stopwatch-style logger for development. It is designed to aid in debugging latency issues. Each log entry includes the elapsed time since the logger started and the time since the last log, enabling quick identification of latency patterns.
 - Logs are saved in the `logs/` directory with filenames based on the start timestamp, allowing easy identification of log sessions.
 - This logger is for development use only, as it is not optimized for production environments.
****************************************************/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createLogStreamer = (fileName: string) => {
  // Ensure path is within logs directory
  const filePath = path.join(__dirname, "../../../logs", fileName);

  // Delete existing file if it exists
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Create write stream
  const stream = fs.createWriteStream(filePath);

  return {
    write: (...messages: any[]) => {
      const line =
        messages
          .map((msg) =>
            typeof msg === "object" ? JSON.stringify(msg) : String(msg),
          )
          .join(" ") + "\n";

      stream.write(line);
    },
    close: () => {
      stream.end();
    },
  };
};
