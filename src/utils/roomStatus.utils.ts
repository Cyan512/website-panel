export const RoomStatus = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  RESERVED: "reserved",
};

export const roomStatusLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "occupied":
      return "Ocupado";
    case "cleaning":
      return "Limpieza";
    case "reserved":
      return "Reservado";
  }
};
