import { z } from "zod";

/**
 * Shared empty schema for the parameterless dummy social templates — one-off
 * generation, no form inputs.
 */
export const dummySchema = z.object({});

export type DummyProps = z.infer<typeof dummySchema>;
