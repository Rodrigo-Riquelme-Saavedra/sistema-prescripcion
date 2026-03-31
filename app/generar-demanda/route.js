import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType,
} from "docx";
 
const fmt = (n) => Number(n || 0).toLocaleString("es-CL");
 
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
 
function bold(text) {
  return new TextRun({ text, bold: true, font: "Times New Roman", size: 24 });
}
function normal(text) {
  return new TextRun({ text, font: "Times New Roman", size: 24 });
}
function para(children, options = {}) {
  return new Paragraph({ children, spacing: { after: 120 }, ...options });
}
 
export async function POST(req) {
  const { form, folios, totalDeuda } = await req.json();
 
  // ---- Header block (caratula) ----
  const headerRows = [
    ["PROCEDIMIENTO", "ORDINARIO"],
    ["MATERIA", "DECLARACIÓN DE PRESCRIPCIÓN."],
    ["DEMANDANTE", form.empresa],
    ["RUT", form.rutEmpresa],
    ["REPRESENT. LEGAL", form.representante],
    ["RUT", form.rutRepresentante],
    ["DOMICILIO", form.domicilioEmpresa],
    ["ABOGADO y APOD.", form.abogado],
    ["RUT", form.rutAbogado],
    ["DOMICILIO", form.domicilioAbogado],
    ["DEMANDADO", "FISCO – TESORERÍA GENERAL DE LA REPÚBLICA"],
    ["RUT", "60.805.000-0"],
  ];
 
  const caratulaTable = new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: [2400, 6800],
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
    rows: headerRows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 2400, type: WidthType.DXA },
            children: [new Paragraph({ children: [bold(label)], spacing: { after: 40 } })],
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 6800, type: WidthType.DXA },
            children: [new Paragraph({ children: [normal(": " + value)], spacing: { after: 40 } })],
          }),
        ],
      })
    ),
  });
 
  // ---- Folios table ----
  const colWidths = [1100, 1400, 1300, 1300, 1300, 1300, 1500];
  const headers = ["FORMULARIO / FOLIO", "FECHA VCTO.", "DEUDA NETA", "REAJUSTE", "INTERÉS", "MULTA", "TOTAL"];
 
  const foliosTable = new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      // Header row
      new TableRow({
        children: headers.map((h, i) =>
          new TableCell({
            borders,
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { fill: "1F6FEB", type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: "Times New Roman", size: 18, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
          })
        ),
      }),
      // Data rows
      ...folios.map((f) =>
        new TableRow({
          children: [
            f.folio,
            f.fechaVcto,
            `$ ${fmt(f.deudaNeta)}`,
            `$ ${fmt(f.reajuste)}`,
            `$ ${fmt(f.interes)}`,
            `$ ${fmt(f.multa)}`,
            `$ ${fmt(f.total)}`,
          ].map((val, i) =>
            new TableCell({
              borders,
              width: { size: colWidths[i], type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 80, right: 80 },
              children: [new Paragraph({ children: [normal(String(val))], alignment: i > 1 ? AlignmentType.RIGHT : AlignmentType.LEFT })],
            })
          ),
        })
      ),
      // Total row
      new TableRow({
        children: [
          new TableCell({
            borders,
            columnSpan: 6,
            width: { size: 7700, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [bold("TOTAL DEUDA MOROSA (CLP)")], alignment: AlignmentType.RIGHT })],
          }),
          new TableCell({
            borders,
            width: { size: 1500, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [bold(`$ ${fmt(totalDeuda)}`)], alignment: AlignmentType.RIGHT })],
          }),
        ],
      }),
    ],
  });
 
  // ---- Document assembly ----
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          },
        },
        children: [
          caratulaTable,
          para([]),
          para([bold("EN LO PRINCIPAL"), normal(": DEMANDA DE DECLARACIÓN DE PRESCRIPCIÓN EXTINTIVA; "), bold("PRIMER OTROSÍ"), normal(": ACOMPAÑA DOCUMENTO; "), bold("SEGUNDO OTROSÍ"), normal(": PATROCINIO Y PODER.")]),
          para([]),
          para([bold("S.  J.  L.")]),
          para([]),
          para([
            bold(form.empresa),
            normal(`, sociedad del giro de su denominación, rol único tributario n° `),
            bold(form.rutEmpresa),
            normal(`, representada legalmente por don `),
            bold(form.representante),
            normal(`, ${form.cargoRepresentante}, cédula de identidad n° `),
            bold(form.rutRepresentante),
            normal(`, ambos domiciliados en ${form.domicilioEmpresa}, a S.S., respetuosamente digo:`),
          ], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
          para([
            normal("Que vengo en demandar al "),
            bold("FISCO – TESORERÍA GENERAL DE LA REPÚBLICA"),
            normal(", rol único tributario n° 60.805.000-0, representado por don "),
            bold("Hernán Nobizelli Reyes"),
            normal(", cédula de identidad n° 12.242.809-5, ambos domiciliados en calle Teatinos N° 28, segundo piso, Santiago, con el objeto que se declare la "),
            bold("PRESCRIPCIÓN EXTINTIVA"),
            normal(` de la acción de cobro de impuestos, reajustes, intereses moratorios y multas, correspondientes a los folios que se detallarán a continuación, todos según Certificado de Deuda de fecha ${form.fechaCertificado}, el que se acompaña junto a esta presentación:`),
          ], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
          foliosTable,
          para([]),
          para([
            normal("En dicho certificado se detallan los folios indicados, que totalizan la suma de "),
            bold(`$${fmt(totalDeuda)}`),
            normal(" ("),
            normal(`${fmt(totalDeuda)} pesos`),
            normal("), a la fecha del Certificado de Deuda indicado."),
          ], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
 
          // EL DERECHO
          para([bold("EL DERECHO")]),
          para([
            normal("De acuerdo a lo dispuesto en el artículo 169 y siguientes del Código Tributario, el Fisco de Chile, a través de la demandada, La Tesorería General de la República, ha requerido de pago, a través de diversos expedientes administrativos"),
            normal(form.expedientes ? ` Rol N° ${form.expedientes},` : ","),
            normal(" todos de la comuna de Santiago."),
          ], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
          para([
            normal("Con ello en mente, han transcurrido más de 7 años en la mayoría de los folios indicados, ya que esas deudas corresponden a los años 2016, 2017 y 2018, cuestión que entra en controversia con la Ley, la Jurisprudencia de la Excma. Corte Suprema y la lógica."),
          ], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
          para([normal("En lo que a la norma refiere, el artículo 201 del Código Tributario señala que prescribirá la acción del Fisco para perseguir el pago de los impuestos, intereses, sanciones y demás recargos en los mismos plazos señalados en el artículo 200, interrumpiéndose dicha prescripción por: 1°) reconocimiento u obligación escrita; 2°) notificación administrativa de un giro o liquidación; y 3°) requerimiento judicial.")], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
          para([normal("La Excma. Corte Suprema ha resuelto esta problemática estableciendo un plazo máximo de tres años para el cobro de la deuda por parte del Servicio de Tesorerías, confirmado en sentencias Rol N° 1976-2008 de 30 de noviembre de 2009, Rol N° 1205-2010 de 25 de mayo de 2012 y Rol N° 516-2011 de 12 de junio de 2012.")], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
          para([normal('Asimismo, en autos Rol N\u00b0 31.913-14 de 3 de agosto de 2015, la Excma. Corte Suprema estableci\u00f3 que el procedimiento se ha extinguido como consecuencia de la instituci\u00f3n del decaimiento, definida como \u201cla extinci\u00f3n de un acto administrativo provocado por circunstancias sobrevinientes de hecho o de derecho que afectan su contenido jur\u00eddico, torn\u00e1ndolo in\u00fatil o abiertamente ileg\u00edtimo.\u201d')], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
 
          // POR TANTO
          para([bold("POR TANTO,")]),
          para([]),
          para([
            normal("En mérito de lo expuesto, disposiciones legales citadas y lo dispuesto en los Artículos 254 y siguientes del Código de Procedimiento Civil, Ruego a S.S., se sirva tener por interpuesta demanda en juicio ordinario en contra del "),
            bold("FISCO – TESORERÍA GENERAL DE LA REPÚBLICA"),
            normal(", sometiéndola a tramitación y acogiéndola en todas sus partes, declarando la "),
            bold("PRESCRIPCIÓN EXTINTIVA DE LA ACCIÓN DE COBRO"),
            normal(` de obligaciones tributarias cuyos folios fueron señalados en la presente demanda, todos relativos al cobro de impuestos, reajustes, intereses moratorios y multas correspondientes al Formulario 21, por una deuda total de $${fmt(totalDeuda)}, todo con expresa condena en costas.`),
          ], { alignment: AlignmentType.JUSTIFIED }),
          para([]),
 
          // PRIMER OTROSÍ
          para([bold("PRIMER OTROSÍ"), normal(": Vengo en acompañar a estos autos, con citación de la contraria:")]),
          para([normal(`1.- Certificado de deuda emitido por la Tesorería General de la República, del ${form.fechaCertificado}.`)]),
          para([normal("2.- Copia de inscripción Notarial donde consta la representación que invoco en estos autos.")]),
          para([]),
 
          // SEGUNDO OTROSÍ
          para([
            bold("SEGUNDO OTROSÍ"),
            normal(": Pido a SS. tener presente que por este acto vengo en otorgar patrocinio y conferir poder al abogado habilitado para el ejercicio de la profesión, don "),
            bold(form.abogado),
            normal(`, cédula de identidad n° ${form.rutAbogado}, domiciliado ${form.domicilioAbogado}, casilla electrónica `),
            new TextRun({ text: form.emailAbogado, font: "Times New Roman", size: 24, style: "Hyperlink" }),
          ]),
        ],
      },
    ],
  });
 
  const buffer = await Packer.toBuffer(doc);
 
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="Demanda_Prescripcion.docx"`,
    },
  });
}
