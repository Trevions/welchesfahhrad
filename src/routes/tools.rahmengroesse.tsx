import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/rahmengroesse")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/rahmengroessen-rechner", statusCode: 301 });
  },
});
