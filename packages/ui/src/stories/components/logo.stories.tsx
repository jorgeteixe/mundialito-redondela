import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo } from "../../components/logo";

const meta = {
  title: "Components/Logo",
  component: Logo,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "900px",
          minHeight: "600px",
          display: "grid",
          placeItems: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "edition",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["edition", "event"],
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Edition: Story = {};

export const EventName: Story = {
  args: {
    variant: "event",
  },
};
