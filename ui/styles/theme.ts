import { createTheme, type MantineTheme } from "@mantine/core";
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const azureColor = "#008ad7";
export const twilioColor = "#f22f46";

export const theme = createTheme({
  cursorType: "pointer",
  fontFamily: inter.style.fontFamily,
  headings: { fontFamily: inter.style.fontFamily },
});
