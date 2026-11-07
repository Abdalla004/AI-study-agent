import {
    BrainCircuit,
    LayoutDashboard,
    BookOpen,
    MessageSquare,
    FileText,
    ClipboardList,
    Settings,
  } from "lucide-react";

  import { NavLink } from "react-router-dom";

  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "My Courses", path: "/courses", icon: BookOpen },
    { name: "AI Tutor", path: "/tutor", icon: MessageSquare },
    { name: "Study Materials", path: "/materials", icon: FileText },
    { name: "Quizzes", path: "/quizzes", icon: ClipboardList },
  ];

  function Sidebar() {
    return (
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-white/10 bg-[#10131b] p-6 lg:flex">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <BrainCircuit size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold">StudyAI</h1>
            <p className="text-xs text-slate-500">
              Your AI learning companion
            </p>
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={19} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5">
            <Settings size={19} />
            Settings
          </button>

          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 font-semibold text-blue-400">
              A
            </div>

            <div>
              <p className="text-sm font-semibold">Student</p>
              <p className="text-xs text-slate-500">
                Personal workspace
              </p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  export default Sidebar;
