import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import type { ConversationSummary } from "@/lib/api/types";
import { messagingMessages as m } from "@/lib/messages/messaging";
import { MESSAGE_MAX, getMessageError } from "@/lib/validations/message";
import { ConversationList } from "./conversation-list";

const conversations: ConversationSummary[] = [
  {
    id: "conv-antigua",
    propertyId: "p-1",
    propertyTitle: "Cámara de prueba",
    otherParticipantName: "Emely Chavez",
    lastMessage: null,
    lastMessageAt: "2026-11-18T15:00:00.000Z",
    lastMessageIsMine: false,
    unreadCount: 0,
    booking: null,
  },
  {
    id: "conv-reciente",
    propertyId: "p-2",
    propertyTitle: "Apartamento céntrico de prueba",
    otherParticipantName: "Fernando Diaz",
    lastMessage: null,
    lastMessageAt: "2026-11-20T15:00:00.000Z",
    lastMessageIsMine: false,
    unreadCount: 2,
    booking: null,
  },
  {
    id: "conv-sin-mensajes",
    propertyId: "p-3",
    propertyTitle: "Proyector de prueba",
    otherParticipantName: "Karla Martinez",
    lastMessage: null,
    lastMessageAt: null,
    lastMessageIsMine: false,
    unreadCount: 0,
    booking: null,
  },
];

describe("H15. Preguntar dudas sobre el alquiler", () => {
  it("AC2: permite enviar un mensaje de 1 a 500 caracteres", () => {
    expect(getMessageError("¿Está disponible el fin de semana?")).toBeUndefined();
    expect(getMessageError("a")).toBeUndefined();
    expect(getMessageError("a".repeat(MESSAGE_MAX))).toBeUndefined();
  });

  it("AC5: no permite enviar un mensaje vacío ni de más de 500 caracteres", () => {
    expect(getMessageError("")).toBe(m.emptyMessage);
    expect(getMessageError("    ")).toBe(m.emptyMessage);
    expect(getMessageError("a".repeat(MESSAGE_MAX + 1))).toBe(m.tooLong);
  });

  it("AC3: la lista muestra la otra persona, el bien y el indicador de mensajes no leídos", () => {
    render(<ConversationList conversations={conversations} />);

    expect(screen.getByText("Fernando Diaz")).toBeInTheDocument();
    expect(screen.getByText("Apartamento céntrico de prueba")).toBeInTheDocument();
    expect(screen.getByText(m.unreadCount(2))).toBeInTheDocument();
    expect(screen.getAllByText(/Mensajes sin leer/)).toHaveLength(1);
  });

  it("AC1: cada conversación abre su hilo, de la más reciente a la más antigua", () => {
    render(<ConversationList conversations={conversations} />);

    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).toEqual([
      "/messages/conv-reciente",
      "/messages/conv-antigua",
      "/messages/conv-sin-mensajes",
    ]);
  });

  it("AC1: marca la conversación abierta", () => {
    render(<ConversationList conversations={conversations} activeId="conv-antigua" />);

    expect(screen.getByRole("link", { current: "page" })).toHaveAttribute("href", "/messages/conv-antigua");
  });

  it("AC3: muestra un mensaje cuando todavía no hay conversaciones", () => {
    render(<ConversationList conversations={[]} />);

    expect(screen.getByText(m.emptyList)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});