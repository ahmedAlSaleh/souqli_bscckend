const RbacModel = require('../../models/rbac.model');
const ActivityService = require('../../services/activity.service');
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

const listRoles = async (req, res, next) => {
  try {
    const items = await RbacModel.listRoles();
    return ok(res, 'Roles', { items });
  } catch (err) {
    next(err);
  }
};

const createRole = async (req, res, next) => {
  try {
    const id = await RbacModel.createRole(req.body);

    await ActivityService.log(req.user.id, 'CREATE_ROLE', 'roles', id, {
      name: req.body.name
    });

    return ok(res, 'Role created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const affected = await RbacModel.updateRole(req.params.roleId, req.body);
    if (!affected) return fail(res, 'Role not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_ROLE', 'roles', req.params.roleId, req.body);

    return ok(res, 'Role updated', { id: Number(req.params.roleId) });
  } catch (err) {
    next(err);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const role = await RbacModel.findRoleById(req.params.roleId);
    if (!role) return fail(res, 'Role not found', null, 404);

    const usersCount = await RbacModel.countUsersByRole(req.params.roleId);
    if (usersCount > 0) {
      return fail(res, 'Role is assigned to users and cannot be deleted', null, 400);
    }

    const affected = await RbacModel.deleteRole(req.params.roleId);
    if (!affected) return fail(res, 'Role not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_ROLE', 'roles', req.params.roleId, null);

    return ok(res, 'Role deleted', { id: Number(req.params.roleId) });
  } catch (err) {
    next(err);
  }
};

const listPermissions = async (req, res, next) => {
  try {
    const items = await RbacModel.listPermissions();
    return ok(res, 'Permissions', { items });
  } catch (err) {
    next(err);
  }
};

const createPermission = async (req, res, next) => {
  try {
    const id = await RbacModel.createPermission(req.body);

    await ActivityService.log(req.user.id, 'CREATE_PERMISSION', 'permissions', id, {
      code: req.body.code
    });

    return ok(res, 'Permission created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updatePermission = async (req, res, next) => {
  try {
    const affected = await RbacModel.updatePermission(req.params.permissionId, req.body);
    if (!affected) return fail(res, 'Permission not found or no changes', null, 404);

    await ActivityService.log(
      req.user.id,
      'UPDATE_PERMISSION',
      'permissions',
      req.params.permissionId,
      req.body
    );

    return ok(res, 'Permission updated', { id: Number(req.params.permissionId) });
  } catch (err) {
    next(err);
  }
};

const deletePermission = async (req, res, next) => {
  try {
    const permission = await RbacModel.findPermissionById(req.params.permissionId);
    if (!permission) return fail(res, 'Permission not found', null, 404);

    const rolesCount = await RbacModel.countRolesByPermission(req.params.permissionId);
    if (rolesCount > 0) {
      return fail(res, 'Permission is assigned to roles and cannot be deleted', null, 400);
    }

    const affected = await RbacModel.deletePermission(req.params.permissionId);
    if (!affected) return fail(res, 'Permission not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_PERMISSION', 'permissions', req.params.permissionId, null);

    return ok(res, 'Permission deleted', { id: Number(req.params.permissionId) });
  } catch (err) {
    next(err);
  }
};

const listRolePermissions = async (req, res, next) => {
  try {
    const role = await RbacModel.findRoleById(req.params.roleId);
    if (!role) return fail(res, 'Role not found', null, 404);

    const permissionIds = await RbacModel.listRolePermissionIds(req.params.roleId);
    return ok(res, 'Role permissions', {
      role_id: Number(req.params.roleId),
      permission_ids: permissionIds
    });
  } catch (err) {
    next(err);
  }
};

const setRolePermissions = async (req, res, next) => {
  try {
    const role = await RbacModel.findRoleById(req.params.roleId);
    if (!role) return fail(res, 'Role not found', null, 404);

    const permissionIds = normalizeIds(req.body.permission_ids);
    const validIds = await RbacModel.listValidPermissionIds(permissionIds);
    if (validIds.length !== permissionIds.length) {
      return fail(res, 'Some permissions do not exist', null, 400);
    }

    await RbacModel.replaceRolePermissions(req.params.roleId, permissionIds);

    await ActivityService.log(req.user.id, 'SET_ROLE_PERMISSIONS', 'role_permissions', req.params.roleId, {
      permission_ids: permissionIds
    });

    return ok(res, 'Role permissions updated', {
      role_id: Number(req.params.roleId),
      permission_ids: permissionIds
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  listRolePermissions,
  setRolePermissions
};
