const bcrypt = require('bcrypt');
const pool = require('../../config/db');
const UserModel = require('../../models/user.model');
const UserAddressModel = require('../../models/user-address.model');
const RbacModel = require('../../models/rbac.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const normalizeIds = (values) => {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const ids = [];
  for (const value of values) {
    const id = Number(value);
    if (!id || Number.isNaN(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
};

const ensureUserExists = async (id) => {
  const user = await UserModel.findById(id);
  if (!user || user.deleted_at) return null;
  return user;
};

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : '';

    const [items, total] = await Promise.all([
      UserModel.listPaginated({ limit, offset, search }),
      UserModel.countAll({ search })
    ]);

    return ok(res, 'Users', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const [rbac, addresses] = await Promise.all([
      UserModel.getRolesAndPermissions(user.id),
      UserAddressModel.listByUserId(user.id)
    ]);

    return ok(res, 'User', {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      is_active: Boolean(user.is_active),
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: rbac.roles,
      permissions: rbac.permissions,
      addresses
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const roleIds = normalizeIds(req.body.role_ids);
    if (roleIds.length) {
      const validIds = await RbacModel.listValidRoleIds(roleIds);
      if (validIds.length !== roleIds.length) {
        return fail(res, 'Some roles do not exist', null, 400);
      }
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const userId = await UserModel.createAdmin(
        {
          full_name: req.body.full_name,
          email: req.body.email,
          phone: req.body.phone || null,
          password_hash: passwordHash,
          is_active: req.body.is_active !== undefined ? req.body.is_active : true
        },
        conn
      );

      if (roleIds.length) {
        await UserModel.replaceRoles(userId, roleIds, conn);
      }

      await conn.commit();

      await ActivityService.log(req.user.id, 'CREATE_USER', 'users', userId, {
        email: req.body.email
      });

      return ok(res, 'User created', { id: userId }, 201);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const roleIdsProvided = Object.prototype.hasOwnProperty.call(req.body, 'role_ids');
    const roleIds = normalizeIds(req.body.role_ids);

    if (roleIdsProvided) {
      const validIds = await RbacModel.listValidRoleIds(roleIds);
      if (validIds.length !== roleIds.length) {
        return fail(res, 'Some roles do not exist', null, 400);
      }
    }

    const payload = {};
    if (req.body.full_name !== undefined) payload.full_name = req.body.full_name;
    if (req.body.email !== undefined) payload.email = req.body.email;
    if (req.body.phone !== undefined) payload.phone = req.body.phone || null;
    if (req.body.is_active !== undefined) payload.is_active = req.body.is_active;
    if (req.body.password !== undefined && req.body.password !== '') {
      payload.password_hash = await bcrypt.hash(req.body.password, 10);
    }

    if (!Object.keys(payload).length && !roleIdsProvided) {
      return fail(res, 'No data to update', null, 400);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (Object.keys(payload).length) {
        await UserModel.updateAdmin(req.params.id, payload, conn);
      }

      if (roleIdsProvided) {
        await UserModel.replaceRoles(req.params.id, roleIds, conn);
      }

      await conn.commit();

      await ActivityService.log(req.user.id, 'UPDATE_USER', 'users', req.params.id, {
        fields: Object.keys(payload),
        role_ids: roleIdsProvided ? roleIds : undefined
      });

      return ok(res, 'User updated', { id: Number(req.params.id) });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return fail(res, 'You cannot delete your own account', null, 400);
    }

    const affected = await UserModel.softDelete(req.params.id);
    if (!affected) return fail(res, 'User not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_USER', 'users', req.params.id, null);
    return ok(res, 'User deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const setRoles = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const roleIds = normalizeIds(req.body.role_ids);
    const validIds = await RbacModel.listValidRoleIds(roleIds);
    if (validIds.length !== roleIds.length) {
      return fail(res, 'Some roles do not exist', null, 400);
    }

    await UserModel.replaceRoles(req.params.id, roleIds);

    await ActivityService.log(req.user.id, 'SET_USER_ROLES', 'user_roles', req.params.id, {
      role_ids: roleIds
    });

    return ok(res, 'User roles updated', { id: Number(req.params.id), role_ids: roleIds });
  } catch (err) {
    next(err);
  }
};

const listAddresses = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const items = await UserAddressModel.listByUserId(req.params.id);
    return ok(res, 'User addresses', { items });
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const id = await UserAddressModel.create(req.params.id, req.body);

    await ActivityService.log(req.user.id, 'CREATE_USER_ADDRESS', 'user_addresses', id, {
      user_id: Number(req.params.id)
    });

    return ok(res, 'Address created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const affected = await UserAddressModel.update(req.params.addressId, req.params.id, req.body);
    if (!affected) return fail(res, 'Address not found', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_USER_ADDRESS', 'user_addresses', req.params.addressId, {
      user_id: Number(req.params.id)
    });

    return ok(res, 'Address updated', { id: Number(req.params.addressId) });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const user = await ensureUserExists(req.params.id);
    if (!user) return fail(res, 'User not found', null, 404);

    const affected = await UserAddressModel.softDelete(req.params.addressId, req.params.id);
    if (!affected) return fail(res, 'Address not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_USER_ADDRESS', 'user_addresses', req.params.addressId, {
      user_id: Number(req.params.id)
    });

    return ok(res, 'Address deleted', { id: Number(req.params.addressId) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  setRoles,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
