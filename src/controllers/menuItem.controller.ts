import { Request, Response } from 'express';
import menuItemService from '../services/menuItem.service';
import apiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuItemService.createMenuItem(req.body);
  return res.status(201).json(apiResponse.created(menuItem, 'Menu item created successfully'));
});

export const getMenuItems = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
  const includeUnavailable = req.query.includeUnavailable === 'true';
  const menuItems = await menuItemService.getMenuItems(categoryId, includeUnavailable);
  return res.json(apiResponse.success(menuItems, 'Menu items retrieved successfully'));
});

export const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const menuItem = await menuItemService.getMenuItemById(id);
  return res.json(apiResponse.success(menuItem, 'Menu item retrieved successfully'));
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const menuItem = await menuItemService.updateMenuItem(id, req.body);
  return res.json(apiResponse.success(menuItem, 'Menu item updated successfully'));
});

export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const menuItem = await menuItemService.toggleAvailability(id);
  return res.json(apiResponse.success(menuItem, 'Menu item availability toggled successfully'));
});

export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  await menuItemService.deleteMenuItem(id);
  return res.json(apiResponse.success(null, 'Menu item deleted successfully'));
});

export default { createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, toggleAvailability, deleteMenuItem };
