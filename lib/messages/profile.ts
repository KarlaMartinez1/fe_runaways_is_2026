import type { UserRole, AccountStatus } from '@/types/models';

export const profileMessages = {
  pageTitle: 'Mi perfil',
  pageSubtitle: 'Administra tu información personal y el rol de tu cuenta.',

  // Profile Info Card
  fullNameLabel: 'Nombre completo',
  emailLabel: 'Correo electrónico',
  documentLabel: 'Documento',
  memberSinceLabel: 'Miembro desde',
  formatDocument: (type: string, number: string) => `${type} · ${number}`,
  formatRating: (rating: number, count: number) =>
    count > 0 ? `★ ${rating.toFixed(1)} · ${count} calificaciones` : '☆ Sin calificaciones',
  verifyAccountButton: 'Verificar mi cuenta',

  // Role Management Card
  roleCardTitle: 'Rol de la cuenta',
  roleCardDescription:
    'Cada cuenta tiene un único rol activo. Como arrendatario puedes reservar y pagar bienes. Como arrendador puedes publicar y gestionar bienes, pero no reservar ni pagar.',
  tenantRoleTitle: 'Arrendatario',
  tenantRoleSubtitle: 'Reserva y paga bienes',
  ownerRoleTitle: 'Arrendador',
  ownerRoleSubtitle: 'Publica y gestiona bienes',
  buttonSwitchToOwner: 'Cambiar a Arrendador',
  buttonSwitchToTenant: 'Cambiar a Arrendatario',
  buttonCurrentRole: 'Rol actualmente activo',
  disclaimerText:
    'El cambio es reversible. Para ser arrendador tu cuenta debe estar verificada. Al volver a arrendatario, tus bienes disponibles pasarán a pausados.',
  switchingRoleLoading: 'Cambiando de rol...',
  roleChangeSuccess: (newRoleName: string) =>
    `Tu cuenta ha cambiado al rol ${newRoleName} exitosamente.`,
  roleChangeError:
    'No fue posible cambiar el rol. Asegúrate de cumplir con todos los requisitos antes de intentarlo.',

  // Confirmation Dialog
  dialogTitle: 'Cambiar de rol',
  dialogBody: (fromRole: string, toRole: string) =>
    `Tu rol activo pasará de ${fromRole} a ${toRole}. Mientras seas ${toRole.toLowerCase()} podrás ${
      toRole === 'Arrendador'
        ? 'publicar y gestionar bienes, pero no reservar ni pagar'
        : 'reservar y pagar bienes, pero no publicar ni gestionar'
    }. El cambio es reversible.`,
  dialogConditionsBadge: 'Cuenta verificada y sin pagos pendientes',
  dialogCancelButton: 'Cancelar',
  dialogConfirmButton: 'Sí, cambiar de rol',
  dialogConfirmingButton: 'Cambiando...',

  // Blocked Dialogs
  blockedDialogUnderstandButton: 'Entendido',
  blockedPendingPayment: {
    title: 'No puedes cambiar de rol',
    body: 'Tienes pagos pendientes. Completa o cancela tus pagos pendientes para poder cambiar de rol.',
    actionButton: 'Ir a Mis reservas',
    actionHref: '/bookings/mine',
  },
  blockedUnverifiedAccount: {
    title: 'Verifica tu cuenta primero',
    body: 'Para cambiar a arrendador, tu cuenta debe estar verificada. Sube tu documento de identidad para continuar.',
    boxTitle: 'Cuenta sin verificar',
    boxSubtitle: 'La revisión del documento puede tardar hasta 24 horas.',
    actionButton: 'Verificar mi cuenta',
    actionHref: '/profile/verification',
  },
  blockedPendingDeposits: {
    title: 'No puedes cambiar de rol',
    body: 'Tienes depósitos pendientes de decisión. Resuelve los depósitos de tus reservas finalizadas para poder cambiar de rol.',
    actionButton: 'Ir a depósitos',
    actionHref: '/deposit',
  },

  // Requirements Card
  requirementsTitle: 'Requisitos para cambiar de rol',
  requirements: {
    verifiedAccount: 'Cuenta verificada',
    verifiedAccountFailed: 'Cuenta sin verificar · verifica tu identidad',
    noPendingPayments: 'Sin pagos pendientes',
    noPendingDeposits: 'Sin depósitos pendientes de decisión',
  },
  metBadge: 'Cumple',
  pendingBadge: 'Pendiente',
  notMetBadge: 'No cumple',
  links: {
    goToPay: 'Ir a pagar',
    verifyAccount: 'Verificar mi cuenta',
    goToDeposits: 'Gestionar depósitos',
  },
} as const;

export const roleDisplayLabels: Record<UserRole, string> = {
  TENANT: 'Arrendatario',
  OWNER: 'Arrendador',
  ADMIN: 'Administrador',
};

export const accountStatusDisplayLabels: Record<AccountStatus, string> = {
  VERIFICADA: 'Verificado',
  SIN_VERIFICAR: 'Sin verificar',
  PENDIENTE: 'Pendiente',
  RECHAZADA: 'Rechazada',
};
