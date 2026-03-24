import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, FolderOpen, History, Settings, HelpCircle } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: FolderOpen },
  { to: "/history", label: "History", icon: History },
];

export default function Layout() {
  const location = useLocation();

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 z-40 bg-surface-container-low flex flex-col py-8 px-4 shadow-2xl shadow-black/40">
        {/* Logo */}
        <div className="mb-12 px-4">
          <Link to="/" className="group">
            <h1 className="font-serif text-lg text-primary">QuizGen</h1>
            <p className="text-[10px] uppercase tracking-widest text-secondary">
              AI-Powered Learning
            </p>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 ${
                isActive(to)
                  ? "bg-surface-container-high text-primary border-l-4 border-primary scale-[0.98]"
                  : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm uppercase tracking-widest">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-6">
          <div className="pt-6 border-t border-outline-variant/10">
            <a
              href="#"
              className="flex items-center gap-4 text-secondary px-4 py-2 hover:text-on-surface transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm uppercase tracking-widest">Support</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-4 text-secondary px-4 py-2 hover:text-on-surface transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm uppercase tracking-widest">Settings</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 min-h-screen flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-surface-container-low">
          <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
            <span className="text-xl font-serif italic text-primary">
              The Digital Curator
            </span>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant/10">
                <svg
                  className="h-4 w-4 text-secondary mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  className="bg-transparent border-none text-sm focus:outline-none text-on-surface w-48 placeholder-secondary"
                  placeholder="Search materials..."
                  type="text"
                />
              </div>
              <button className="text-secondary hover:text-primary transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-12 max-w-screen-2xl mx-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
