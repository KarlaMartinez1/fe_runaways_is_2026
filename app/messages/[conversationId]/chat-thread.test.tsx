import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sendMessage } from "@/app/actions/messages";
import type { ChatMessage, ConversationSummary } from "@/lib/api/types";
import { bookingStatusLabels, messagingMessages as m } from "@/lib/messages/messaging";
import { ChatThread } from "./chat-thread";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("@/app/actions/messages", () => ({
  sendMessage: jest.fn(),
  startConversation: jest.fn(),
}));

const mockedSend = sendMessage as jest.MockedFunction<typeof sendMessage>;

const ownerId = "owner-1";
const tenantId = "tenant-1";

const conversation: ConversationSummary = {
  id: "conv-1",
  propertyId: "p-1",
  propertyTitle: "Apartamento céntrico de prueba",
  otherParticipantName: "Karla Martinez",
  lastMessage: null,
  lastMessageAt: "2026-11-20T15:00:00.000Z",
  lastMessageIsMine: false,
  unreadCount: 0,
  booking: { startDate: "2026-11-25", endDate: "2026-11-27", status: "PENDIENTE" },
};

const messages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: tenantId,
    content: "Hola, ¿a qué hora puedo recoger las llaves?",
    isRead: true,
    createdAt: "2026-11-20T15:00:00.000Z",
  },
];

function renderAsOwner() {
  return render(
    <ChatThread
      conversation={conversation}
      messages={messages}
      currentUserId={ownerId}
      showBookingStatus
    />,
  );
}

describe("H16. Coordinar la entrega del bien con el arrendatario", () => {
  beforeEach(() => {
    mockedSend.mockReset();
    mockRefresh.mockReset();
  });

  it("AC1: el arrendador ve el hilo con el arrendatario, el bien y sus mensajes", () => {
    renderAsOwner();

    expect(screen.getByRole("heading", { name: "Karla Martinez" })).toBeInTheDocument();
    expect(screen.getByText(/Apartamento céntrico de prueba/)).toBeInTheDocument();
    expect(screen.getByText(messages[0].content)).toBeInTheDocument();
    expect(screen.getByText(/^Karla Martinez · /)).toBeInTheDocument();
  });

  it("AC1: solo el arrendador ve el estado de la reserva en el encabezado", () => {
    const { rerender } = renderAsOwner();
    expect(screen.getByText(bookingStatusLabels.PENDIENTE)).toBeInTheDocument();

    rerender(
      <ChatThread
        conversation={conversation}
        messages={messages}
        currentUserId={tenantId}
        showBookingStatus={false}
      />,
    );
    expect(screen.queryByText(bookingStatusLabels.PENDIENTE)).not.toBeInTheDocument();
  });

  it("AC2 y AC3: al responder, el mensaje aparece en el hilo con su autor y fecha", async () => {
    const user = userEvent.setup();
    mockedSend.mockResolvedValue({
      ok: true,
      message: {
        id: "msg-2",
        senderId: ownerId,
        content: "Puedo entregártelas el viernes a las 10 a. m.",
        isRead: false,
        createdAt: "2026-11-20T15:05:00.000Z",
      },
    });
    renderAsOwner();

    await user.type(screen.getByLabelText(m.messageLabel), "Puedo entregártelas el viernes a las 10 a. m.");
    await user.click(screen.getByRole("button", { name: m.send }));

    expect(mockedSend).toHaveBeenCalledWith("conv-1", "Puedo entregártelas el viernes a las 10 a. m.");
    expect(await screen.findByText("Puedo entregártelas el viernes a las 10 a. m.")).toBeInTheDocument();
    expect(screen.getByText(/^Tú · /)).toBeInTheDocument();
    expect(screen.getByLabelText(m.messageLabel)).toHaveValue("");
  });

  it("AC5: no permite enviar un mensaje vacío", async () => {
    const user = userEvent.setup();
    renderAsOwner();

    await user.click(screen.getByRole("button", { name: m.send }));

    expect(screen.getByText(m.emptyMessage)).toBeInTheDocument();
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("AC5: el cuadro de texto no permite más de 500 caracteres", () => {
    renderAsOwner();

    expect(screen.getByLabelText(m.messageLabel)).toHaveAttribute("maxLength", "500");
  });

  it("AC6: muestra el error del servidor si el usuario intenta enviarse un mensaje a sí mismo", async () => {
    const user = userEvent.setup();
    mockedSend.mockResolvedValue({ ok: false, message: m.selfMessage });
    renderAsOwner();

    await user.type(screen.getByLabelText(m.messageLabel), "Hola");
    await user.click(screen.getByRole("button", { name: m.send }));

    expect(await screen.findByText(m.selfMessage)).toBeInTheDocument();
  });

  it("AC3: busca mensajes nuevos cada 15 segundos mientras el hilo está abierto", () => {
    jest.useFakeTimers();
    renderAsOwner();

    act(() => {
      jest.advanceTimersByTime(15_000);
    });
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});