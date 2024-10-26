import { UsersCollection } from '../db/models/users.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { SessionCollection } from '../db/models/sessions.js';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'User with this email is already exist');
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User with this email is not found');
  const isValid = await bcrypt.compare(payload.password, user.password);
  if (!isValid) throw createHttpError(401, 'Invalid password');
  await SessionCollection.deleteOne({ userId: user._id });
  return SessionCollection.create({
    userId: user._id,
    accessToken: randomBytes(30).toString('base64'),
    refreshToken: randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) throw createHttpError(401, 'Session not found');
  const isValid = new Date() < session.refreshTokenValidUntil;
  if (!isValid) throw createHttpError(401, 'Session token expired');
  await SessionCollection.deleteOne({ _id: sessionId, refreshToken });
  return SessionCollection.create({
    userId: session.userId,
    accessToken: randomBytes(30).toString('base64'),
    refreshToken: randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 25 * 60 * 60 * 1000),
  });
};
