import { redirect } from 'next/navigation';

type BookingReceiptPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingReceiptPage({ params }: BookingReceiptPageProps) {
  const { id } = await params;
  redirect(`/receipt?reservationId=${encodeURIComponent(id)}`);
}
