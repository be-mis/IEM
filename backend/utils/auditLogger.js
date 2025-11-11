// utils/auditLogger.js - Persist audit events to audit_logs table
const { getPool } = require('../config/database');

/**
 * Writes an audit log entry. Never throws to caller.
 * @param {Object} p
 * @param {string} p.entityType - e.g., 'item', 'branch', 'auth'
 * @param {string|number} [p.entityId]
 * @param {string} p.action - e.g., 'create', 'update', 'delete', 'login'
 * @param {string} [p.entityName]
 * @param {number} [p.userId]
 * @param {string} [p.userName]
 * @param {string} [p.userEmail]
 * @param {string} [p.ip]
 * @param {any} [p.details] - arbitrary JSON-serializable payload
 */
async function logAudit(p = {}) {
  try {
    const pool = getPool();
    const {
      entityType,
      entityId = null,
      action,
      entityName = null,
      userId = null,
      userName = null,
      userEmail = null,
      ip = null,
      details = null,
    } = p;

    if (!entityType || !action) return;

    // Safely stringify details as JSON (NULL if not provided)
    let detailsJson = null;
    if (typeof details !== 'undefined') {
      try { detailsJson = JSON.stringify(details); } catch (_) { detailsJson = null; }
    }

    await pool.execute(
      `INSERT INTO audit_logs 
       (entity_type, entity_id, action, entity_name, user_id, user_name, user_email, ip_address, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [String(entityType), entityId !== null ? String(entityId) : null, String(action), entityName, userId, userName, userEmail, ip, detailsJson]
    );
  } catch (err) {
    // Swallow errors to avoid impacting business flow, but log to console
    // eslint-disable-next-line no-console
    console.error('auditLogger.write failed:', err && err.message ? err.message : err);
  }
}

/** Extract best-effort IP string from Express request */
function getIp(req) {
  try {
    return (
      (req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) ||
      req.ip ||
      (req.connection && req.connection.remoteAddress) ||
      (req.socket && req.socket.remoteAddress) ||
      null
    );
  } catch {
    return null;
  }
}

module.exports = { logAudit, getIp };
