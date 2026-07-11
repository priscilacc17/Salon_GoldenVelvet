import jsPDF from "jspdf";

export const generatePaymentPDF = async (
  reservaId: string,
  clienteName: string,
  serviceName: string,
  amount: number,
  paymentDate: string,
  paymentMethod: string
) => {
  if (typeof window === "undefined") {
    throw new Error("La generación de PDF solo está disponible en el navegador.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const addLine = (text: string, options: { bold?: boolean; size?: number; color?: string } = {}) => {
    pdf.setFont("helvetica", options.bold ? "bold" : "normal");
    pdf.setFontSize(options.size ?? 11);
    pdf.setTextColor(options.color ? options.color : "#111827");
    const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
    pdf.text(lines, margin, y);
    y += (lines.length * 6) + 3;
  };

  addLine("Salón Golden Velvet", { bold: true, size: 18, color: "#B68A20" });
  addLine("Comprobante de Pago", { bold: true, size: 13 });
  y += 3;
  addLine(`Número de Comprobante: ${reservaId.substring(0, 8).toUpperCase()}`);
  addLine(`Fecha: ${paymentDate}`);
  y += 4;
  addLine("Datos del Cliente", { bold: true, size: 12 });
  addLine(`Nombre: ${clienteName || "Cliente"}`);
  y += 4;
  addLine("Detalle del Servicio", { bold: true, size: 12 });
  addLine(`Servicio: ${serviceName || "Servicio"}`);
  y += 4;
  addLine("Detalles del Pago", { bold: true, size: 12 });
  addLine(`Monto: S/ ${Number(amount).toFixed(2)}`);
  addLine(`Método de Pago: ${paymentMethod || "—"}`);
  addLine("Estado: Pagado", { bold: true, color: "#15803d" });
  y += 8;
  addLine("Gracias por tu compra. Este comprobante es válido como constancia de pago.", { size: 10, color: "#6b7280" });
  addLine("Para consultas: contact@salongildenvelvet.com", { size: 10, color: "#6b7280" });

  pdf.save(`comprobante-${reservaId.substring(0, 8).toUpperCase()}.pdf`);
};
