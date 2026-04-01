import Anthropic from "@anthropic-ai/sdk";
 
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return Response.json({ error: "No se recibió archivo" }, { status: 400 });
 
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
 
    const client = new Anthropic();
 
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            isPdf
              ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
              : { type: "text", text: "Archivo Excel con datos de certificado TGR." },
            {
              type: "text",
              text: `Eres un extractor de datos de certificados de deuda de la Tesorería General de la República de Chile (TGR).
 
Extrae TODOS los folios de la tabla "Deuda Morosa (CLP)" del certificado.
Ignora la fila de totales.
 
Responde ÚNICAMENTE con un JSON array puro, sin texto adicional, sin bloques de código markdown.
 
Formato exacto por cada folio:
[
  {
    "folio": "403662",
    "fechaVcto": "00-00-0000",
    "deudaNeta": 48353,
    "reajuste": 0,
    "interes": 0,
    "multa": 0,
    "total": 48353
  }
]
 
Reglas:
- El campo "folio" es el número de la columna FOLIO (no FORMULARIO ni TIPO)
- Los números deben ser enteros sin puntos ni comas
- Si la fecha es 00-00-0000 mantenla exactamente así
- Incluye TODOS los folios de TODAS las páginas del documento`,
            },
          ],
        },
      ],
    });
 
    const text = message.content[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const folios = JSON.parse(clean);
 
    if (!Array.isArray(folios) || folios.length === 0) {
      return Response.json({ error: "No se encontraron folios en el documento" }, { status: 400 });
    }
 
    return Response.json({ folios });
  } catch (err) {
    console.error("Error extrayendo folios:", err);
    return Response.json({ error: "Error procesando el documento. Verifica que sea un Certificado TGR válido." }, { status: 500 });
  }
}
