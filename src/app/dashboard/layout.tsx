export default function Dashboardlayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64">Sidebar</aside>
      {children}
    </div>
  );
}
