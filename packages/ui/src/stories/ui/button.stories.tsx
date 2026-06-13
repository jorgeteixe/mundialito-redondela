import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../ui/button";

const meta = {
  title: "shadcn/Button",
  component: Button,
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
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "inline-radio",
      options: [
        "default",
        "sm",
        "xs",
        "lg",
        "icon",
        "icon-sm",
        "icon-xs",
        "icon-lg",
      ],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Botón" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secundario" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Contorno" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Fantasma" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Eliminar" },
};

export const Link: Story = {
  args: { variant: "link", children: "Enlace" },
};

export const Sizes: Story = {
  args: { children: "Tamaño" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">
        XS
      </Button>
      <Button {...args} size="sm">
        SM
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        LG
      </Button>
    </div>
  ),
};
