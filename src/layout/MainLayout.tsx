import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 text-slate-900">{children}</div>
        </main>
      </div>
    </div>
  );
}
