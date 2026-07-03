import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/uebersetzung")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/uebersetzung-rechner", statusCode: 301 });
  },
});
