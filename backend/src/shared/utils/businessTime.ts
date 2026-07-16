const BUSINESS_TIMEZONE_OFFSET_HOURS = 1; // WAT (UTC+1). Move to a
// per-business field before expanding beyond Nigeria — see the
// discussion in Milestone 9.

function toBusinessLocal(date: Date): Date {
  return new Date(date.getTime() + BUSINESS_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
}
function toUtcInstant(businessLocalDate: Date): Date {
  return new Date(businessLocalDate.getTime() - BUSINESS_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
}

export function startOfBusinessDay(reference: Date): Date {
  const local = toBusinessLocal(reference);
  const startLocal = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
  return toUtcInstant(startLocal);
}

export function startOfBusinessWeek(reference: Date): Date {
  const local = toBusinessLocal(reference);
  const dayOfWeek = local.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const startLocal = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceMonday));
  return toUtcInstant(startLocal);
}

export function startOfBusinessMonth(reference: Date): Date {
  const local = toBusinessLocal(reference);
  const startLocal = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1));
  return toUtcInstant(startLocal);
}