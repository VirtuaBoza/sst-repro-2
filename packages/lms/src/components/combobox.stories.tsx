/* eslint-disable react-hooks/rules-of-hooks */
import { Combobox } from "./combobox";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Combobox> = {
  component: Combobox,
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Primary: Story = {
  args: {
    options: [
      { label: "Wade Cooper", value: "1" },
      { label: "Arlene Mccoy", value: "2" },
      { label: "Devon Webb", value: "3" },
      { label: "Tom Cook", value: "4" },
      { label: "Tanya Fox", value: "5" },
      { label: "Hellen Schmidt", value: "6" },
    ],
    placeholder: "Placeholder",
  },
};
