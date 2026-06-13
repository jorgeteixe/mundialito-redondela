import type { Meta, StoryObj } from "@storybook/react-vite";
import { OpenGraphImage } from "../../components/open-graph-image";

const meta = {
  title: "Components/OpenGraphImage",
  component: OpenGraphImage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    subtitle: "Torneo de Fútbol de Calle",
    location: "Pista de A Xunqueira, Redondela",
    dates: "Del 29 de junio al 24 de julio de 2026",
    description:
      "Sigue los resultados, estadísticas y calendario en tiempo real",
  },
  argTypes: {
    subtitle: { control: "text" },
    location: { control: "text" },
    dates: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof OpenGraphImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
