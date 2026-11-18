import { redirect } from 'next/navigation';

type BookingPaymentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingPaymentPage({ params }: BookingPaymentPageProps) {
  const { id } = await params;
  redirect(`/payment?reservationId=${encodeURIComponent(id)}`);
}
