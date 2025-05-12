import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { interpolateString } from "../../../common/utils/interpolate-string.js";
import { SessionContextStore } from "../../../websocket-server/session-store/context-store.js";

export const deriveInstructions = (context: SessionContextStore) => {
  const instructionsTemplate = readAllMdFiles();

  const forms = [context.form_1] as any[];
  if (context.screenControl.formPage === "19B-8671-TPS")
    forms.push(context.form_2);

  return interpolateString(instructionsTemplate, { ...context, forms });
};

// ========================================
// Files
// ========================================
function readAllMdFiles() {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const dirPath = join(__dirname, "./");

    // Get all MD files in the directory
    const mdFiles = readdirSync(dirPath)
      .filter((file) => file.endsWith(".md"))
      .sort(); // Sort alphabetically

    // Read and concatenate all MD files
    const allInstructions = mdFiles
      .map((file) => {
        const filePath = join(dirPath, file);
        return readFileSync(filePath, "utf8");
      })
      .join("\n");

    return allInstructions;
  } catch (error) {
    console.error("Error reading MD files", error);
    throw error;
  }
}
