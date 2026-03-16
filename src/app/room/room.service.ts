import { roomRepository } from "@/app/room/infra/room.repository";
export type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";

export const roomService = {
  getAll: roomRepository.getAll,

  getById: roomRepository.getById,

  createRoom: roomRepository.create,
};