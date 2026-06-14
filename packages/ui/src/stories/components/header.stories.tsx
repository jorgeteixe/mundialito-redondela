import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { Header } from "../../components/header";
import { ModeToggle } from "../../components/mode-toggle";
import { Button } from "../../ui/button";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div style={{ width: "900px", minHeight: "200px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = (
  <>
    <Button variant="ghost" size="sm">
      Equipos
    </Button>
    <Button variant="ghost" size="sm">
      Calendario
    </Button>
    <Button variant="ghost" size="sm">
      Resultados
    </Button>
  </>
);

export const Default: Story = {
  args: {
    edition: "XLVII",
    eventName: "Mundialito da Xunqueira",
    navItems,
    actions: <ModeToggle />,
  },
};
