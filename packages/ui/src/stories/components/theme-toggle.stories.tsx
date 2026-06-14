import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "../../components/theme-toggle";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: { layout: "centered" },
  args: {
    onSetTheme: (theme: string) => console.log("theme:", theme),
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
