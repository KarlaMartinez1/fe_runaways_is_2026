import { redirect } from "next/navigation";

type BookingDepositPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDepositPage({ params }: BookingDepositPageProps) {
  const { id } = await params;
  redirect(`/deposit?reservationId=${encodeURIComponent(id)}`);
}
