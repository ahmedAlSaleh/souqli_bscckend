const UserAddressModel = require('../models/user-address.model');
const { ok, fail } = require('../utils/response');

const listMyAddresses = async (req, res, next) => {
  try {
    const items = await UserAddressModel.listByUserId(req.user.id);
    return ok(res, 'Addresses', { items });
  } catch (err) {
    next(err);
  }
};

const createMyAddress = async (req, res, next) => {
  try {
    const id = await UserAddressModel.create(req.user.id, req.body);
    return ok(res, 'Address created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updateMyAddress = async (req, res, next) => {
  try {
    const affected = await UserAddressModel.update(req.params.id, req.user.id, req.body);
    if (!affected) return fail(res, 'Address not found', null, 404);
    return ok(res, 'Address updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const deleteMyAddress = async (req, res, next) => {
  try {
    const affected = await UserAddressModel.softDelete(req.params.id, req.user.id);
    if (!affected) return fail(res, 'Address not found', null, 404);
    return ok(res, 'Address deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress
};
