import type { APIRoute } from 'astro';
import { COLLECTIONS, cleanText, currentMemberId, elevatedGet, elevatedRemove, elevatedUpdate, handleError, json, validateListing } from '../../../lib/server';
import type { ListingInput } from '../../../lib/types';

export const GET: APIRoute = async ({ params }) => { try { const listing = await elevatedGet(COLLECTIONS.listings, params.id ?? ''); return listing ? json({ listing }) : json({ error: 'Listing not found' }, 404); } catch (error) { return handleError(error); } };
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const memberId = await currentMemberId(), id = params.id ?? '', existing = await elevatedGet(COLLECTIONS.listings, id) as (ListingInput & { _id: string; sellerId: string }) | null;
    if (!existing) return json({ error: 'Listing not found' }, 404); if (existing.sellerId !== memberId) return json({ error: 'You do not own this listing' }, 403);
    const body = await request.json() as Partial<ListingInput>, merged = { ...existing, ...body }, validationError = validateListing(merged);
    if (validationError) return json({ error: validationError }, 400);
    return json({ listing: await elevatedUpdate(COLLECTIONS.listings, { ...merged, _id: id, sellerId: memberId, updatedAt: new Date() }) });
  } catch (error) { return handleError(error); }
};
export const DELETE: APIRoute = async ({ params }) => { try { const memberId = await currentMemberId(), id = cleanText(params.id, 100), existing = await elevatedGet(COLLECTIONS.listings, id) as { sellerId?: string } | null; if (!existing) return json({ error: 'Listing not found' }, 404); if (existing.sellerId !== memberId) return json({ error: 'You do not own this listing' }, 403); await elevatedRemove(COLLECTIONS.listings, id); return json({ ok: true }); } catch (error) { return handleError(error); } };
