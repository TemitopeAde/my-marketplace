import { auth } from '@wix/essentials';
import { items } from '@wix/data';
import { members as membersApi } from '@wix/members';

export const COLLECTIONS = {
  listings: '@admin14744/my-marketplace/listings', categories: '@admin14744/my-marketplace/categories',
  profiles: '@admin14744/my-marketplace/seller-profiles', favorites: '@admin14744/my-marketplace/favorites',
  conversations: '@admin14744/my-marketplace/conversations', messages: '@admin14744/my-marketplace/messages',
  reports: '@admin14744/my-marketplace/reports', settings: '@admin14744/my-marketplace/marketplace-settings',
  translations: '@admin14744/my-marketplace/translations',
} as const;

export async function currentMemberId(): Promise<string> {
  const result = await membersApi.getCurrentMember();
  const id = result.member?._id;
  if (!id) throw new Error('AUTH_REQUIRED');
  return id;
}

export const elevatedQuery = auth.elevate(items.query);
export const elevatedGet = auth.elevate(items.get);
export const elevatedInsert = auth.elevate(items.insert);
export const elevatedUpdate = auth.elevate(items.update);
export const elevatedRemove = auth.elevate(items.remove);

export function json(data: unknown, status = 200): Response { return Response.json(data, { status }); }
export function handleError(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  if (message === 'AUTH_REQUIRED') return json({ error: 'Authentication required' }, 401);
  console.error(error); return json({ error: 'Unexpected server error' }, 500);
}
export function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, max) : '';
}
export function validateListing(input: Partial<import('./types').ListingInput>): string | null {
  if (!cleanText(input.title, 120)) return 'Title is required';
  if (!cleanText(input.description, 5000)) return 'Description is required';
  if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0) return 'Price is invalid';
  if (!cleanText(input.currency, 3)) return 'Currency is required';
  if (!cleanText(input.categoryId, 100)) return 'Category is required';
  if (!cleanText(input.city, 100) || !cleanText(input.country, 100)) return 'Location is required';
  if (!Array.isArray(input.images) || input.images.length < 1 || input.images.length > 12) return 'Add between 1 and 12 images';
  return null;
}
