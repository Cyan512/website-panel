import { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Button } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdArrowDropDown } from "react-icons/md";
import { internacionalizacionApi } from "../api";
import type { Habitacion, UpdateInternacionalizacion } from "../types";

const selectClass =
  "w-full appearance-none cursor-pointer bg-bg-card rounded-xl py-3.5 text-sm px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 hover:border-border transition-colors text-text-primary";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

interface I18nModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitaciones: Habitacion[];
}

const defaultI18n: UpdateInternacionalizacion = {
  descripcion_en: "",
  descripcion_fr: "",
  feature_en: "",
  feature_fr: "",
  amenities_en: "",
  amenities_fr: "",
};

export function I18nModal({ isOpen, onClose, habitaciones }: I18nModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [habOpen, setHabOpen] = useState(false);
  const [tab, setTab] = useState<"en" | "fr">("en");
  const [data, setData] = useState<UpdateInternacionalizacion>({ ...defaultI18n });
  const habRef = useRef<HTMLDivElement>(null);

  const fetchI18n = useCallback(async (habitacionId: string) => {
    if (!habitacionId) return;
    setLoading(true);
    try {
      const res = await internacionalizacionApi.getById(habitacionId);
      setData({
        descripcion_en: res.descripcion_en ?? "",
        descripcion_fr: res.descripcion_fr ?? "",
        feature_en: res.feature_en ?? "",
        feature_fr: res.feature_fr ?? "",
        amenities_en: res.amenities_en ?? "",
        amenities_fr: res.amenities_fr ?? "",
      });
    } catch {
      setData({ ...defaultI18n });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId("");
    setHabOpen(false);
    setTab("en");
    setData({ ...defaultI18n });
  }, [isOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (habRef.current && !habRef.current.contains(e.target as Node)) setHabOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setHabOpen(false);
    fetchI18n(id);
  };

  const handleSave = async () => {
    if (!selectedId) return sileo.error({ title: "Error", description: "Selecciona una habitación" });
    const payload: UpdateInternacionalizacion = {};
    const enDesc = data.descripcion_en?.trim();
    const frDesc = data.descripcion_fr?.trim();
    const enFeature = data.feature_en?.trim();
    const frFeature = data.feature_fr?.trim();
    const enAmenities = data.amenities_en?.trim();
    const frAmenities = data.amenities_fr?.trim();

    if (enDesc) payload.descripcion_en = enDesc;
    else payload.descripcion_en = null;
    if (frDesc) payload.descripcion_fr = frDesc;
    else payload.descripcion_fr = null;
    if (enFeature) payload.feature_en = enFeature;
    else payload.feature_en = null;
    if (frFeature) payload.feature_fr = frFeature;
    else payload.feature_fr = null;
    if (enAmenities) payload.amenities_en = enAmenities;
    else payload.amenities_en = null;
    if (frAmenities) payload.amenities_fr = frAmenities;
    else payload.amenities_fr = null;

    setSaving(true);
    try {
      await internacionalizacionApi.update(selectedId, payload);
      sileo.success({ title: "Guardado", description: "Traducciones actualizadas" });
      onClose();
    } catch (err) {
      if (!isHandledError(err)) {
        const msg = err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        sileo.error({ title: "Error", description: msg || "No se pudo guardar." });
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof UpdateInternacionalizacion, label: string, placeholder: string, rows = 2) => (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        value={data[key] ?? ""}
        onChange={(e) => setData((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className={selectClass + " resize-none"}
        rows={rows}
      />
    </div>
  );

  const selectedHab = habitaciones.find((h) => h.id === selectedId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Internacionalización" size="lg">
      <div className="space-y-4">
        <div className="relative" ref={habRef}>
          <label className={labelClass}>Habitación</label>
          {habitaciones.length === 0 ? (
            <div className={selectClass + " text-text-muted"}>No hay habitaciones</div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setHabOpen(!habOpen)}
                className={selectClass + " flex items-center justify-between text-left w-full"}
              >
                <span>{selectedHab ? `Hab. ${selectedHab.nro_habitacion}` : "Seleccionar habitación"}</span>
                <MdArrowDropDown className={`w-5 h-5 text-text-muted transition-transform ${habOpen ? "rotate-180" : ""}`} />
              </button>
              {habOpen && (
                <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-[240px] overflow-y-auto">
                  <div className="py-1">
                    {habitaciones.map((h) => (
                      <div
                        key={h.id}
                        className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${selectedId === h.id ? "bg-primary/10 text-primary font-medium" : "text-text-primary"}`}
                        onClick={() => handleSelect(h.id)}
                      >
                        Habitación {h.nro_habitacion} — Piso {h.piso}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selectedId && (
          <>
            {loading && (
              <div className="text-center py-4 text-text-muted text-sm">Cargando traducciones...</div>
            )}

            {!loading && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-bg-secondary border-b border-border flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTab("en")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      tab === "en"
                        ? "bg-primary text-white shadow-btn"
                        : "bg-bg-card text-text-secondary border border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    Inglés
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("fr")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      tab === "fr"
                        ? "bg-primary text-white shadow-btn"
                        : "bg-bg-card text-text-secondary border border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    Francés
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {tab === "en" && (
                    <>
                      {field("descripcion_en", "Descripción", "Room description in English...", 3)}
                      {field("feature_en", "Características", "WiFi, air conditioning...", 2)}
                      {field("amenities_en", "Amenities", "TV, minibar, coffee maker...", 2)}
                    </>
                  )}
                  {tab === "fr" && (
                    <>
                      {field("descripcion_fr", "Descripción", "Description de la chambre...", 3)}
                      {field("feature_fr", "Características", "WiFi, climatisation...", 2)}
                      {field("amenities_fr", "Amenities", "TV, minibar, machine à café...", 2)}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
          <Button onClick={handleSave} isLoading={saving} disabled={!selectedId} className="flex-1">
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
