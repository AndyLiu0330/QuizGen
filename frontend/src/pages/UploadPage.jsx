import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import MaterialCard from "../components/MaterialCard";
import { listMaterials, uploadMaterial, deleteMaterial, createSession } from "../api";

export default function UploadPage() {
  const [materials, setMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const data = await listMaterials();
      setMaterials(data);
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Upload Materials</h1>

      <FileUpload onUpload={handleUpload} isUploading={isUploading} />

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-3">
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No materials uploaded yet
          </p>
        ) : (
          materials.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              onClick={() => handleMaterialClick(m)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
