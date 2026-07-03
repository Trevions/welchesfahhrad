import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/vergleich")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/fahrrad-vergleich", statusCode: 301 });
  },
});
