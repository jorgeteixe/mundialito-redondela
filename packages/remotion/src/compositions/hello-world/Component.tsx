import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mr/ui";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { HelloWorldProps } from "./schema";

export function HelloWorld({ title }: HelloWorldProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(enter, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b6e4f",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Render the UI tree at its natural size and scale the whole subtree, so
          radii/borders/padding stay proportional. */}
      <div style={{ transform: `scale(${2.2 * scale})` }}>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>XLVII · A Xunqueira</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Badge>Senior</Badge>
              <Badge variant="secondary">Cadete</Badge>
              <Badge variant="destructive">EN VIVO</Badge>
            </div>
            <Button>Ver partidos</Button>
          </CardContent>
        </Card>
      </div>
    </AbsoluteFill>
  );
}
