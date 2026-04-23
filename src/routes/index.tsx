import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, rolePath } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: rolePath(user.role) });
    else navigate({ to: "/login" });
  }, [user, navigate]);

  return <Navigate to="/login" />;
}
