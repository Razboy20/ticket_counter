import { z } from "zod";

// ---- shared types ----
export const RoomInfo = z.object({ total: z.number(), verified: z.boolean(), name: z.string().optional() });
export const UserInfo = z.object({
  id: z.string(),
  name: z.string(),
  online: z.boolean(),
  checkinTime: z.coerce.date(),
});

// ---- server messages ----
export const InfoMessage = z.object({ type: z.literal("info"), ticket: z.number(), room: RoomInfo });
export const ServerUpdateMessage = z.object({
  type: z.literal("update"),
  room: RoomInfo.partial(),
});
export const AdminSyncMessage = z.object({
  type: z.literal("admin_sync"),
  room: RoomInfo,
  users: z.array(UserInfo),
});
export const AdminUpdateMessage = z.object({
  type: z.literal("update"),
  room: RoomInfo.partial(),
});

export const ServerMessage = z.union([InfoMessage, ServerUpdateMessage]);
export const AdminServerMessage = z.union([AdminSyncMessage, ServerUpdateMessage]);

// ---- client messages ----
export const VerifyRoomMessage = z.object({ type: z.literal("verify") });
// todo: add more fields
export const ModifyUserMessage = z.object({ type: z.literal("modify_user") });

export const ClientMessage = z.union([VerifyRoomMessage, ModifyUserMessage]);
