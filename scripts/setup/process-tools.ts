import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { interpolateString } from "../../server/common/utils/interpolate-string.js";
import "dotenv-flow/config";

/**
 * Reads a JSON file, interpolates environment variables, and prints the result.
 *
 * @param {string} filePath - Relative path to the JSON file
 */
async function processToolManifest(filePath: string): Promise<void> {
  try {
    // Get the directory of the current script as the base
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Resolve the absolute path relative to the script's location
    const absolutePath = path.resolve(__dirname, filePath);

    // Read the JSON file
    const fileData = await fs.promises.readFile(absolutePath, "utf8");

    // Parse the JSON
    const jsonData = JSON.parse(fileData);

    // Create an object with environment variables
    const envVars = { ...process.env };

    // Process each string in the JSON with interpolateString
    const processObject = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => processObject(item));
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          result[key] = interpolateString(value, envVars);
        } else if (typeof value === "object" && value !== null) {
          result[key] = processObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    const processedJson = processObject(jsonData);

    console.log("====================================\n\n\n");

    console.log(JSON.stringify(processedJson, null, 2));
  } catch (error) {
    console.error("Error processing tool manifest:", error);
  }
}

// Path to the JSON file relative to the script
const manifestPath = "../../server/agents/underwriter-agent/tool-manifest.json";

// Execute the function
processToolManifest(manifestPath)
  .then(() => console.log("Processing complete!"))
  .catch((err) => console.error("Failed to process manifest:", err));
