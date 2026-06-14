import { z } from "zod";

/**
 * One zod schema per template. It validates the form input (later, in backstage)
 * and drives the auto-generated props editor in Remotion Studio.
 */
export const helloWorldSchema = z.object({
  title: z.string(),
});

export type HelloWorldProps = z.infer<typeof helloWorldSchema>;
