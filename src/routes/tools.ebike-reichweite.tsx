import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/ebike-reichweite")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/ebike-reichweite-rechner", statusCode: 301 });
  },
});
