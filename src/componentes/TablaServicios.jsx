import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCog,
    faCheckCircle,
    faEdit,
    faTrash,
    faFilePdf,
    faEye,
    faSort,
} from "@fortawesome/free-solid-svg-icons";
import { formatFecha, calculateDaysRemaining } from "../utils/DateUtils";
import PropTypes from "prop-types";

const TablaServicios = ({
    servicios,
    onSort,
    onViewDetails,
    onChangeState,
    onEdit,
    onDelete,
    onGeneratePDF,
    sortConfig,
}) => {
    const getSortIcon = (key) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === "asc" ? "↑" : "↓";
        }
        return null;
    };

    return (
        <table className="table w-full">
            <thead>
                <tr>
                    <th>
                        Fecha Ingreso{" "}
                        <FontAwesomeIcon
                            icon={faSort}
                            onClick={() => onSort("fecha_in")}
                            className="cursor-pointer"
                        />
                        {getSortIcon("fecha_in")}
                    </th>
                    <th>Detalle</th>
                    <th>Cliente</th>
                    <th>
                        Días Restantes{" "}
                        <FontAwesomeIcon
                            icon={faSort}
                            onClick={() => onSort("fecha_es")}
                            className="cursor-pointer"
                        />
                        {getSortIcon("fecha_es")}
                    </th>
                    <th>Fecha Estimada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {servicios.map((servicio) => {
                    const { days, status } = calculateDaysRemaining(
                        servicio.fecha_es,
                        servicio.estado
                    );
                    return (
                        <tr key={servicio.idServicio}>
                            <td>{formatFecha(servicio.fecha_in)}</td>
                            <td>{servicio.detalle}</td>
                            <td>
                                {servicio.cliente.nombre} {servicio.cliente.apellido}
                            </td>
                            <td
                                className={`${status === "atrasado"
                                        ? "text-red-500 font-bold"
                                        : status === "urgente"
                                            ? "text-yellow-500 font-semibold"
                                            : status === "finalizado"
                                                ? "text-green-500 font-bold"
                                                : "text-gray-500"
                                    }`}
                            >
                                {status === "finalizado"
                                    ? "Finalizado"
                                    : days < 0
                                        ? `Atrasado (${Math.abs(days)} días)`
                                        : `${days} días`}
                            </td>
                            <td>{formatFecha(servicio.fecha_es)}</td>
                            <td> 
                                <FontAwesomeIcon
                                    icon={
                                        servicio.estado === "pendiente"
                                            ? faClock
                                            : servicio.estado === "en progreso"
                                                ? faCog
                                                : faCheckCircle
                                    }
                                    className={`${servicio.estado === "pendiente"
                                            ? "text-gray-500"
                                            : servicio.estado === "en progreso"
                                                ? "text-yellow-500"
                                                : "text-green-500"
                                        }`}
                                />
                            </td>
                            <td className="flex justify-center space-x-4">
                                <button onClick={() => onViewDetails(servicio)}>
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    onClick={() =>
                                        onChangeState(
                                            servicio.idServicio,
                                            servicio.estado === "finalizado"
                                                ? "pendiente"
                                                : "finalizado"
                                        )
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={
                                            servicio.estado === "finalizado"
                                                ? faClock
                                                : faCheckCircle
                                        }
                                    />
                                </button>
                                <button onClick={() => onEdit(servicio)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button onClick={() => onDelete(servicio.idServicio)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                                <button onClick={() => onGeneratePDF(servicio)}>
                                    <FontAwesomeIcon icon={faFilePdf} />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

TablaServicios.propTypes = {
    servicios: PropTypes.arrayOf(
        PropTypes.shape({
            idServicio: PropTypes.number.isRequired,
            fecha_in: PropTypes.string.isRequired,
            fecha_es: PropTypes.string.isRequired,
            detalle: PropTypes.string.isRequired,
            estado: PropTypes.string.isRequired,
            cliente: PropTypes.shape({
                nombre: PropTypes.string.isRequired,
                apellido: PropTypes.string.isRequired,
            }).isRequired,
        })
    ).isRequired,
    onSort: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onChangeState: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onGeneratePDF: PropTypes.func.isRequired,
    sortConfig: PropTypes.shape({
        key: PropTypes.string,
        direction: PropTypes.string,
    }),
};


export default TablaServicios;