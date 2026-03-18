import { useState, useRef } from "react";
import { FaFileExcel, FaUpload, FaTimes } from "react-icons/fa";
import { read, utils } from "xlsx";
import { inventoryApi } from "../api";
import type { CreateMuebleDto, MuebleCategoria, MuebleCondicion } from "../types";
import { Button } from "@/components";
import { sileo } from "sileo";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  row: number;
  data: Partial<CreateMuebleDto>;
  errors: string[];
  valid: boolean;
}

const CATEGORIAS_VALIDAS: MuebleCategoria[] = ["CAMA", "ASIENTO", "ALMACENAJE", "TECNOLOGIA", "BANO", "DECORACION", "OTRO"];
const CONDICIONES_VALIDAS: MuebleCondicion[] = ["BUENO", "REGULAR", "DANADO", "FALTANTE"];

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "importing">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setFile(null);
    setParsedData([]);
    setStep("upload");
    setImporting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const validateRow = (row: Record<string, unknown>, rowIndex: number): ParsedRow => {
    const errors: string[] = [];
    const data: Partial<CreateMuebleDto> = {};

    const codigo = String(row.codigo || row.codigo_mueble || "").trim();
    const nombre = String(row.nombre || row.nombre_mueble || "").trim();
    const categoria = String(row.categoria || "").trim().toUpperCase();
    const tipo = row.tipo ? String(row.tipo).trim() : null;
    const condicion = row.condicion ? String(row.condicion).trim().toUpperCase() : "BUENO";
    const descripcion = row.descripcion ? String(row.descripcion).trim() : null;
    const fecha_adquisicion = row.fecha_adquisicion ? String(row.fecha_adquisicion).trim() : null;
    const ultima_revision = row.ultima_revision ? String(row.ultima_revision).trim() : null;
    const imagen_url = row.imagen_url ? String(row.imagen_url).trim() : null;

    if (!codigo) errors.push("Código requerido");
    if (!nombre) errors.push("Nombre requerido");
    if (!categoria) errors.push("Categoría requerida");
    else if (!CATEGORIAS_VALIDAS.includes(categoria as MuebleCategoria)) {
      errors.push(`Categoría inválida: ${categoria}`);
    }
    if (condicion && !CONDICIONES_VALIDAS.includes(condicion as MuebleCondicion)) {
      errors.push(`Condición inválida: ${condicion}`);
    }

    if (errors.length === 0) {
      data.codigo = codigo;
      data.nombre = nombre;
      data.categoria = categoria as MuebleCategoria;
      data.tipo = tipo;
      data.condicion = (condicion || "BUENO") as MuebleCondicion;
      data.descripcion = descripcion;
      data.fecha_adquisicion = fecha_adquisicion;
      data.ultima_revision = ultima_revision;
      data.imagen_url = imagen_url;
    }

    return { row: rowIndex + 2, data, errors, valid: errors.length === 0 };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      sileo.error({ title: "Archivo inválido", description: "Solo se permiten archivos Excel (.xlsx, .xls)" });
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Record<string, unknown>[] = utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          sileo.error({ title: "Sin datos", description: "El archivo está vacío" });
          setFile(null);
          return;
        }

        const parsed = jsonData.map((row, index) => validateRow(row, index));
        setParsedData(parsed);
        setStep("preview");
      } catch (error) {
        console.error("Error parsing Excel:", error);
        sileo.error({ title: "Error", description: "No se pudo leer el archivo Excel" });
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((r) => r.valid);
    if (validRows.length === 0) {
      sileo.error({ title: "Sin datos válidos", description: "No hay filas válidas para importar" });
      return;
    }

    setImporting(true);
    setStep("importing");

    let successCount = 0;
    let errorCount = 0;

    for (const row of validRows) {
      try {
        await inventoryApi.create(row.data as CreateMuebleDto);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error importing row ${row.row}:`, error);
      }
    }

    setImporting(false);

    if (errorCount === 0) {
      sileo.success({ title: "Importación exitosa", description: `${successCount} muebles importados correctamente` });
      onSuccess();
      handleClose();
    } else {
      sileo.warning({
        title: "Importación parcial",
        description: `${successCount} importados, ${errorCount} fallidos (pueden estar duplicados)`,
      });
      onSuccess();
      handleClose();
    }
  };

  if (!isOpen) return null;

  const validCount = parsedData.filter((r) => r.valid).length;
  const invalidCount = parsedData.filter((r) => !r.valid).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-bg-card rounded-2xl w-full max-w-2xl border border-border shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary">Importar Muebles desde Excel</h2>
          <button onClick={handleClose} className="p-2 hover:bg-bg-hover rounded-lg transition-colors">
            <FaTimes className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="p-6">
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaFileExcel className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-text-primary font-medium mb-1">Arrastra un archivo Excel aquí</p>
                <p className="text-text-muted text-sm">o haz clic para seleccionar</p>
                <p className="text-text-muted/60 text-xs mt-3">Formatos: .xlsx, .xls</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />

              <div className="bg-bg-secondary rounded-xl p-4">
                <h3 className="font-semibold text-text-primary mb-2">Formato esperado del Excel:</h3>
                <div className="text-sm text-text-muted space-y-1">
                  <p><span className="font-medium text-text-secondary">codigo</span> (requerido) - Código único del mueble</p>
                  <p><span className="font-medium text-text-secondary">nombre</span> (requerido) - Nombre del mueble</p>
                  <p><span className="font-medium text-text-secondary">categoria</span> (requerido) - CAMA, ASIENTO, ALMACENAJE, TECNOLOGIA, BANO, DECORACION, OTRO</p>
                  <p><span className="font-medium text-text-secondary">tipo</span> (opcional) - Tipo específico</p>
                  <p><span className="font-medium text-text-secondary">condicion</span> (opcional) - BUENO, REGULAR, DANADO, FALTANTE</p>
                  <p><span className="font-medium text-text-secondary">descripcion</span> (opcional)</p>
                  <p><span className="font-medium text-text-secondary">fecha_adquisicion</span> (opcional) - YYYY-MM-DD</p>
                  <p><span className="font-medium text-text-secondary">imagen_url</span> (opcional) - URL de imagen</p>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl">
                <FaFileExcel className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-text-primary">{file?.name}</p>
                  <p className="text-sm text-text-muted">{parsedData.length} filas encontradas</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-emerald-500/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{validCount}</p>
                  <p className="text-sm text-text-muted">Válidos</p>
                </div>
                <div className="flex-1 bg-red-500/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-500">{invalidCount}</p>
                  <p className="text-sm text-text-muted">Con errores</p>
                </div>
              </div>

              {invalidCount > 0 && (
                <div className="max-h-40 overflow-y-auto bg-red-500/5 rounded-xl p-3 space-y-2">
                  <p className="text-sm font-medium text-red-500">Errores encontrados:</p>
                  {parsedData.filter((r) => !r.valid).map((row) => (
                    <div key={row.row} className="text-xs text-text-muted">
                      <span className="font-medium">Fila {row.row}:</span> {row.errors.join(", ")}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep("upload")} className="flex-1">
                  Cambiar archivo
                </Button>
                <Button onClick={handleImport} disabled={validCount === 0} className="flex-1" isLoading={importing}>
                  Importar {validCount} válidos
                </Button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="text-center py-8">
              <FaUpload className="w-12 h-12 mx-auto text-primary animate-bounce mb-4" />
              <p className="text-lg font-medium text-text-primary">Importando muebles...</p>
              <p className="text-text-muted text-sm mt-2">Esto puede tardar unos segundos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
