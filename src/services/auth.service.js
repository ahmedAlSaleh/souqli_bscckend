const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const register = async ({ full_name, email, phone, password }) => {
  const emailValue = email && String(email).trim();
  const phoneValue = phone && String(phone).trim();

  if (!emailValue && !phoneValue) {
    throw { status: 400, message: 'Email or phone is required' };
  }

  if (emailValue) {
    const existingEmail = await UserModel.findByEmail(emailValue);
    if (existingEmail) {
      throw { status: 409, message: 'Email already registered' };
    }
  }

  if (phoneValue) {
    const existingPhone = await UserModel.findByPhone(phoneValue);
    if (existingPhone) {
      throw { status: 409, message: 'Phone already registered' };
    }
  }

  const password_hash = await bcrypt.hash(password, 10);
  const userId = await UserModel.create({
    full_name,
    email: emailValue || null,
    phone: phoneValue || null,
    password_hash
  });

  const token = jwt.sign(
    { id: userId, email: emailValue || null, phone: phoneValue || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: { id: userId, full_name, email: emailValue || null, phone: phoneValue || null }
  };
};

const login = async (identifier, password) => {
  if (!identifier) {
    throw { status: 400, message: 'Email or phone is required' };
  }
  const user = await UserModel.findByEmailOrPhone(identifier);
  if (!user || user.deleted_at || !user.is_active) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { token, user };
};

const updateProfile = async (userId, data) => {
  const updates = {};

  if (data.full_name !== undefined) {
    updates.full_name = data.full_name;
  }
  if (data.email !== undefined) {
    updates.email = data.email;
  }
  if (data.phone !== undefined) {
    updates.phone = data.phone;
  }
  if (data.password !== undefined) {
    updates.password_hash = await bcrypt.hash(data.password, 10);
  }

  if (updates.email) {
    const existing = await UserModel.findByEmailExcludingId(updates.email, userId);
    if (existing) throw { status: 409, message: 'Email already registered' };
  }
  if (updates.phone) {
    const existing = await UserModel.findByPhoneExcludingId(updates.phone, userId);
    if (existing) throw { status: 409, message: 'Phone already registered' };
  }

  const changed = await UserModel.updateSelf(userId, updates);
  return changed;
};

module.exports = { register, login, updateProfile };
