export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio_unitario: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProducto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio_unitario: number;
  stock?: number;
}

export interface UpdateProducto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  precio_unitario?: number;
  stock?: number;
}

export interface PaginatedProductos {
  list: Producto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
