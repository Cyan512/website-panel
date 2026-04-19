export interface CreateFolio {
  estancia_id: string;
  observacion?: string;
  promocion_ids?: string[];
}

export interface CreateFolioServicio {
  concepto: string;
  cantidad: number;
  precio_unit: number;
}

export interface CreateFolioProductoDto {
  producto_id: string;
  cantidad: number;
}

export interface UpdateFolio {
  estado?: boolean;
  observacion?: string;
  promocion_ids?: string[];
}

export interface ListFolio {
  page?: number;
  limit?: number;
  estanciaId?: string;
  estado?: boolean;
}

export interface FolioPromocion {
  id: string;
  codigo: string;
  tipoDescuento: string;
  valorDescuento: number;
  vigDesde: string;
  vigHasta: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folio {
  id: string;
  codigo: string;
  estanciaId: string;
  pagoId: string | null;
  estado: boolean;
  observacion: string | null;
  cerradoEn: string | null;
  promociones: FolioPromocion[];
  createdAt: string;
  updatedAt: string;
}

export interface FolioProducto {
  id: string;
  folioId: string;
  productoId: string;
  cantidad: number;
  precioUnit: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolioServicio {
  id: string;
  folioId: string;
  concepto: string;
  cantidad: number;
  precioUnit: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolioWithConsumos extends Folio {
  productos: FolioProducto[];
  servicios: FolioServicio[];
  total: number;
}

export interface FolioPaginated {
  list: Folio[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CobrarResponse {
  folio: Folio;
  productos: FolioProducto[];
  servicios: FolioServicio[];
  subtotal: number;
  descuento: number;
  total: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}