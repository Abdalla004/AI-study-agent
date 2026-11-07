
import { BookOpen, Plus, ArrowUpRight } from "lucide-react";
import Sidebar from "../components/Sidebar";

const courses = [
  {
    name: "Data Structures & Algorithms",
    code: "CSCI 1933",
    description: "Learn data structures, algorithms, and problem-solving.",
    progress: 72,
    color: "bg-blue-500",
  },
  {
    name: "Cloud Computing",
    code: "IT Infrastructure",
    description: "Explore cloud platforms, services, and infrastructure.",
    progress: 45,
    color: "bg-violet-500",
  },
  {
    name: "Cybersecurity",
    code: "Information Security",
    description: "Study security principles, threats, and defenses.",
    progress: 86,
    color: "bg-emerald-500",
  },
];

function Courses() {
  return (
    <>
      <Sidebar />

      <div className="min-h-screen bg-[#0b0d12] p-8 text-slate-100 lg:ml-64">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Workspace / Learning
              </p>
              <h1 className="mt-2 text-3xl font-bold">My Courses</h1>
              <p className="mt-2 text-slate-400">
                Manage your courses and track your learning progress.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">
              <Plus size={18} />
              Add Course
            </button>
          </div>

          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.code}
                className="rounded-2xl border border-white/10 bg-[#121722] p-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl ${course.color} bg-opacity-20 p-3`}>
                    <BookOpen className="text-blue-300" size={24} />
                  </div>

                  <ArrowUpRight className="text-slate-500" size={20} />
                </div>

                <h2 className="mt-6 text-lg font-semibold">
                  {course.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {course.code}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {course.description}
                </p>

                <div className="mt-7 flex justify-between text-sm">
                  <span className="text-slate-400">Course progress</span>
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
        </div>
      </div>
    </>
  );
}

export default Courses;
