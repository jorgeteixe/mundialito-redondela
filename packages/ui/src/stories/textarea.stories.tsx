import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "../ui/textarea";

const meta = {
  title: "shadcn/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "320px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Escribe una nota sobre el partido..." },
};

export const Disabled: Story = {
  args: { placeholder: "Deshabilitado", disabled: true },
};
