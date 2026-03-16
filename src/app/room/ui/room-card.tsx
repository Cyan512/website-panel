import type { Habitacion } from "@/app/room/dom/Habitacion"

type RoomCardProps = {
    room: Habitacion
    onClick?: () => void
}

export function RoomCard({ room, onClick }: RoomCardProps) {
    return (
        <div key={room.id} onClick={onClick} style={{ cursor: "pointer" }}>
            <div>
                <div>
                    <div>
                        ${room.numero}
                    </div>
                    <div>
                        ${room.tipo}
                    </div>
                </div>
                <div>
                </div>
            </div>
            <div >
                <div>
                    ${room.precio}/n
                </div>
                <div>
                    J.Liu
                </div>
            </div>
        </div>
    )
}
