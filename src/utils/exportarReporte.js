

import jsPDF from "jspdf";
import "jspdf-autotable";

 const generarYEnviarPDF = (servicio) => {
  const doc = new jsPDF();
  doc.text("Reporte de Servicio", 14, 20);

  doc.autoTable({
    startY: 30,
    head: [["Campo", "Detalle"]],
    body: [
      ["Cliente", `${servicio.cliente.nombre} ${servicio.cliente.apellido}`],
      ["Teléfono", servicio.cliente.telefono],
      ["Detalle", servicio.detalle],
      ["Costo", `$${servicio.costo}`],
      ["Estado", servicio.estado],
      ["Fecha ingreso", servicio.fecha_in],
      ["Fecha estimada", servicio.fecha_es],
    ],
  });

  doc.save(`Servicio_${servicio.id}.pdf`);

  const mensaje = `
  Servicio Técnico:
  - Cliente: ${servicio.cliente.nombre} ${servicio.cliente.apellido}
  - Teléfono: ${servicio.cliente.telefono}
  - Detalle: ${servicio.detalle}
  - Costo: $${servicio.costo}
  - Estado: ${servicio.estado}
  - Fecha Ingreso: ${servicio.fecha_in}
  - Fecha Estimada: ${servicio.fecha_es}
  `;
  const url = `https://wa.me/${servicio.cliente.telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
};

export default generarYEnviarPDF;