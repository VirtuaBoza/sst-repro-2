import "../src/app/global.css";
import React from "react";
import { Inter as FontSans } from "next/font/google";
import type { Preview } from "@storybook/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${`font-sans ${fontSans.variable}`}`}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
