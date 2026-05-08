import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminSessionTimeout from "@/components/AdminSessionTimeout";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <AdminSessionTimeout />
      <AdminNavbar />
      {children}
    </AdminProtectedRoute>
  );
}