import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../../ui/input";

const meta = {
  title: "shadcn/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "320px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Escribe algo..." },
};

export const Disabled: Story = {
  args: { placeholder: "Deshabilitado", disabled: true },
};

export const Invalid: Story = {
  args: { placeholder: "Campo inválido", "aria-invalid": true },
};
