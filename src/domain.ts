export interface DomainSpec {
  kind: "booking" | "marketplace" | "services" | "commerce" | "generic";
  title: string;
  entities: string[];
  actions: string[];
  sections: string[];
}

const DOMAIN_KINDS = new Set<DomainSpec["kind"]>(["booking", "marketplace", "services", "commerce", "generic"]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

export function isDomainSpec(value: unknown): value is DomainSpec {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DomainSpec>;
  return typeof candidate.kind === "string"
    && DOMAIN_KINDS.has(candidate.kind as DomainSpec["kind"])
    && typeof candidate.title === "string"
    && candidate.title.trim().length > 0
    && isStringArray(candidate.entities)
    && isStringArray(candidate.actions)
    && isStringArray(candidate.sections);
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

export function compileDomain(idea: string): DomainSpec {
  const text = idea.toLowerCase();

  if (includesAny(text, ["reserva", "reservas", "turno", "turnos", "agenda", "cita", "citas", "booking"])) {
    return {
      kind: "booking",
      title: "Gestión de reservas",
      entities: ["Clientes", "Reservas", "Servicios", "Horarios"],
      actions: ["Crear reserva", "Reprogramar", "Cancelar", "Confirmar asistencia"],
      sections: ["Próximas reservas", "Disponibilidad", "Clientes", "Configuración"]
    };
  }

  if (includesAny(text, ["músico", "musico", "artista", "proveedor", "profesional", "contratar", "marketplace"])) {
    return {
      kind: "marketplace",
      title: "Marketplace de profesionales",
      entities: ["Clientes", "Profesionales", "Solicitudes", "Contratos"],
      actions: ["Publicar necesidad", "Ver perfiles", "Enviar propuesta", "Cerrar contratación"],
      sections: ["Oportunidades", "Profesionales", "Actividad", "Mensajes"]
    };
  }

  if (includesAny(text, ["servicio", "servicios", "reparación", "reparacion", "limpieza", "electricidad", "plomería", "plomeria"])) {
    return {
      kind: "services",
      title: "Gestión de servicios",
      entities: ["Clientes", "Trabajos", "Profesionales", "Cotizaciones"],
      actions: ["Solicitar servicio", "Cotizar", "Asignar profesional", "Completar trabajo"],
      sections: ["Solicitudes", "En curso", "Profesionales", "Historial"]
    };
  }

  if (includesAny(text, ["tienda", "producto", "productos", "carrito", "venta", "ventas", "ecommerce", "e-commerce"])) {
    return {
      kind: "commerce",
      title: "Gestión comercial",
      entities: ["Productos", "Clientes", "Pedidos", "Pagos"],
      actions: ["Agregar producto", "Crear pedido", "Actualizar estado", "Registrar pago"],
      sections: ["Ventas", "Productos", "Pedidos", "Clientes"]
    };
  }

  return {
    kind: "generic",
    title: "Producto digital",
    entities: ["Usuarios", "Registros", "Actividad"],
    actions: ["Crear", "Editar", "Consultar", "Completar flujo principal"],
    sections: ["Inicio", "Actividad", "Datos", "Configuración"]
  };
}
