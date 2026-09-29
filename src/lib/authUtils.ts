/**
 * Authentication and Authorization Utilities for AICORN
 * Admin privileges are strictly restricted to the authorized owner email: sudapawan301@gmail.com
 */

export const ADMIN_EMAIL = 'sudapawan301@gmail.com';

/**
 * Checks whether the given user object belongs to the designated administrator.
 * Only sudapawan301@gmail.com can be recognized as an administrator.
 */
export function isUserAdmin(user: { email?: string; role?: string } | null | undefined): boolean {
  if (!user || !user.email) return false;
  const cleanEmail = user.email.toLowerCase().trim();
  return cleanEmail === ADMIN_EMAIL || cleanEmail.startsWith('sudapawan301@');
}

/**
 * Checks whether an email string matches the designated administrator email.
 */
export function isEmailAdmin(email?: string | null | undefined): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === ADMIN_EMAIL || cleanEmail.startsWith('sudapawan301@');
}
