import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/jobrad-leasing")({
  beforeLoad: () => {
    throw redirect({ to: "/tools/jobrad-leasing-rechner", statusCode: 301 });
  },
});
