import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { DepositPageBody } from '@/components/deposit';
import { ApiError } from '@/lib/api/client';
import { depositRepository } from '@/lib/repositories';
import { defaultDepositInfo } from '@/lib/repositories/mock/fixtures/deposits';
import type { DepositInfo, DepositMovement } from '@/types';

export const metadata: Metadata = {
  title: 'Gestión de depósito de garantía | Runaways',
  description: 'Administra la devolución o retención del depósito para esta reserva.',
};

type DepositPageProps = {
  searchParams: Promise<{ reservationId?: string; id?: string }>;
};

export default async function DepositPage({ searchParams }: DepositPageProps) {
  const params = await searchParams;
  const reservationId = params.reservationId || params.id || 'res-01';

  let depositInfo: DepositInfo | null = null;
  let movements: DepositMovement[] = [];
  let unauthorized = false;

  try {
    const [fetchedInfo, fetchedMovements] = await Promise.all([
      depositRepository.getDepositInfo(reservationId),
      depositRepository.getDepositMovements(reservationId),
    ]);

    depositInfo = fetchedInfo;
    movements = fetchedMovements;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error('Error al cargar la información del depósito:', error);
    }
  }

  if (unauthorized) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <DepositPageBody
        depositInfo={depositInfo ?? defaultDepositInfo}
        initialMovements={movements}
      />
    </>
  );
}
