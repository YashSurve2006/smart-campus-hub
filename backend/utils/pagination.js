export function parsePageLimit(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const rawPage = Number.parseInt(query.page, 10);
  const page = Math.max(1, Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1);

  const rawLimit = Number.parseInt(query.limit, 10);
  let limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;
  if (!Number.isFinite(limit) || limit <= 0) limit = defaultLimit;
  limit = Math.max(1, Math.min(maxLimit, limit));

  const offset = Math.trunc((page - 1) * limit);

  return { page: Math.trunc(page), limit: Math.trunc(limit), offset };
}

export function parseLimitOffset(query = {}, { defaultLimit = 50, maxLimit = 100 } = {}) {
  const rawLimit = Number.parseInt(query.limit, 10);
  let limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;
  if (!Number.isFinite(limit) || limit <= 0) limit = defaultLimit;
  limit = Math.max(1, Math.min(maxLimit, limit));

  const rawOffset = Number.parseInt(query.offset, 10);
  const offset = Math.max(0, Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0);

  return { limit: Math.trunc(limit), offset: Math.trunc(offset) };
}

