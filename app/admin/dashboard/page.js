
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session");

        if (!response.ok) {
          router.replace("/admin");
          return;
        }

        const data = await response.json();

        if (!data.authenticated) {
          router.replace("/admin");
          return;
        }

        setEmail(data.email);
      } catch {
        router.replace("/admin");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  if (loading) {
    return <main className="dashboard-loading">Loading dashboard...</main>;
  }

  return (
    <main className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-brand">SUAD CK</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your portfolio and projects.</p>
        </div>

        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            router.replace("/admin");
          }}
        >
          Logout
        </button>
      </header>

      <section className="dashboard-welcome">
        <span>Welcome back</span>
        <h2>{email}</h2>
        <p>Your portfolio management workspace.</p>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Projects</h3>
          <p>Manage your portfolio projects.</p>
          <button onClick={() => router.push("/admin/projects")}>
            Manage Projects →
          </button>
        </article>

        <article className="dashboard-card">
          <h3>Bookings</h3>
          <p>View meeting booking requests.</p>
          <button disabled>Coming soon</button>
        </article>
      </section>
    </main>
  );
}
