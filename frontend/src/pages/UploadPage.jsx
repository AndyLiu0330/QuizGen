import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, FileText, Sparkles, Upload } from "lucide-react";
import FileUpload from "../components/FileUpload";
import MaterialCard from "../components/MaterialCard";
import { listMaterials, uploadMaterial, deleteMaterial, createSession, listSessions } from "../api";

export default function UploadPage() {
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMaterials();
    loadSessions();
  }, []);

  async function loadMaterials() {
    try {
      const data = await listMaterials();
      setMaterials(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadSessions() {
    try {
      const data = await listSessions();
      setSessions(data);
    } catch {
      // non-critical, silently fail
    }
  }

  async function handleUpload(file) {
    setError(null);
    setIsUploading(true);
    try {
      await uploadMaterial(file);
      await loadMaterials();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMaterialClick(material) {
    try {
      const session = await createSession(material.id);
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  // Derive stats
  const totalMaterials = materials.length;
  const totalSessions = sessions.length;
  const completedQuizzes = sessions.reduce(
    (sum, s) => sum + (s.quizzes?.filter((q) => q.submitted)?.length || 0),
    0
  );

  return (
    <div className="animate-fade-in">
      {/* Hero Heading */}
      <div className="mb-16">
        <h2 className="font-serif text-5xl font-light tracking-tight text-on-surface mb-2">
          Dashboard
        </h2>
        <p className="text-secondary max-w-lg font-light leading-relaxed">
          Upload documents, generate quizzes, and track your learning progress across all your materials.
        </p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-secondary text-sm tracking-widest uppercase">
              Materials Uploaded
            </span>
            <FileText className="h-5 w-5 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl text-on-surface">{totalMaterials}</span>
            <span className="text-primary text-xs">documents</span>
          </div>
          <div className="mt-4 h-[1px] bg-gradient-to-r from-primary/30 to-transparent w-full" />
        </div>

        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-secondary text-sm tracking-widest uppercase">
              Study Sessions
            </span>
            <FolderOpen className="h-5 w-5 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl text-on-surface">{totalSessions}</span>
            <span className="text-primary text-xs">total</span>
          </div>
          <div className="mt-4 h-[1px] bg-gradient-to-r from-primary/30 to-transparent w-full" />
        </div>

        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all duration-500 group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-secondary text-sm tracking-widest uppercase">
              Quizzes Completed
            </span>
            <Sparkles className="h-5 w-5 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl text-on-surface">{completedQuizzes}</span>
            <span className="text-secondary text-xs">graded</span>
          </div>
          <div className="mt-4 h-[1px] bg-gradient-to-r from-primary/30 to-transparent w-full" />
        </div>
      </div>

      {/* Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Materials List (Left, 8-col) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl text-on-surface italic">Your Materials</h3>
            <span className="text-secondary text-sm tracking-widest uppercase">
              {totalMaterials} {totalMaterials === 1 ? "file" : "files"}
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-error-container/30 border border-error/20 text-error text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {materials.length === 0 ? (
              <div className="bg-surface-container p-8 rounded-lg text-center">
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-secondary/40" />
                <p className="text-sm text-secondary">No materials uploaded yet</p>
                <p className="text-xs text-secondary/60 mt-1">
                  Upload a document to get started
                </p>
              </div>
            ) : (
              materials.map((m, i) => (
                <div
                  key={m.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <MaterialCard
                    material={m}
                    onClick={() => handleMaterialClick(m)}
                    onDelete={handleDelete}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upload Card (Right, 4-col) */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden flex flex-col sticky top-24">
            {/* Upload Header Image Area */}
            <div className="relative h-40 bg-gradient-to-br from-primary-container to-surface-container-high flex items-center justify-center">
              <Upload className="h-12 w-12 text-primary/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-primary text-[10px] uppercase tracking-[0.2em] font-bold">
                  Quick Upload
                </span>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="p-8 flex flex-col flex-1">
              <h4 className="font-serif text-xl mb-4 italic text-on-surface">
                Add New Material
              </h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Upload a PDF or PPTX document to generate AI-powered quizzes and track your learning.
              </p>

              <FileUpload onUpload={handleUpload} isUploading={isUploading} />

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary mb-2" />
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    AI extracts key concepts automatically
                  </p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <svg className="h-4 w-4 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Private and secure, only you can access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
