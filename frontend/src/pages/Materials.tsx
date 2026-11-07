
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  BookOpen,
  Trash2,
  FilePlus2,
  FolderOpen,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  getCourses,
  getDocuments,
  uploadDocument,
  deleteDocument,
  type Course,
  type Document,
} from "../services/api";

function Materials() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load courses when the page opens
  useEffect(() => {
    async function loadCourses() {
      try {
        const courseData = await getCourses();

        setCourses(courseData);

        if (courseData.length > 0) {
          setSelectedCourseId(courseData[0].id);
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

  // Load documents whenever the selected course changes
  useEffect(() => {
    if (selectedCourseId === null) {
      setDocuments([]);
      return;
    }

    let cancelled = false;

    async function loadDocuments() {
      setLoadingDocuments(true);
      setError("");

      try {
        const documentData = await getDocuments(selectedCourseId!);

        if (!cancelled) {
          setDocuments(documentData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load documents."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDocuments(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  // Upload a selected PDF
  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || selectedCourseId === null) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("The PDF must be smaller than 20 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const uploadedDocument = await uploadDocument(
        selectedCourseId,
        file
      );

      setDocuments((previous) => [
        uploadedDocument,
        ...previous,
      ]);

      setSuccess(`${file.name} uploaded and processed successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Document upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Delete a document
  async function handleDelete(document: Document) {
    if (selectedCourseId === null) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.filename}"? This will also remove its AI search data.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(document.id);

    try {
      await deleteDocument(selectedCourseId, document.id);

      setDocuments((previous) =>
        previous.filter((item) => item.id !== document.id)
      );

      setSuccess(`${document.filename} was deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Document deletion failed."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredDocuments = documents.filter((document) =>
    document.filename.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCharacters(characters: number) {
    return characters.toLocaleString();
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100">
      <Sidebar />

      <main className="lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-10">
          <div>
            <p className="text-sm text-slate-500">Workspace / Learning</p>
            <h1 className="mt-1 text-xl font-semibold">Study Materials</h1>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
          <section className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-3xl font-bold">Your study library</h2>
              <p className="mt-2 text-sm text-slate-400">
                Organize your lecture notes, PDFs, and learning resources.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || selectedCourseId === null}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              {uploading ? "Uploading..." : "Upload material"}
            </button>
          </section>

          {/* Course selector */}
          <section className="rounded-2xl border border-white/10 bg-[#121722] p-5">
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Select a course
            </label>

            {loadingCourses ? (
              <p className="text-sm text-slate-500">Loading courses...</p>
            ) : courses.length > 0 ? (
              <select
                value={selectedCourseId ?? ""}
                onChange={(event) =>
                  setSelectedCourseId(Number(event.target.value))
                }
                className="w-full rounded-xl border border-white/10 bg-[#0b0d12] px-4 py-3 text-sm text-white outline-none focus:border-blue-500 sm:max-w-md"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-500">
                No courses found. Create a course before uploading materials.
              </p>
            )}

            {selectedCourse?.description && (
              <p className="mt-3 text-sm text-slate-500">
                {selectedCourse.description}
              </p>
            )}
          </section>

          {/* Hidden PDF input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload area */}
          <section className="rounded-2xl border border-dashed border-blue-400/30 bg-blue-500/5 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <FilePlus2 size={30} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Add materials to your library
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Upload PDF documents to help your AI tutor understand your
              course content and answer questions using your materials.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || selectedCourseId === null}
              className="mt-6 rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {uploading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Upload size={17} />
                )}
                {uploading ? "Processing PDF..." : "Select PDF"}
              </span>
            </button>

            <p className="mt-4 text-xs text-slate-600">
              PDF documents supported · Maximum file size: 20 MB
            </p>
          </section>

          {/* Status messages */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              {success}
            </div>
          )}

          {/* Document list */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Recent documents</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {documents.length} document
                  {documents.length === 1 ? "" : "s"} in{" "}
                  {selectedCourse?.name ?? "your course"}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#121722] px-3 py-2.5">
                <Search size={17} className="text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search documents..."
                  className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121722]">
              {loadingDocuments ? (
                <div className="flex items-center justify-center gap-3 p-10 text-sm text-slate-400">
                  <Loader2 size={18} className="animate-spin" />
                  Loading documents...
                </div>
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 p-5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                        <FileText size={22} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {document.filename}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {selectedCourse?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-slate-400">
                          {document.chunks_created} text chunks
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCharacters(document.characters)} characters
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(document.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(document)}
                        disabled={deletingId === document.id}
                        title="Delete document"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                      >
                        {deletingId === document.id ? (
                          <Loader2 size={19} className="animate-spin" />
                        ) : (
                          <Trash2 size={19} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <FileText
                    size={32}
                    className="mx-auto text-slate-600"
                  />
                  <p className="mt-4 text-sm text-slate-400">
                    {search
                      ? "No documents match your search."
                      : "No documents uploaded to this course yet."}
                  </p>
                  {!search && (
                    <p className="mt-2 text-xs text-slate-600">
                      Upload a PDF to get started.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Information cards */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#121722] p-5">
              <div className="flex items-center gap-3">
                <FolderOpen className="text-blue-400" size={22} />
                <h3 className="font-semibold">Course organization</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Keep your study documents organized by course.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121722] p-5">
              <div className="flex items-center gap-3">
                <BookOpen className="text-blue-400" size={22} />
                <h3 className="font-semibold">AI-powered learning</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Use uploaded materials as context for your AI tutor.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Materials;
