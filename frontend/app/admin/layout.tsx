import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminSessionTimeout from "@/components/AdminSessionTimeout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <AdminSessionTimeout />
      {children}
    </AdminProtectedRoute>
  );
}