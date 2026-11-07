
import {
    BookOpen,
    BrainCircuit,
    MessageSquare,
    FileText,
    ClipboardList,
    Search,
    Bell,
    Plus,
    ArrowUpRight,
    Clock,
    Sparkles,
    GraduationCap,
  } from "lucide-react";

  import Sidebar from "../components/Sidebar";

  const courses = [
    {
      name: "Data Structures & Algorithms",
      code: "CSCI 1933",
      progress: 72,
      color: "bg-blue-500",
      icon: "DS",
    },
    {
      name: "Cloud Computing",
      code: "IT Infrastructure",
      progress: 45,
      color: "bg-violet-500",
      icon: "CC",
    },
    {
      name: "Cybersecurity",
      code: "Information Security",
      progress: 86,
      color: "bg-emerald-500",
      icon: "CY",
    },
  ];

  const activities = [
    {
      title: "Reviewed Data Structures notes",
      detail: "Data Structures & Algorithms",
      time: "Today · 10:30 AM",
      icon: BookOpen,
    },
    {
      title: "Completed practice quiz",
      detail: "Cybersecurity",
      time: "Yesterday · 4:15 PM",
      icon: ClipboardList,
    },
    {
      title: "Uploaded lecture PDF",
      detail: "Cloud Computing",
      time: "Yesterday · 1:20 PM",
      icon: FileText,
    },
  ];

  function Dashboard() {
    return (
      <div className="min-h-screen bg-[#0b0d12] text-slate-100">
        <Sidebar />

        <main className="lg:ml-64">
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">
                Workspace / Overview
              </p>
              <h2 className="mt-1 text-xl font-semibold">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5 sm:block">
                <Search size={19} />
              </button>

              <button className="relative rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5">
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
                A
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
            <section className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-[#17243d] to-[#111827] p-8 lg:p-10">
              <div className="relative z-10 max-w-2xl">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-300">
                  <Sparkles size={17} />
                  YOUR PERSONAL AI STUDY ASSISTANT
                </div>

                <h3 className="text-3xl font-bold leading-tight lg:text-4xl">
                  Learn smarter.
                  <br />
                  Study with confidence.
                </h3>

                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                  Upload your course materials, ask questions, generate quizzes,
                  and turn your study sessions into real progress.
                </p>

                <button className="mt-7 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500">
                  <MessageSquare size={17} />
                  Start studying
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <BrainCircuit
                className="absolute -bottom-12 -right-8 hidden text-blue-400/10 sm:block"
                size={280}
              />
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Your overview</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    A snapshot of your learning activity
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Active courses", value: "03", icon: BookOpen },
                  { label: "Study sessions", value: "24", icon: Clock },
                  { label: "Quizzes completed", value: "12", icon: ClipboardList },
                  { label: "Study materials", value: "08", icon: FileText },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-[#121722] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <stat.icon size={19} className="text-blue-400" />
                    </div>
                    <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">My courses</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Continue where you left off
                  </p>
                </div>

                <button className="text-sm font-medium text-blue-400 hover:text-blue-300">
                  View all
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {courses.map((course) => (
                  <div
                    key={course.name}
                    className="rounded-2xl border border-white/10 bg-[#121722] p-6 transition hover:border-blue-500/40"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${course.color} bg-opacity-20 text-sm font-bold text-white`}
                      >
                        {course.icon}
                      </div>

                      <button className="text-slate-500 hover:text-white">
                        <ArrowUpRight size={19} />
                      </button>
                    </div>

                    <h4 className="mt-5 font-semibold">{course.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">{course.code}</p>

                    <div className="mt-6 flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#121722] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Recent activity</h3>
                  <Clock size={18} className="text-slate-500" />
                </div>

                <div className="mt-5 space-y-5">
                  {activities.map((activity) => (
                    <div
                      key={activity.title}
                      className="flex items-center gap-4"
                    >
                      <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                        <activity.icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {activity.detail}
                        </p>
                      </div>

                      <span className="text-xs text-slate-500">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-600/10 to-[#121722] p-6">
                <div className="flex items-center gap-2 text-blue-400">
                  <GraduationCap size={21} />
                  <span className="text-sm font-semibold">Study smarter</span>
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Your next study session starts here.
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Ask your AI tutor to explain difficult concepts, summarize
                  lecture notes, or generate practice questions from your
                  uploaded materials.
                </p>

                <button className="mt-6 flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-500/20">
                  <Plus size={17} />
                  Start a study session
                </button>
              </div>
            </section>

            <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-600">
              StudyAI · Your personal AI learning companion
            </footer>
          </div>
        </main>
      </div>
    );
  }

  export default Dashboard;
