const pool = require('../config/db');
const SizeChartModel = require('../models/size-chart.model');

const makeError = (message, status = 400, errors = null) => {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
};

const normalizeRows = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => ({
    size_code: String(row.size_code || '').trim().toUpperCase(),
    chest_cm: row.chest_cm ? String(row.chest_cm).trim() : null,
    waist_cm: row.waist_cm ? String(row.waist_cm).trim() : null,
    hip_cm: row.hip_cm ? String(row.hip_cm).trim() : null,
    shoulder_width_cm: row.shoulder_width_cm ? String(row.shoulder_width_cm).trim() : null,
    sleeve_length_cm: row.sleeve_length_cm ? String(row.sleeve_length_cm).trim() : null,
    shirt_length_cm: row.shirt_length_cm ? String(row.shirt_length_cm).trim() : null,
    height_cm: row.height_cm ? String(row.height_cm).trim() : null,
    sort_order: row.sort_order !== undefined && row.sort_order !== null ? Number(row.sort_order) : index
  }));
};

const validateRows = (rows) => {
  const errors = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    if (!row.size_code) {
      errors.push({ msg: `Row ${index + 1}: size_code is required` });
      return;
    }
    if (seen.has(row.size_code)) {
      errors.push({ msg: `Row ${index + 1}: duplicate size_code ${row.size_code}` });
    }
    seen.add(row.size_code);

    if (Number.isNaN(row.sort_order)) {
      errors.push({ msg: `Row ${index + 1}: sort_order must be a number` });
    }
  });

  if (errors.length) {
    throw makeError('Invalid size chart rows', 400, errors);
  }
};

const replaceForCategory = async (categoryId, rows) => {
  const normalized = normalizeRows(rows);
  validateRows(normalized);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await SizeChartModel.replaceForCategory(categoryId, normalized, conn);
    await conn.commit();
    return normalized.length;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  replaceForCategory
};
