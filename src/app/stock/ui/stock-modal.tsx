import { useState, useEffect } from "react";
import { createMuebleService } from "@/app/stock/app/services/create-mueble.service";
import { updateMuebleService } from "@/app/stock/app/services/update-mueble.service";
import type { CreateMuebleDto } from "@/app/stock/dom/CreateMuebleDto";
import type { UpdateMuebleDto } from "@/app/stock/dom/UpdateMuebleDto";
import type { Mueble } from "@/app/stock/dom/Mueble";
import type { MuebleCategoria } from "@/app/stock/dom/MuebleCategoria";
import { MuebleCategoria as MuebleCategoriaEnum } from "@/app/stock/dom/MuebleCategoria";
import type { MuebleCondicion } from "@/app/stock/dom/MuebleCondicion";
import { MuebleCondicion as MuebleCondicionEnum } from "@/app/stock/dom/MuebleCondicion";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mueble?: Mueble | null;
}

const defaultFormData: CreateMuebleDto = {
  codigo: "",
  nombre: "",
  categoria: MuebleCategoriaEnum.CAMA,
  imagen_url: null,
  tipo: null,
  condicion: MuebleCondicionEnum.BUENO,
  fecha_adquisicion: null,
  ultima_revision: null,
  descripcion: null,
};

export function StockModal({ isOpen, onClose, onSuccess, mueble }: StockModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!mueble;
  const [formData, setFormData] = useState<CreateMuebleDto>(defaultFormData);

  useEffect(() => {
    if (mueble) {
      setFormData({
        codigo: mueble.codigo || "",
        nombre: mueble.nombre || "",
        categoria: mueble.categoria || MuebleCategoriaEnum.CAMA,
        imagen_url: mueble.imagen_url || null,
        tipo: mueble.tipo || null,
        condicion: mueble.condicion || MuebleCondicionEnum.BUENO,
        fecha_adquisicion: mueble.fecha_adquisicion || null,
        ultima_revision: mueble.ultima_revision || null,
        descripcion: mueble.descripcion || null,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [mueble]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && mueble) {
        const updateData: UpdateMuebleDto = {
          codigo: formData.codigo,
          nombre: formData.nombre,
          categoria: formData.categoria,
          imagen_url: formData.imagen_url,
          tipo: formData.tipo,
          condicion: formData.condicion,
          fecha_adquisicion: formData.fecha_adquisicion,
          ultima_revision: formData.ultima_revision,
          descripcion: formData.descripcion,
        };
        await updateMuebleService.execute(mueble.id, updateData);
      } else {
        await createMuebleService.execute(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving mueble:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        width: "450px",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <h2 style={{ marginBottom: "1.5rem" }}>{isEditing ? "Editar Mueble" : "Nuevo Mueble"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Código *</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              required
              maxLength={30}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              maxLength={100}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Categoría *</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as MuebleCategoria })}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              <option value={MuebleCategoriaEnum.CAMA}>CAMA</option>
              <option value={MuebleCategoriaEnum.ASIENTO}>ASIENTO</option>
              <option value={MuebleCategoriaEnum.ALMACENAJE}>ALMACENAJE</option>
              <option value={MuebleCategoriaEnum.TECNOLOGIA}>TECNOLOGIA</option>
              <option value={MuebleCategoriaEnum.BANO}>BANO</option>
              <option value={MuebleCategoriaEnum.DECORACION}>DECORACION</option>
              <option value={MuebleCategoriaEnum.OTRO}>OTRO</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Tipo</label>
            <input
              type="text"
              value={formData.tipo || ""}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value || null })}
              maxLength={60}
              placeholder="Ej: King Size"
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Condición</label>
            <select
              value={formData.condicion}
              onChange={(e) => setFormData({ ...formData, condicion: e.target.value as MuebleCondicion })}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              <option value={MuebleCondicionEnum.BUENO}>BUENO</option>
              <option value={MuebleCondicionEnum.REGULAR}>REGULAR</option>
              <option value={MuebleCondicionEnum.DANADO}>DANADO</option>
              <option value={MuebleCondicionEnum.FALTANTE}>FALTANTE</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>URL Imagen</label>
            <input
              type="url"
              value={formData.imagen_url || ""}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value || null })}
              placeholder="https://..."
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>Fecha Adquisición</label>
              <input
                type="date"
                value={formData.fecha_adquisicion || ""}
                onChange={(e) => setFormData({ ...formData, fecha_adquisicion: e.target.value || null })}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>Última Revisión</label>
              <input
                type="date"
                value={formData.ultima_revision || ""}
                onChange={(e) => setFormData({ ...formData, ultima_revision: e.target.value || null })}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Descripción</label>
            <textarea
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value || null })}
              rows={3}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "0.75rem", cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.75rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
