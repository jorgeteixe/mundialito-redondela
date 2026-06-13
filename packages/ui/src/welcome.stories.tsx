import type { Meta, StoryObj } from "@storybook/react-vite";

import { Welcome } from "./welcome";

const meta = {
  title: "Components/Welcome",
  component: Welcome,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Welcome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
