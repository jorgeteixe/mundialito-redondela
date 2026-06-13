import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../ui/card";
import { Button } from "../../ui/button";

const meta = {
  title: "shadcn/Card",
  component: Card,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "380px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Grupo A</CardTitle>
        <CardDescription>Fase de grupos — Jornada 1</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Los Galácticos vs Sporting Redondela</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Ver partido
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Grupo B</CardTitle>
      </CardHeader>
      <CardContent>
        <p>4 equipos — 3 partidos</p>
      </CardContent>
    </Card>
  ),
};
