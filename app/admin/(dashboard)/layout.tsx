import { AdminNavigation } from "./admin-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen sm:pl-60">
      <AdminNavigation />
      {children}
    </div>
  );
}
