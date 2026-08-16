export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  GYM_ADMIN: "GYM_ADMIN",
  STAFF: "STAFF",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const GYM_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type GymStatus = (typeof GYM_STATUS)[keyof typeof GYM_STATUS];

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
} as const;
export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/** Number of days a gym can continue using the product after subscription expiry. */
export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 7;

export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  FROZEN: "FROZEN",
} as const;
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

export const MEMBERSHIP_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type MembershipStatus =
  (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

export const DURATION_UNIT = {
  DAY: "DAY",
  MONTH: "MONTH",
  YEAR: "YEAR",
} as const;
export type DurationUnit = (typeof DURATION_UNIT)[keyof typeof DURATION_UNIT];

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;
export type Gender = (typeof GENDER)[keyof typeof GENDER];

export const PAYMENT_METHOD = {
  CASH: "CASH",
  UPI: "UPI",
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  OTHER: "OTHER",
} as const;
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const ATTENDANCE_SOURCE = {
  MANUAL: "MANUAL",
  FINGERPRINT: "FINGERPRINT",
} as const;
export type AttendanceSource =
  (typeof ATTENDANCE_SOURCE)[keyof typeof ATTENDANCE_SOURCE];

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
} as const;
export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ANNOUNCEMENT_RECIPIENT = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  EXPIRING: "EXPIRING",
  EXPIRED: "EXPIRED",
} as const;
export type AnnouncementRecipient =
  (typeof ANNOUNCEMENT_RECIPIENT)[keyof typeof ANNOUNCEMENT_RECIPIENT];

export const ANNOUNCEMENT_STATUS = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  SENT: "SENT",
  FAILED: "FAILED",
} as const;
export type AnnouncementStatus =
  (typeof ANNOUNCEMENT_STATUS)[keyof typeof ANNOUNCEMENT_STATUS];

export const MonthlyAdminFee = 1000;
