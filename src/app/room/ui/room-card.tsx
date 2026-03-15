import type { Habitacion } from "@/models/Habitacion"

type RoomCardProps = {
    room: Habitacion
}

export function RoomCard({ room }: RoomCardProps) {
    return (
        <div key={room.id}>
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
