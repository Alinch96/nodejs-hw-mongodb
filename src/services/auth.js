import { UsersCollection } from '../db/models/users.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { SessionCollection } from '../db/models/sessions.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

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

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User with this email not found');
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    { expiresIn: '5m' },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );
  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });
  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ password, token }) => {
  try {
    const decoded = jwt.verify(token, env('JWT_SECRET'));
    const user = await UsersCollection.findOne({
      _id: decoded.sub,
      email: decoded.email,
    });
    if (!user) throw createHttpError(404, 'User not found');
    const encryptedPassword = await bcrypt.hash(password, 10);
    await UsersCollection.updateOne(
      { _id: user._id },
      { password: encryptedPassword },
    );
    await SessionCollection.deleteOne({ userId: user._id });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw error;
  }
};
