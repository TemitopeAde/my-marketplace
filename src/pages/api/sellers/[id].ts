import type { APIRoute } from 'astro';
import { COLLECTIONS, elevatedQuery, handleError, json } from '../../../lib/server';
export const GET: APIRoute = async ({ params }) => { try { const result = await elevatedQuery(COLLECTIONS.profiles, { filter: { memberId: params.id ?? '' }, paging: { limit: 1 } }); const profile = result.items[0]; return profile ? json({ profile }) : json({ error: 'Seller not found' }, 404); } catch (error) { return handleError(error); } };
