import type { Huesped } from "../types";
import { MdEmail, MdPhone, MdPerson } from "react-icons/md";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";

DataTable.use(DT);

interface HuespedTableProps {
  huespedes: Huesped[];
  onRowClick: (huesped: Huesped) => void;
}

export function HuespedTable({ huespedes, onRowClick }: HuespedTableProps) {
  
  const data = huespedes.map((h) => [
    `${h.nombres} ${h.apellidos}`,
    h.email,
    h.telefono,
    h.nacionalidad,
  ]);

  const columns = [
    { title: "Nombre", render: (data: string) => {
      const [nombres, apellidos] = data.split(" ");
      return `<div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-accent-primary/10 text-accent-primary">
          ${nombres.charAt(0)}${apellidos.charAt(0)}
        </div>
        <span>${data}</span>
      </div>`;
    }
    },
    { title: "Email" , render: (data: string) => `<div class="flex items-center gap-2 text-sm text-text-muted"><svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span>${data}</span></div>` },
    { title: "Teléfono", render: (data: string) => `<div class="flex items-center gap-2 text-sm text-text-muted"><svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><span>${data}</span></div>` },
    { title: "Nacionalidad", render: (data: string) => `<span>${data}</span>` }
  ];

  return (
    <div className="overflow-x-auto p-4 sm:p-6">
      <DataTable
        data={data}
        columns={columns}
        className="min-w-full table-auto border border-border-light/30 rounded-xl"
        options={{
            pageLength: 5,
            language: {
                emptyTable: "No hay huéspedes registrados",
                info: "Mostrando _START_ a _END_ de _TOTAL_ huéspedes",
                infoEmpty: "Mostrando 0 a 0 de 0 huéspedes",
                lengthMenu: "Mostrar _MENU_ huéspedes",
                paginate: {
                previous: "Anterior",
                next: "Siguiente"
                }
            },
            createdRow: (row) => {
                row.classList.add(
                "border-t",
                "border-border-light/30",
                "hover:bg-accent-primary/5",
                "cursor-pointer",
                "transition"
                );
            },
          
        }}
        
        onClick={(e: any) => {
          const row = e.target.closest("tr");
          if (!row) return;

          const index = row._DT_RowIndex;
          if (index === undefined) return;

          const huesped = huespedes[index];
          onRowClick(huesped);
        }}
      />
    </div>
  );
}
