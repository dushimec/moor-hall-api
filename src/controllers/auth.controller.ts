import { Request, Response } from 'express';
import authService from '../services/auth.service';
import apiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';
import { registerSchema, loginSchema, changePasswordSchema, refreshTokenSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema } from '../types/auth.types';

const setAuthCookies = (res: Response, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' as const : 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('refreshToken');
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(apiResponse.badRequest('Validation failed', errors));
  }

  const result = await authService.register(validation.data);

  setAuthCookies(res, result.tokens.refreshToken);

  res.status(201).json(apiResponse.created(
    { admin: result.admin, token: result.tokens.accessToken },
    'Registration successful'
  ));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(apiResponse.badRequest('Validation failed', errors));
  }

  const result = await authService.login(validation.data);

  setAuthCookies(res, result.tokens.refreshToken);

  res.status(200).json(apiResponse.success(
    { admin: result.admin, token: result.tokens.accessToken },
    'Login successful'
  ));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  let refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json(apiResponse.unauthorized('Refresh token is required'));
  }

  const validation = refreshTokenSchema.safeParse({ refreshToken });

  if (!validation.success) {
    return res.status(400).json(apiResponse.badRequest('Invalid refresh token'));
  }

  const tokens = await authService.refresh(refreshToken);

  setAuthCookies(res, tokens.refreshToken);

  res.status(200).json(apiResponse.success(tokens, 'Token refreshed successfully'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (userId) {
    await authService.logout(userId);
  }

  clearAuthCookies(res);

  res.status(200).json(apiResponse.success(null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(apiResponse.unauthorized('Not authenticated'));
  }

  const admin = await authService.getCurrentAdmin(userId);

  res.status(200).json(apiResponse.success(admin, 'Admin retrieved successfully'));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(apiResponse.unauthorized('Not authenticated'));
  }

  const validation = changePasswordSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(apiResponse.badRequest('Validation failed', errors));
  }

  await authService.changePassword(userId, validation.data);

  res.status(200).json(apiResponse.success(null, 'Password changed successfully'));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(apiResponse.unauthorized('Not authenticated'));
  }

  const validation = updateProfileSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(apiResponse.badRequest('Validation failed', errors));
  }

  const admin = await authService.updateProfile(userId, validation.data);

  res.status(200).json(apiResponse.success(admin, 'Profile updated successfully'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const validation = forgotPasswordSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(apiResponse.badRequest('Validation failed', errors));
  }

  await authService.forgotPassword(validation.data);

  res.status(200).json(apiResponse.success(null, 'Password reset instructions sent to email'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const validation = resetPasswordSchema.safeParse(req.body);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(apiResponse.badRequest('Validation failed', errors));
  }

  await authService.resetPassword(validation.data);

  res.status(200).json(apiResponse.success(null, 'Password reset successfully'));
});

export const suspendAdmin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const targetAdminId = parseInt(String(req.params.id));

  if (!userId) {
    return res.status(401).json(apiResponse.unauthorized('Not authenticated'));
  }

  if (isNaN(targetAdminId)) {
    return res.status(400).json(apiResponse.badRequest('Invalid admin ID'));
  }

  if (userId === targetAdminId) {
    return res.status(400).json(apiResponse.badRequest('Cannot suspend yourself'));
  }

  const admin = await authService.suspendAdmin(targetAdminId);

  res.status(200).json(apiResponse.success(admin, 'Admin suspended successfully'));
});

export const activateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const targetAdminId = parseInt(String(req.params.id));

  if (!userId) {
    return res.status(401).json(apiResponse.unauthorized('Not authenticated'));
  }

  if (isNaN(targetAdminId)) {
    return res.status(400).json(apiResponse.badRequest('Invalid admin ID'));
  }

  const admin = await authService.activateAdmin(targetAdminId);

  res.status(200).json(apiResponse.success(admin, 'Admin activated successfully'));
});
