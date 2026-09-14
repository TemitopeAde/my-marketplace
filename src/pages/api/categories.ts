import type { APIRoute } from 'astro';
import { COLLECTIONS, elevatedQuery, handleError, json } from '../../lib/server';
export const GET: APIRoute = async () => { try { const result = await elevatedQuery(COLLECTIONS.categories, { filter: { enabled: true }, sort: [{ fieldName: 'sortOrder', order: 'ASC' }], paging: { limit: 200 } }); return json({ categories: result.items }); } catch (error) { return handleError(error); } };
