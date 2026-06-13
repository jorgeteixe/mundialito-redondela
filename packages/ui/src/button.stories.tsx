import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, CalendarDays, Check, Plus, Trash2 } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "Components/Button",
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
  args: {
    children: "Crear equipo",
    icon: Plus,
    variant: "primary",
  },
  argTypes: {
    icon: {
      table: {
        disable: true,
      },
    },
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: "Ver calendario",
    icon: CalendarDays,
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Confirmar",
    icon: Check,
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Continuar",
    icon: ArrowRight,
    iconPosition: "right",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    children: "Eliminar",
    icon: Trash2,
    variant: "destructive",
  },
};

export const Loading: Story = {
  args: {
    children: "Guardando",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Inscrición pechada",
    disabled: true,
    variant: "outline",
  },
};

export const IconOnly: Story = {
  args: {
    "aria-label": "Añadir",
    children: undefined,
    icon: Plus,
    size: "icon",
  },
};
