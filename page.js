"use client";
import { useState } from "react";
 
const fmt = (n) => Number(n || 0).toLocaleString("es-CL");
 
const FOLIOS_EJEMPLO = [
  { folio: "403662",   fechaVcto: "00-00-0000", deudaNeta: 48353,   reajuste: 0,       interes: 0,       multa: 0,       total: 48353   },
  { folio: "1776967",  fechaVcto: "12-Jul-2016", deudaNeta: 1225441, reajuste: 644582,  interes: 1325472, multa: 561007,  total: 3756502 },
  { folio: "1813534",  fechaVcto: "12-Oct-2016", deudaNeta: 2326746, reajuste: 1195948, interes: 2428193, multa: 1056808, total: 7007695 },
];
 
const STEPS = ["1. Demandante", "2. Abogado", "3. Folios", "4. Vista Previa"];
 
export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    empresa: "EMBALAJES INDUSTRIALES EMBATEK SpA",
    rutEmpresa: "77.453.510-1",
    representante: "CRISTIAN E. RIQUELME PARADA",
    cargoRepresentante: "ingeniero comercial",
    rutRepresentante: "11.852.128-5",
    domicilioEmpresa: "Sierra Bella n° 1581, comuna de Santiago, RM",
    abogado: "JUAN JOSÉ CONTRERAS GONZÁLEZ",
    rutAbogado: "10.011.754-1",
    domicilioAbogado: "Huérfanos 979 oficina 606, comuna de Santiago, RM",
    emailAbogado: "juancontre@fen.uchile.cl",
    fechaCertificado: "15-12-2025",
    expedientes: "",
  });
  const [folios, setFolios] = useState(FOLIOS_EJEMPLO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const totalDeuda = folios.reduce((s, f) => s + (parseFloat(f.total) || 0), 0);
 
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  const addFolio = () =>
    setFolios((p) => [...p, { folio: "", fechaVcto: "", deudaNeta: 0, reajuste: 0, interes: 0, multa: 0, total: 0 }]);
 
  const removeFolio = (i) => setFolios((p) => p.filter((_, idx) => idx !== i));
 
  const updateFolio = (i, k, v) =>
    setFolios((p) => {
      const next = [...p];
      next[i] = { ...next[i], [k]: v };
      const r = next[i];
      next[i].total =
        (parseFloat(r.deudaNeta) || 0) +
        (parseFloat(r.reajuste) || 0) +
        (parseFloat(r.interes) || 0) +
        (parseFloat(r.multa) || 0);
      return next;
    });
 
  const handleGenerar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generar-demanda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, folios, totalDeuda }),
      });
      if (!res.ok) throw new Error("Error al generar el documento");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Demanda_Prescripcion_${form.empresa.replace(/\s+/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Hubo un error generando el documento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
 
  const inp =
    "width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 12px;color:#e6edf3;font-family:inherit;font-size:13px;box-sizing:border-box;outline:none;";
 
  const Field = ({ label, k, placeholder, half }) => (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <div style={{ fontSize: 10, color: "#8b949e", fontWeight: 700, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>
        {label}
      </div>
      <input
        style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "8px 12px", color: "#e6edf3", fontFamily: "inherit", fontSize: 13, boxSizing: "border-box" }}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder || ""}
      />
    </div>
  );
 
  return (
    <div style={{ minHeight: "100vh", background: "#010409", fontFamily: "'Courier New', monospace", color: "#e6edf3" }}>
      {/* Header */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #21262d", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1f6feb,#388bfd)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚖</div>
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>SISTEMA PRESCRIPCIÓN TRIBUTARIA</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#484f58" }}>Chile · Art. 201 C.T.</span>
      </div>
 
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
        {/* Steps */}
        <div style={{ display: "flex", marginBottom: 32, border: "1px solid #21262d", borderRadius: 8, overflow: "hidden" }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => i <= step && setStep(i)}
              style={{ flex: 1, padding: "10px 0", background: i === step ? "#1f6feb" : i < step ? "#0d2a4a" : "#0d1117", border: "none", borderRight: i < 3 ? "1px solid #21262d" : "none", color: i === step ? "#fff" : i < step ? "#58a6ff" : "#484f58", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: i <= step ? "pointer" : "default" }}>
              {i < step ? "✓ " : ""}{s}
            </button>
          ))}
        </div>
 
        {/* STEP 0 */}
        {step === 0 && (
          <div>
            <SectionTitle>Datos del Demandante</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <Field label="Razón Social / Nombre completo" k="empresa" />
              <Field label="RUT Empresa" k="rutEmpresa" placeholder="77.453.510-1" half />
              <Field label="Representante Legal" k="representante" half />
              <Field label="Cargo del Representante" k="cargoRepresentante" placeholder="gerente general" half />
              <Field label="RUT Representante" k="rutRepresentante" placeholder="11.852.128-5" half />
              <Field label="Domicilio" k="domicilioEmpresa" placeholder="Calle N°, comuna, región" />
            </div>
            <Btn onClick={() => setStep(1)}>Siguiente: Abogado →</Btn>
          </div>
        )}
 
        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <SectionTitle>Datos del Abogado Patrocinante</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <Field label="Nombre Abogado" k="abogado" half />
              <Field label="RUT Abogado" k="rutAbogado" placeholder="10.011.754-1" half />
              <Field label="Domicilio Profesional" k="domicilioAbogado" />
              <Field label="Correo Electrónico (casilla electrónica)" k="emailAbogado" placeholder="abogado@dominio.cl" half />
              <Field label="Fecha del Certificado de Deuda" k="fechaCertificado" placeholder="15-12-2025" half />
              <Field label="N° Expediente(s) Administrativo(s)" k="expedientes" placeholder="Ej: 1234-2020 (dejar en blanco si no aplica)" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <BtnSecondary onClick={() => setStep(0)}>← Volver</BtnSecondary>
              <Btn onClick={() => setStep(2)}>Siguiente: Folios →</Btn>
            </div>
          </div>
        )}
 
        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <SectionTitle>Folios del Certificado de Deuda</SectionTitle>
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#161b22" }}>
                    {["Folio", "Fecha Vcto.", "Deuda Neta $", "Reajuste $", "Interés $", "Multa $", "Total $", ""].map((h) => (
                      <th key={h} style={{ padding: "8px 8px", color: "#8b949e", fontSize: 10, letterSpacing: 1, fontWeight: 700, borderBottom: "1px solid #21262d", whiteSpace: "nowrap", textAlign: "right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {folios.map((f, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #161b22" }}>
                      {[
                        { k: "folio", w: 80, align: "left" },
                        { k: "fechaVcto", w: 100, align: "left" },
                        { k: "deudaNeta", w: 90, align: "right" },
                        { k: "reajuste", w: 80, align: "right" },
                        { k: "interes", w: 80, align: "right" },
                        { k: "multa", w: 80, align: "right" },
                      ].map(({ k, w, align }) => (
                        <td key={k} style={{ padding: "4px 4px" }}>
                          <input value={f[k]} onChange={(e) => updateFolio(i, k, e.target.value)}
                            style={{ width: w, background: "#0d1117", border: "1px solid #21262d", borderRadius: 4, color: "#e6edf3", fontFamily: "inherit", fontSize: 12, padding: "4px 6px", textAlign: align }} />
                        </td>
                      ))}
                      <td style={{ padding: "4px 8px", color: "#58a6ff", fontWeight: 700, whiteSpace: "nowrap", textAlign: "right" }}>
                        $ {fmt(f.total)}
                      </td>
                      <td style={{ padding: "4px 4px" }}>
                        <button onClick={() => removeFolio(i)} style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <button onClick={addFolio} style={{ background: "#161b22", border: "1px dashed #30363d", color: "#58a6ff", borderRadius: 6, padding: "8px 16px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                + Agregar Folio
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 2 }}>TOTAL DEUDA MOROSA</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#3fb950" }}>$ {fmt(totalDeuda)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <BtnSecondary onClick={() => setStep(1)}>← Volver</BtnSecondary>
              <Btn onClick={() => setStep(3)}>Vista Previa →</Btn>
            </div>
          </div>
        )}
 
        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <SectionTitle>Vista Previa — Resumen de la Demanda</SectionTitle>
 
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              <Card label="Demandante" value={form.empresa} sub={`RUT ${form.rutEmpresa}`} />
              <Card label="Representante Legal" value={form.representante} sub={form.cargoRepresentante} />
              <Card label="Abogado Patrocinante" value={form.abogado} sub={form.emailAbogado} />
            </div>
 
            <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: 20, fontSize: 12, lineHeight: 2, color: "#c9d1d9", marginBottom: 20, maxHeight: 340, overflowY: "auto" }}>
              <p style={{ textAlign: "center", fontWeight: 700, marginBottom: 12, fontSize: 13 }}>DEMANDA DE DECLARACIÓN DE PRESCRIPCIÓN EXTINTIVA</p>
              <p><strong>{form.empresa}</strong>, RUT n° <strong>{form.rutEmpresa}</strong>, representada legalmente por don <strong>{form.representante}</strong>, {form.cargoRepresentante}, cédula de identidad n° <strong>{form.rutRepresentante}</strong>, ambos domiciliados en {form.domicilioEmpresa}, a S.S., respetuosamente digo:</p>
              <p style={{ marginTop: 10 }}>Que vengo en demandar al <strong>FISCO – TESORERÍA GENERAL DE LA REPÚBLICA</strong>, RUT n° 60.805.000-0, con el objeto que se declare la PRESCRIPCIÓN EXTINTIVA de la acción de cobro de impuestos, según Certificado de Deuda de fecha <strong>{form.fechaCertificado}</strong>.</p>
              <p style={{ marginTop: 10 }}><strong>Folios:</strong> {folios.map((f) => f.folio).filter(Boolean).join(", ")}</p>
              <p style={{ marginTop: 10 }}>Total deuda: <strong>$ {fmt(totalDeuda)}</strong></p>
              {form.expedientes && <p style={{ marginTop: 10 }}>Expedientes Administrativos: <strong>{form.expedientes}</strong></p>}
              <p style={{ marginTop: 10, color: "#484f58", fontStyle: "italic" }}>[... texto legal completo según plantilla ...]</p>
              <p style={{ marginTop: 10 }}>Abogado: <strong>{form.abogado}</strong>, RUT {form.rutAbogado} — {form.domicilioAbogado} — {form.emailAbogado}</p>
            </div>
 
            {error && (
              <div style={{ background: "#2d1b1b", border: "1px solid #f85149", borderRadius: 6, padding: "10px 16px", color: "#f85149", fontSize: 12, marginBottom: 14 }}>
                ⚠ {error}
              </div>
            )}
 
            <div style={{ display: "flex", gap: 10 }}>
              <BtnSecondary onClick={() => setStep(2)}>← Editar</BtnSecondary>
              <button onClick={handleGenerar} disabled={loading}
                style={{ flex: 1, background: loading ? "#1a4a2e" : "linear-gradient(135deg,#238636,#2ea043)", border: "none", color: "#fff", borderRadius: 6, padding: "13px 24px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: loading ? "wait" : "pointer", transition: "all 0.3s" }}>
                {loading ? "⏳ GENERANDO DOCUMENTO..." : "⬇ GENERAR Y DESCARGAR DEMANDA .DOCX"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 
const SectionTitle = ({ children }) => (
  <div style={{ borderLeft: "3px solid #1f6feb", paddingLeft: 12, marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8b949e", textTransform: "uppercase" }}>{children}</div>
  </div>
);
 
const Card = ({ label, value, sub }) => (
  <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "12px 14px" }}>
    <div style={{ fontSize: 10, color: "#484f58", letterSpacing: 2, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 12, color: "#e6edf3", fontWeight: 600, marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 11, color: "#58a6ff" }}>{sub}</div>
  </div>
);
 
const Btn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ flex: 1, background: "#1f6feb", border: "none", color: "#fff", borderRadius: 6, padding: "11px 20px", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
    {children}
  </button>
);
 
const BtnSecondary = ({ onClick, children }) => (
  <button onClick={onClick} style={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3", borderRadius: 6, padding: "11px 20px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
    {children}
  </button>
);
