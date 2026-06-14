import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { ModeToggle } from "../../components/mode-toggle";

const meta = {
  title: "Components/ModeToggle",
  component: ModeToggle,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div
          style={{
            width: "200px",
            minHeight: "200px",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
