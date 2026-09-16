import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { user: data.user, isDemo: false };
      }
    } catch {
      // Supabase offline or unconfigured
    }

    if (typeof window !== "undefined") {
      const demoData = localStorage.getItem("darul_hijra_demo_user");
      if (demoData) {
        try {
          const user = JSON.parse(demoData);
          return { user, isDemo: true };
        } catch {
          localStorage.removeItem("darul_hijra_demo_user");
        }
      }
    }

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
