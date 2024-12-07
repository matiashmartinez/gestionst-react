export const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };
  
  export const calculateDaysRemaining = (fecha_es, estado) => {
    if (estado === "finalizado") {
      return { days: null, status: "finalizado" };
    }
  
    const today = new Date();
    const estimatedDate = new Date(fecha_es);
    const daysDiff = Math.ceil((estimatedDate - today) / (1000 * 60 * 60 * 24));
  
    if (daysDiff < 0) return { days: daysDiff, status: "atrasado" };
    if (daysDiff <= 3) return { days: daysDiff, status: "urgente" };
    return { days: daysDiff, status: "normal" };
  };
// Utilidad para formatear fechas


// Calcular días restantes o estado
  