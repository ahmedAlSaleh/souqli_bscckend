// Simple guardrails so list endpoints stay predictable.
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limitInput = parseInt(query.limit, 10) || 10;
  const limit = Math.min(Math.max(limitInput, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const buildPagination = (page, limit, total) => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return { page, limit, total, totalPages };
};

module.exports = { parsePagination, buildPagination };
