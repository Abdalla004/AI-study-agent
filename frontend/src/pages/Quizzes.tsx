
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Clock,
  Trophy,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  BookOpen,
  FileText,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  getCourses,
  getQuizzes,
  getQuiz,
  generateQuiz,
  submitQuiz,
  type Course,
  type QuizSummary,
  type QuizDetails,
  type QuizResult,
} from "../services/api";

function Quizzes() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  const [questionCount, setQuestionCount] = useState(5);

  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizDetails | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCourseData = courses.find(
    (course) => course.id === selectedCourse
  );

  // Load courses when the page opens
  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();

        setCourses(data);

        if (data.length > 0) {
          setSelectedCourse(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load courses."
        );
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  // Load quiz history whenever the course changes
  useEffect(() => {
    if (selectedCourse === null) {
      setQuizzes([]);
      return;
    }

    let cancelled = false;

    async function loadQuizzes() {
      setLoadingQuizzes(true);
      setError("");

      try {
        const data = await getQuizzes(selectedCourse!);

        if (!cancelled) {
          setQuizzes(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load quizzes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingQuizzes(false);
        }
      }
    }

    loadQuizzes();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

  // Generate a new quiz
  async function handleGenerateQuiz() {
    if (selectedCourse === null) {
      setError("Please select a course first.");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const generated = await generateQuiz(
        selectedCourse,
        difficulty,
        questionCount
      );

      const quiz = await getQuiz(generated.quiz_id);

      setActiveQuiz(quiz);
      setAnswers({});
      setCurrentQuestion(0);
      setQuizResult(null);

      const updatedQuizzes = await getQuizzes(selectedCourse);
      setQuizzes(updatedQuizzes);

      setSuccess("Your quiz was generated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate quiz."
      );
    } finally {
      setGenerating(false);
    }
  }

  // Open a previous quiz
  async function handleOpenQuiz(quizId: number) {
    setError("");
    setSuccess("");
    setGenerating(true);

    try {
      const quiz = await getQuiz(quizId);

      setActiveQuiz(quiz);
      setAnswers({});
      setCurrentQuestion(0);
      setQuizResult(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open quiz."
      );
    } finally {
      setGenerating(false);
    }
  }

  // Select an answer
  function handleAnswerSelect(answer: string) {
    if (!activeQuiz || quizResult) {
      return;
    }

    const questionNumber =
      activeQuiz.questions[currentQuestion].question_number;

    setAnswers((previous) => ({
      ...previous,
      [questionNumber]: answer,
    }));
  }

  // Submit the completed quiz
  async function handleSubmitQuiz() {
    if (!activeQuiz) {
      return;
    }

    if (Object.keys(answers).length !== activeQuiz.questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await submitQuiz(activeQuiz.quiz_id, answers);

      setQuizResult(result);
      setSuccess("Your quiz has been graded successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Return to the quiz generator
  function handleNewQuiz() {
    setActiveQuiz(null);
    setAnswers({});
    setCurrentQuestion(0);
    setQuizResult(null);
    setError("");
    setSuccess("");
  }

  const currentQuestionData = activeQuiz?.questions[currentQuestion];

  const answeredCount = Object.keys(answers).length;

  const progress = activeQuiz
    ? (answeredCount / activeQuiz.questions.length) * 100
    : 0;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // Reusable source-document display
  function SourceDocuments({ sources }: { sources: string[] }) {
    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <FileText size={14} className="text-blue-400" />
          Study materials used
        </div>

        {sources.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
              >
                <FileText size={13} className="shrink-0 text-blue-400" />
                {source}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Source information is unavailable for this quiz.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100">
      <Sidebar />

      <main className="lg:ml-64">
        <header className="flex h-20 items-center border-b border-white/10 px-6 lg:px-10">
          <div>
            <p className="text-sm text-slate-500">Workspace / Learning</p>
            <h1 className="mt-1 text-xl font-semibold">Quizzes</h1>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
          {/* Page heading */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">
                {quizResult
                  ? "Quiz results"
                  : activeQuiz
                    ? "Your quiz"
                    : "Test your knowledge"}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {quizResult
                  ? "Review your answers and understand your mistakes."
                  : activeQuiz
                    ? "Answer each question and submit when you're ready."
                    : "Generate practice quizzes using your course materials."}
              </p>
            </div>

            {activeQuiz && (
              <button
                onClick={handleNewQuiz}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                <ArrowLeft size={17} />
                Back to quizzes
              </button>
            )}
          </section>

          {/* Status messages */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {/* Quiz generator */}
          {!activeQuiz && (
            <>
              <section className="grid gap-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#121722] p-5">
                  <ClipboardList className="text-blue-400" size={23} />
                  <p className="mt-4 text-sm text-slate-400">
                    Available quizzes
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {quizzes.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#121722] p-5">
                  <Trophy className="text-emerald-400" size={23} />
                  <p className="mt-4 text-sm text-slate-400">
                    Selected course
                  </p>
                  <p className="mt-2 truncate text-lg font-bold">
                    {selectedCourseData?.name ?? "No course"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#121722] p-5">
                  <Clock className="text-violet-400" size={23} />
                  <p className="mt-4 text-sm text-slate-400">
                    Questions per quiz
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {questionCount}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-600/10 to-[#121722] p-6 lg:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <BrainCircuit size={25} />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      Generate a new quiz
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Let AI create questions from your uploaded study materials.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Select course
                    </label>

                    <select
                      value={selectedCourse ?? ""}
                      onChange={(event) =>
                        setSelectedCourse(Number(event.target.value))
                      }
                      disabled={loadingCourses || courses.length === 0}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0d12] p-3 text-sm outline-none focus:border-blue-500"
                    >
                      {loadingCourses && (
                        <option value="">Loading courses...</option>
                      )}

                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Difficulty
                    </label>

                    <select
                      value={difficulty}
                      onChange={(event) =>
                        setDifficulty(
                          event.target.value as "easy" | "medium" | "hard"
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#0b0d12] p-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Number of questions
                    </label>

                    <select
                      value={questionCount}
                      onChange={(event) =>
                        setQuestionCount(Number(event.target.value))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#0b0d12] p-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value={5}>5 questions</option>
                      <option value={10}>10 questions</option>
                      <option value={15}>15 questions</option>
                      <option value={20}>20 questions</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={generating || loadingCourses || courses.length === 0}
                  className="mt-7 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}

                  {generating ? "Generating quiz..." : "Generate quiz"}
                </button>
              </section>

              {/* Quiz history */}
              <section>
                <div className="mb-5">
                  <h3 className="text-lg font-semibold">Recent quizzes</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open previous practice sessions and see which materials they used.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121722]">
                  {loadingQuizzes ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-sm text-slate-400">
                      <Loader2 size={18} className="animate-spin" />
                      Loading quizzes...
                    </div>
                  ) : quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                      <button
                        key={quiz.quiz_id}
                        onClick={() => handleOpenQuiz(quiz.quiz_id)}
                        className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-white/5 p-5 text-left last:border-0 hover:bg-white/[0.03]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                            <ClipboardList size={22} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              {selectedCourseData?.name} Practice Quiz
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {quiz.question_count} questions · {quiz.difficulty} difficulty
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {formatDate(quiz.created_at)}
                            </p>

                            {quiz.sources && quiz.sources.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {quiz.sources.map((source) => (
                                  <span
                                    key={source}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-300"
                                  >
                                    <FileText size={12} />
                                    {source}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-slate-600">
                                Source information unavailable for this quiz.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-blue-400">
                          Open quiz
                          <ArrowRight size={18} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <ClipboardList
                        size={32}
                        className="mx-auto text-slate-600"
                      />
                      <p className="mt-4 text-sm text-slate-400">
                        No quizzes generated for this course yet.
                      </p>
                      <p className="mt-2 text-xs text-slate-600">
                        Generate your first quiz to get started.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Active quiz */}
          {activeQuiz && !quizResult && currentQuestionData && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#121722] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedCourseData?.name ?? "Practice quiz"}
                    </p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {activeQuiz.difficulty} difficulty
                    </p>
                  </div>

                  <p className="text-sm text-slate-400">
                    {answeredCount} / {activeQuiz.questions.length} answered
                  </p>
                </div>

                <SourceDocuments sources={activeQuiz.sources ?? []} />

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#121722] p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-blue-400">
                    Question {currentQuestion + 1} of {activeQuiz.questions.length}
                  </p>

                  <span className="rounded-lg bg-white/5 px-3 py-1 text-xs capitalize text-slate-400">
                    {activeQuiz.difficulty}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold leading-relaxed">
                  {currentQuestionData.question}
                </h3>

                <div className="mt-7 space-y-3">
                  {currentQuestionData.options.map((option, index) => {
                    const selected =
                      answers[currentQuestionData.question_number] === option;

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-500/10 text-white"
                            : "border-white/10 bg-[#0b0d12] text-slate-300 hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                            selected
                              ? "bg-blue-500 text-white"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>

                        <span className="text-sm leading-6">
                          {option}
                        </span>

                        {selected && (
                          <CheckCircle2
                            size={19}
                            className="ml-auto shrink-0 text-blue-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <button
                    onClick={() =>
                      setCurrentQuestion((previous) =>
                        Math.max(0, previous - 1)
                      )
                    }
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft size={17} />
                    Previous
                  </button>

                  {currentQuestion < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentQuestion((previous) =>
                          Math.min(activeQuiz.questions.length - 1, previous + 1)
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
                    >
                      Next question
                      <ArrowRight size={17} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {submitting && (
                        <Loader2 size={17} className="animate-spin" />
                      )}
                      {submitting ? "Grading..." : "Submit quiz"}
                      {!submitting && <CheckCircle2 size={17} />}
                    </button>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activeQuiz.questions.map((question, index) => (
                    <button
                      key={question.question_number}
                      onClick={() => setCurrentQuestion(index)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold ${
                        currentQuestion === index
                          ? "bg-blue-600 text-white"
                          : answers[question.question_number]
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-white/5 text-slate-500 hover:bg-white/10"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-slate-500">
                All questions must be answered before you can submit your quiz.
              </p>
            </section>
          )}

          {/* Quiz results */}
          {activeQuiz && quizResult && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#121722] p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Trophy size={32} />
                </div>

                <p className="mt-5 text-sm text-slate-400">
                  Your final score
                </p>

                <p className="mt-2 text-5xl font-bold">
                  {quizResult.score_percentage}%
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  You answered {quizResult.correct_answers} out of{" "}
                  {quizResult.total_questions} questions correctly.
                </p>

                <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <CheckCircle2
                      className="mx-auto text-emerald-400"
                      size={22}
                    />
                    <p className="mt-2 text-2xl font-bold text-emerald-400">
                      {quizResult.correct_answers}
                    </p>
                    <p className="text-xs text-slate-400">Correct</p>
                  </div>

                  <div className="rounded-xl bg-red-500/10 p-4">
                    <XCircle
                      className="mx-auto text-red-400"
                      size={22}
                    />
                    <p className="mt-2 text-2xl font-bold text-red-400">
                      {quizResult.incorrect_answers}
                    </p>
                    <p className="text-xs text-slate-400">Incorrect</p>
                  </div>
                </div>

                <button
                  onClick={handleNewQuiz}
                  className="mx-auto mt-7 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
                >
                  <RotateCcw size={17} />
                  Back to quizzes
                </button>
              </div>

              {/* Source documents */}
              <div className="rounded-2xl border border-white/10 bg-[#121722] p-6">
                <h3 className="font-semibold">Quiz source materials</h3>
                <SourceDocuments sources={activeQuiz.sources ?? []} />
              </div>

              {/* Individual question feedback */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  Review your answers
                </h3>

                <div className="space-y-4">
                  {quizResult.results.map((result) => (
                    <div
                      key={result.question_number}
                      className="rounded-2xl border border-white/10 bg-[#121722] p-5 lg:p-6"
                    >
                      <div className="flex items-start gap-3">
                        {result.is_correct ? (
                          <CheckCircle2
                            size={22}
                            className="mt-1 shrink-0 text-emerald-400"
                          />
                        ) : (
                          <XCircle
                            size={22}
                            className="mt-1 shrink-0 text-red-400"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500">
                            Question {result.question_number}
                          </p>

                          <h4 className="mt-2 font-semibold leading-relaxed">
                            {result.question}
                          </h4>

                          <div className="mt-4 space-y-2 text-sm">
                            <p className="text-slate-400">
                              Your answer:{" "}
                              <span
                                className={
                                  result.is_correct
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }
                              >
                                {result.student_answer}
                              </span>
                            </p>

                            {!result.is_correct && (
                              <p className="text-slate-400">
                                Correct answer:{" "}
                                <span className="text-emerald-400">
                                  {result.correct_answer}
                                </span>
                              </p>
                            )}
                          </div>

                          <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                              <BookOpen size={15} />
                              Explanation
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {result.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Quizzes;
