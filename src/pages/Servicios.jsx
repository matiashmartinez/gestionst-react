import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ServicioForm from "../componentes/ServicioForm";
import NavMenu from "../componentes/NavMenu";

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    fecha_in: new Date().toISOString().split("T")[0], // Fecha actual
    fecha_es: "",
    detalle: "",
    costo: "",
    num_factura: "",
    idCliente: "",
  });
  const [editingService, setEditingService] = useState(null); // Servicio en edición
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal

  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from("servicio")
      .select("*, cliente(id, dni, nombre, apellido, telefono)")
      .eq("baja", false);

    if (error) {
      console.error("Error al cargar servicios:", error.message);
    } else {
      setServicios(data);
    }
  };

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
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("servicio").insert([formData]);
    if (error) {
      console.error("Error al agregar servicio:", error.message);
    } else {
      fetchServicios();
      setFormData({
        fecha_in: new Date().toISOString().split("T")[0],
        fecha_es: "",
        detalle: "",
        costo: "",
        num_factura: "",
        idCliente: "",
      });
    }
  };

  const cambiarEstado = async (id, estado) => {
    const { error } = await supabase
      .from("servicio")
      .update({ estado })
      .eq("id", id);

    if (error) {
      console.error("Error al cambiar estado:", error.message);
    } else {
      fetchServicios();
    }
  };

  const handleEdit = (servicio) => {
    setEditingService(servicio);
    setShowModal(true);
  };

  const handleUpdate = async (updatedService) => {
    const { error } = await supabase
      .from("servicio")
      .update(updatedService)
      .eq("id", updatedService.id);

    if (error) {
      console.error("Error al editar servicio:", error.message);
    } else {
      fetchServicios();
      setShowModal(false);
    }
  };

  const eliminarServicio = async (id) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este servicio?");
    if (!confirm) return;

    const { error } = await supabase
      .from("servicio")
      .update({ baja: true })
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar servicio:", error.message);
    } else {
      fetchServicios();
    }
  };

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

  const enviarWhatsApp = (servicio) => {
    const mensaje = `
      Servicio Técnico:
      - Cliente: ${servicio.cliente.nombre} ${servicio.cliente.apellido}
      - DNI: ${servicio.cliente.dni}
      - Teléfono: ${servicio.cliente.telefono}
      - Detalle: ${servicio.detalle}
      - Costo: $${servicio.costo}
      - Estado: ${servicio.estado}
    `;
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6">Gestión de Servicios</h1>

      {/* Formulario para agregar servicios */}
      <ServicioForm />

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
                <td>
                  <select
                    value={servicio.estado}
                    onChange={(e) =>
                      cambiarEstado(servicio.id, e.target.value)
                    }
                    className="select select-bordered"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En Progreso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </td>
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
                    onClick={() => eliminarServicio(servicio.id)}
                    className="btn btn-error btn-sm"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => generarPDF(servicio)}
                    className="btn btn-primary btn-sm"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => enviarWhatsApp(servicio)}
                    className="btn btn-success btn-sm"
                  >
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para editar servicio */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Editar Servicio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="fecha_in"
                value={editingService.fecha_in}
                className="input input-bordered"
                readOnly
              />
              <input
                type="date"
                name="fecha_es"
                value={editingService.fecha_es || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    fecha_es: e.target.value,
                  })
                }
                className="input input-bordered"
              />
              <textarea
                name="detalle"
                value={editingService.detalle || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    detalle: e.target.value,
                  })
                }
                placeholder="Detalle del servicio"
                className="textarea textarea-bordered col-span-2"
                required
              ></textarea>
              <input
                type="text"
                name="costo"
                value={editingService.costo || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    costo: e.target.value,
                  })
                }
                placeholder="Costo"
                className="input input-bordered"
                required
              />
              <input
                type="text"
                name="num_factura"
                value={editingService.num_factura || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    num_factura: e.target.value,
                  })
                }
                placeholder="Número de Factura"
                className="input input-bordered"
              />
            </div>
            <div className="modal-action">
              <button
                onClick={() => handleUpdate(editingService)}
                className="btn btn-primary"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-error"
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
