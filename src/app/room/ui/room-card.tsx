import type { Habitacion } from "@/app/room/dom/Habitacion"

type RoomCardProps = {
    room: Habitacion
    onClick?: () => void
}

export function RoomCard({ room, onClick }: RoomCardProps) {
    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Disponible':
                return 'bg-emerald-700/20 text-emerald-400 border-emerald-700/30';
            case 'Ocupado':
                return 'bg-amber-700/20 text-amber-400 border-amber-700/30';
            case 'Reservado':
                return 'bg-indigo-700/20 text-indigo-400 border-indigo-700/30';
            case 'Mantenimiento':
                return 'bg-stone-600/20 text-stone-400 border-stone-600/30';
            default:
                return 'bg-stone-600/20 text-stone-400 border-stone-600/30';
        }
    }

    return (
        <div 
            key={room.id} 
            onClick={onClick}
            className="relative overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl cursor-pointer hover:scale-[1.02] transition-all duration-300 border border-stone-700/50 group"
        >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-10 pointer-events-none" />
            
            <div className="relative p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <h3 className="text-xl font-bold text-stone-100">Hab. {room.numero}</h3>
                        </div>
                        <p className="text-sm text-stone-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Piso {room.piso}
                        </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(room.estado)}`}>
                        {room.estado}
                    </span>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">{room.tipo}</p>
                        <p className="text-2xl font-bold text-amber-500">
                            S/{room.precio}
                            <span className="text-sm font-normal text-stone-500">/noche</span>
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <svg className="w-5 h-5 text-stone-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-700/50 flex justify-between items-center">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-600"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-600"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-600"></div>
                    </div>
                    <p className="text-xs text-stone-600 font-mono">#{room.id.slice(0, 8)}</p>
                </div>
            </div>
        </div>
    )
}
