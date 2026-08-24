import { createAuth } from "../auth";

// Static instance used ONLY by the Better Auth CLI for schema generation.
// Never import this at runtime.
export const auth = createAuth({} as never);
