import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/reifendruck")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/reifendruck-rechner", statusCode: 301 });
  },
});
