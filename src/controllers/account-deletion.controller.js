const path = require('path');
const AccountDeletionRequestModel = require('../models/account-deletion-request.model');
const { ok, fail } = require('../utils/response');

const renderPage = (req, res) => {
  return res.sendFile(path.join(__dirname, '..', '..', 'public', 'account-deletion.html'));
};

const createRequest = async (req, res, next) => {
  try {
    const full_name = String(req.body.full_name || '').trim();
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
    const phone = req.body.phone ? String(req.body.phone).trim() : null;
    const reason = String(req.body.reason || '').trim();
    const source = req.body.source ? String(req.body.source).trim() : 'play_store_form';

    if (!email && !phone) {
      return fail(res, 'Email or phone is required', null, 422);
    }

    const id = await AccountDeletionRequestModel.create({
      full_name,
      email,
      phone,
      reason,
      source
    });

    return ok(res, 'Deletion request submitted successfully', { id }, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  renderPage,
  createRequest
};
