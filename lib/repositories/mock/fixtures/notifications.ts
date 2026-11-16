import type { NotificationItem } from "@/lib/repositories/notification-repository";

export const notificationFixtures: NotificationItem[] = [
  {
    id: "notif-01",
    title: "Nuevo mensaje",
    category: "MESSAGING",
    message: "Roberto Díaz te respondió sobre Casa de playa.",
    createdAt: "2026-11-01T22:05:00-06:00",
    status: "UNREAD",
    link: "/messages",
  },
  {
    id: "notif-02",
    title: "Reserva creada",
    category: "BOOKING",
    message:
      "Tu reserva de Casa de playa del 12 al 14 nov está pendiente. Págala antes del 3 nov, 9:15 p. m.",
    createdAt: "2026-11-01T21:15:00-06:00",
    status: "UNREAD",
    link: "/bookings/mine",
  },
  {
    id: "notif-03",
    title: "Pago confirmado",
    category: "PAYMENT",
    message:
      "Se registró el pago de tu reserva de Casa de playa del 5 al 6 dic.",
    createdAt: "2026-10-30T16:12:00-06:00",
    status: "READ",
    link: "/bookings/mine",
  },
  {
    id: "notif-04",
    title: "Reserva cancelada",
    category: "BOOKING",
    message:
      "Tu reserva de Cámara del 28 al 29 oct venció porque no se pagó a tiempo.",
    createdAt: "2026-10-28T11:40:00-06:00",
    status: "READ",
    link: "/bookings/mine",
  },
  {
    id: "notif-05",
    title: "Cuenta verificada",
    category: "VERIFICATION",
    message: "Tu documento de identidad fue aprobado. Ya puedes reservar.",
    createdAt: "2026-10-20T15:02:00-06:00",
    status: "READ",
    link: "/profile/verification",
  },
];
