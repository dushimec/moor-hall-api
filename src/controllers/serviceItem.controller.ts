import { Request, Response } from 'express';
import serviceItemService from '../services/serviceItem.service';
import apiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

export const createServiceItem = asyncHandler(async (req: Request, res: Response) => {
  const serviceItem = await serviceItemService.createServiceItem(req.body);
  return res.status(201).json(apiResponse.created(serviceItem, 'Service item created successfully'));
});

export const getServiceItems = asyncHandler(async (req: Request, res: Response) => {
  const serviceItems = await serviceItemService.getServiceItems();
  return res.json(apiResponse.success(serviceItems, 'Service items retrieved successfully'));
});

export const getServiceItemById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const serviceItem = await serviceItemService.getServiceItemById(id);
  return res.json(apiResponse.success(serviceItem, 'Service item retrieved successfully'));
});

export const updateServiceItem = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const serviceItem = await serviceItemService.updateServiceItem(id, req.body);
  return res.json(apiResponse.success(serviceItem, 'Service item updated successfully'));
});

export const deleteServiceItem = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  await serviceItemService.deleteServiceItem(id);
  return res.json(apiResponse.success(null, 'Service item deleted successfully'));
});

export default {
  createServiceItem,
  getServiceItems,
  getServiceItemById,
  updateServiceItem,
  deleteServiceItem,
};
