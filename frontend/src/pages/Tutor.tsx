
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Bot,
  BookOpen,
  MessageSquare,
  User,
  Loader2,
  Plus,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Sidebar from "../components/Sidebar";

import {
  getCourses,
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  type Course,
  type Conversation,
  type Message,
} from "../services/api";

function Tutor() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(true);

  // Load available courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const courseData = await getCourses();

        setCourses(courseData);

        if (courseData.length > 0) {
          setSelectedCourse(courseData[0].id);
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

  // Load conversation history whenever the course changes
  useEffect(() => {
    if (selectedCourse === null) return;

    let cancelled = false;

    async function loadHistory() {
      setLoadingHistory(true);
      setError("");

      try {
        const history = await getConversations(selectedCourse!);

        if (!cancelled) {
          setConversations(history);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load conversation history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

  // Create a fresh conversation
  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
  }

  // Open an existing conversation
  async function handleOpenConversation(conversation: Conversation) {
    if (loadingMessages || sending) return;

    setConversationId(conversation.id);
    setMessages([]);
    setError("");
    setLoadingMessages(true);

    try {
      const history = await getMessages(conversation.id);
      setMessages(history);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load this conversation."
      );
    } finally {
      setLoadingMessages(false);
    }
  }

  // Change the selected course
  function handleCourseChange(courseId: number) {
    setSelectedCourse(courseId);
    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setConversations([]);
    setError("");
  }

  // Send a question to the AI tutor
  async function handleSendMessage() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !selectedCourse || sending) {
      return;
    }

    setError("");
    setSending(true);
    setQuestion("");

    try {
      let activeConversationId = conversationId;

      // Create a conversation if this is a new chat
      if (activeConversationId === null) {
        const conversation = await createConversation(
          selectedCourse,
          trimmedQuestion.slice(0, 60)
        );

        activeConversationId = conversation.id;
        setConversationId(conversation.id);
      }

      // Send the message to FastAPI
      const updatedMessages = await sendMessage(
        activeConversationId,
        trimmedQuestion
      );

      setMessages(updatedMessages);

      // Refresh the conversation history
      const updatedConversations = await getConversations(selectedCourse);
      setConversations(updatedConversations);
    } catch (err) {
      setQuestion(trimmedQuestion);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  const suggestions = [
    "Explain binary search trees",
    "What is the difference between a stack and a queue?",
    "Explain time complexity",
    "Help me study for an exam",
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100">
      <Sidebar />

      <main className="lg:ml-64">
        {/* Page header */}
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-10">
          <div>
            <p className="text-sm text-slate-500">Workspace / Learning</p>
            <h1 className="mt-1 text-xl font-semibold">AI Tutor</h1>
          </div>

          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            title={historyOpen ? "Hide history" : "Show history"}
          >
            {historyOpen ? (
              <PanelLeftClose size={19} />
            ) : (
              <PanelLeftOpen size={19} />
            )}
          </button>
        </header>

        <div className="mx-auto max-w-7xl p-6 lg:p-10">
          {/* Tutor heading */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <BrainCircuit size={25} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Your AI Study Tutor</h2>
              <p className="mt-1 text-sm text-slate-400">
                Ask questions and understand difficult concepts.
              </p>
            </div>
          </div>

          {/* Course selector */}
          <div className="mb-5">
            <label
              htmlFor="course"
              className="mb-2 block text-sm font-medium text-slate-400"
            >
              Study course
            </label>

            <select
              id="course"
              value={selectedCourse ?? ""}
              onChange={(e) => handleCourseChange(Number(e.target.value))}
              disabled={loadingCourses || courses.length === 0}
              className="w-full rounded-xl border border-white/10 bg-[#121722] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              {loadingCourses && (
                <option value="">Loading courses...</option>
              )}

              {!loadingCourses && courses.length === 0 && (
                <option value="">No courses available</option>
              )}

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chat and history layout */}
          <div
            className={`grid gap-5 ${
              historyOpen ? "lg:grid-cols-[260px_1fr]" : "grid-cols-1"
            }`}
          >
            {/* Conversation history */}
            {historyOpen && (
              <aside className="rounded-2xl border border-white/10 bg-[#121722] p-4">
                <button
                  onClick={handleNewChat}
                  disabled={sending || loadingMessages}
                  className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <Plus size={18} />
                  New Chat
                </button>

                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Clock size={16} className="text-blue-400" />
                  Recent Conversations
                </div>

                {loadingHistory ? (
                  <div className="flex items-center gap-2 py-5 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Loading history...
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="py-5 text-center text-xs text-slate-500">
                    No previous conversations yet.
                  </p>
                ) : (
                  <div className="flex max-h-[480px] flex-col gap-2 overflow-y-auto">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => handleOpenConversation(conversation)}
                        disabled={loadingMessages || sending}
                        className={`flex items-start gap-3 rounded-xl p-3 text-left transition hover:bg-white/5 disabled:opacity-50 ${
                          conversationId === conversation.id
                            ? "border border-blue-500/30 bg-blue-500/10"
                            : "border border-transparent"
                        }`}
                      >
                        <MessageSquare
                          size={16}
                          className="mt-1 shrink-0 text-blue-400"
                        />

                        <span className="min-w-0">
                          <span className="block truncate text-sm text-slate-200">
                            {conversation.title}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {new Date(
                              conversation.created_at
                            ).toLocaleDateString()}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </aside>
            )}

            {/* Main chat */}
            <div className="flex min-h-[600px] flex-col rounded-2xl border border-white/10 bg-[#121722]">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-white/10 p-5">
                <div className="rounded-full bg-blue-600/20 p-2 text-blue-400">
                  <Bot size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    StudyAI Assistant
                  </p>
                  <p className="text-xs text-emerald-400">
                    {sending ? "Thinking..." : "Ready to help"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                {loadingMessages ? (
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-400">
                    <Loader2
                      size={20}
                      className="animate-spin text-blue-400"
                    />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
                    <div className="mb-5 rounded-2xl bg-blue-500/10 p-4 text-blue-400">
                      <Sparkles size={30} />
                    </div>

                    <h3 className="text-xl font-semibold">
                      What would you like to learn today?
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                      Ask me to explain a concept, help you understand your
                      notes, or prepare you for an upcoming exam.
                    </p>

                    <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuestion(suggestion)}
                          disabled={
                            sending || loadingCourses || !selectedCourse
                          }
                          className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-left text-sm text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/5 disabled:opacity-40"
                        >
                          <MessageSquare
                            size={17}
                            className="shrink-0 text-blue-400"
                          />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                          <Bot size={18} />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "border border-white/10 bg-[#0b0d12] text-slate-200"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-[#080b11] prose-a:text-blue-400">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-7">
                            {message.content}
                          </p>
                        )}

                        {message.role === "assistant" &&
                          message.sources &&
                          message.sources.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-3">
                              <p className="mb-2 text-xs font-semibold text-slate-400">
                                Sources
                              </p>

                              {message.sources.map((source, index) => (
                                <p
                                  key={`${message.id}-source-${index}`}
                                  className="text-xs text-blue-400"
                                >
                                  {source}
                                </p>
                              ))}
                            </div>
                          )}
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                          <User size={18} />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {sending && (
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Loader2
                      size={18}
                      className="animate-spin text-blue-400"
                    />
                    StudyAI is preparing your answer...
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="border-t border-white/10 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0d12] p-3"
                >
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your AI tutor anything..."
                    disabled={sending || !selectedCourse}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      !question.trim() || sending || !selectedCourse
                    }
                    className="rounded-lg bg-blue-600 p-2.5 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>

                <p className="mt-3 text-center text-xs text-slate-600">
                  StudyAI can make mistakes. Verify important information
                  with your course materials.
                </p>
              </div>
            </div>
          </div>

          {/* Study materials information */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#121722] p-4">
            <BookOpen className="shrink-0 text-blue-400" size={20} />

            <p className="text-sm text-slate-400">
              Your tutor uses your selected course and its indexed study
              materials to provide context-aware answers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Tutor;
