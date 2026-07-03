import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/foerderung")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/ebike-foerderung-rechner", statusCode: 301 });
  },
});
