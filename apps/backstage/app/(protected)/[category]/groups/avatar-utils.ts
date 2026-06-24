import type { CSSProperties } from "react";

const SATURATION = 78;
const BACKGROUND_LIGHTNESS = 90;
const BORDER_LIGHTNESS = 78;
const TEXT_LIGHTNESS = 28;

function hash(value: string) {
  let result = 0;

  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }

  return result;
}

export function groupAvatarStyle(id: string): CSSProperties {
  const hue = hash(id) % 360;

  return {
    backgroundColor: `hsl(${hue} ${SATURATION}% ${BACKGROUND_LIGHTNESS}%)`,
    borderColor: `hsl(${hue} ${SATURATION}% ${BORDER_LIGHTNESS}%)`,
    color: `hsl(${hue} 45% ${TEXT_LIGHTNESS}%)`,
  };
}
