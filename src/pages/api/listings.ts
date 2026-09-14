import type { APIRoute } from 'astro';
import { COLLECTIONS, cleanText, currentMemberId, elevatedInsert, elevatedQuery, handleError, json, validateListing } from '../../lib/server';
import type { ListingInput } from '../../lib/types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = cleanText(url.searchParams.get('search'), 100), categoryId = cleanText(url.searchParams.get('categoryId'), 100), city = cleanText(url.searchParams.get('city'), 100);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 24), 1), 50), offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);
    const sort = url.searchParams.get('sort') ?? 'newest', sortField = sort === 'priceAsc' || sort === 'priceDesc' ? 'price' : sort === 'popular' ? 'views' : '_createdDate', sortOrder = sort === 'priceAsc' || sort === 'newest' || sort === 'popular' ? 'ASC' : 'DESC';
    const and: Record<string, unknown>[] = [{ status: 'ACTIVE' }];
    if (categoryId) and.push({ categoryId }); if (city) and.push({ city: { $contains: city } });
    if (search) and.push({ $or: [{ title: { $contains: search } }, { description: { $contains: search } }, { location: { $contains: search } }] });
    const result = await elevatedQuery(COLLECTIONS.listings, { filter: { $and: and }, sort: [{ fieldName: sortField, order: sortOrder }], paging: { limit, offset } });
    return json({ listings: result.items, pagingMetadata: result.pagingMetadata });
  } catch (error) { return handleError(error); }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const memberId = await currentMemberId(), body = await request.json() as Partial<ListingInput>, validationError = validateListing(body);
    if (validationError) return json({ error: validationError }, 400);
    const now = new Date(), listing = await elevatedInsert(COLLECTIONS.listings, { ...body, sellerId: memberId, sellerName: 'Member', status: 'PENDING', views: 0, favoriteCount: 0, messageCount: 0, publishedAt: null, createdAt: now, updatedAt: now });
    return json({ listing }, 201);
  } catch (error) { return handleError(error); }
};
