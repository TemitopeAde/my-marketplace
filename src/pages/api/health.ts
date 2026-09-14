import type { APIRoute } from 'astro';
import { json } from '../../lib/server';
export const GET: APIRoute = async () => json({ ok: true, service: 'marketplace' });
