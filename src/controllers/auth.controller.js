const AuthService = require('../services/auth.service');
const UserModel = require('../models/user.model');
const { ok, fail } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { token, user } = await AuthService.register(req.body);
    return ok(res, 'Registered successfully', { token, user }, 201);
  } catch (err) {
    if (err.status) {
      return fail(res, err.message, null, err.status);
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const identifier = req.body.email || req.body.phone || req.body.identifier;
    const { token, user } = await AuthService.login(identifier, req.body.password);
    return ok(res, 'Login successful', {
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email }
    });
  } catch (err) {
    if (err.status) {
      return fail(res, err.message, null, err.status);
    }
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const data = {
      full_name: req.body.full_name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password
    };

    await AuthService.updateProfile(req.user.id, data);
    const user = await UserModel.findById(req.user.id);
    return ok(res, 'Profile updated', {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    if (err.status) {
      return fail(res, err.message, null, err.status);
    }
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user || user.deleted_at) {
      return fail(res, 'User not found', null, 404);
    }
    const rbac = await UserModel.getRolesAndPermissions(user.id);
    return ok(res, 'Me', {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      roles: rbac.roles,
      permissions: rbac.permissions.map((p) => p.code)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me, updateMe };
