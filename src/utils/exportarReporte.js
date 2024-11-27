import jsPDF from 'jspdf';

export const generatePDF = (clientes, servicios) => {
  const doc = new jsPDF();
  doc.text('Reporte de Clientes y Servicios', 10, 10);

  clientes.forEach((cliente, index) => {
    doc.text(`Cliente ${index + 1}: ${cliente.nombre} ${cliente.apellido}`, 10, 20 + index * 10);
  });

  servicios.forEach((servicio, index) => {
    doc.text(`Servicio ${index + 1}: ${servicio.detalle}`, 10, 20 + clientes.length * 10 + index * 10);
  });

  doc.save('reporte.pdf');
};
