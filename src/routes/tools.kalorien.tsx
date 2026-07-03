import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/kalorien")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/kalorien-rechner", statusCode: 301 });
  },
});
