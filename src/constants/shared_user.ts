export const USER_ROLES = {
  SHIPPER: 'SHIPPER',
  DRIVER: 'DRIVER',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const VERIFICATION_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED'
} as const;