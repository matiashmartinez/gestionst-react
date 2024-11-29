import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ServicioForm from "../componentes/ServicioForm";
import NavMenu from "../componentes/NavMenu";

const Servicios = () => {
  const { clienteId } = useParams(); // Capturar el clienteId desde la URL
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [editingService, setEditingService] = useState(null); // Servicio en edición
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal
  const [notification, setNotification] = useState(null); // Notificación de éxito o error

  // Cargar servicios para el cliente especificado
  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from("servicio")
      .select("*, cliente(id, dni, nombre, apellido, telefono)")
      .eq("idCliente", clienteId)
      .eq("baja", false);

    if (error) {
      console.error("Error al cargar servicios:", error.message);
    } else {
      setServicios(data);
    }
  };

  // Cargar clientes para el dropdown
  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("cliente")
      .select("id, nombre, apellido, dni")
      .eq("baja", false);

    if (error) {
      console.error("Error al cargar clientes:", error.message);
    } else {
      setClientes(data);
    }
  };

  useEffect(() => {
    fetchServicios();
    fetchClientes();
  }, [clienteId]);

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (servicio) => {
    setEditingService(servicio);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este servicio?");
    if (!confirm) return;

    const { error } = await supabase
      .from("servicio")
      .update({ baja: true })
      .eq("id", id);

    if (error) {
      setNotification({ type: "error", message: "Error al eliminar el servicio." });
      console.error("Error al eliminar servicio:", error.message);
    } else {
      setNotification({ type: "success", message: "Servicio eliminado correctamente." });
      fetchServicios();
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingService) {
        // Actualizar servicio existente
        const { error } = await supabase
          .from("servicio")
          .update(data)
          .eq("id", editingService.id);

        if (error) throw new Error("Error al actualizar el servicio.");
        setNotification({ type: "success", message: "Servicio actualizado correctamente." });
      } else {
        // Agregar nuevo servicio
        const { error } = await supabase.from("servicio").insert([data]);
        if (error) throw new Error("Error al agregar el servicio.");
        setNotification({ type: "success", message: "Servicio agregado correctamente." });
      }
      fetchServicios();
      setShowModal(false); // Cerrar modal
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      console.error(error.message);
    }
  };

  const closeNotification = () => setNotification(null);

  const generarPDF = (servicio) => {
    const doc = new jsPDF();

    doc.text("Reporte de Servicio", 14, 20);

    doc.autoTable({
      startY: 30,
      head: [["Campo", "Detalle"]],
      body: [
        ["Nombre", `${servicio.cliente.nombre} ${servicio.cliente.apellido}`],
        ["DNI", servicio.cliente.dni],
        ["Teléfono", servicio.cliente.telefono],
      ],
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Campo", "Detalle"]],
      body: [
        ["Detalle", servicio.detalle],
        ["Costo", `$${servicio.costo}`],
        ["Estado", servicio.estado],
        ["Fecha Inicio", servicio.fecha_in],
        ["Fecha Entrega", servicio.fecha_es || "Pendiente"],
      ],
    });

    doc.save(`Servicio_${servicio.id}.pdf`);
  };

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6">Servicios del Cliente</h1>

      {/* Notificación */}
      {notification && (
        <div
          className={`alert ${
            notification.type === "success" ? "alert-success" : "alert-error"
          } shadow-lg`}
        >
          <div>
            <span>{notification.message}</span>
            <button onClick={closeNotification} className="btn btn-sm btn-ghost ml-4">
              X
            </button>
          </div>
        </div>
      )}

      {/* Botón para agregar servicio */}
      <div className="flex justify-end mb-4">
        <button onClick={handleAdd} className="btn btn-primary">
          Nuevo Servicio
        </button>
      </div>

      {/* Tabla de servicios */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Detalle</th>
              <th>Costo</th>
              <th>Estado</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id}>
                <td>{servicio.detalle}</td>
                <td>${servicio.costo}</td>
                <td>{servicio.estado}</td>
                <td>
                  {servicio.cliente.nombre} {servicio.cliente.apellido}
                </td>
                <td className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(servicio)}
                    className="btn btn-warning btn-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(servicio.id)}
                    className="btn btn-error btn-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <ServicioForm
              clientes={clientes}
              initialData={editingService}
              onSubmit={handleFormSubmit}
              onClose={() => setShowModal(false)} // Cerrar modal
            />
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
