import type { APIRoute } from 'astro';
import { auth } from '@wix/essentials';
import { files } from '@wix/media';
import { currentMemberId, handleError, json } from '../../lib/server';
const elevatedUpload = auth.elevate(files.generateFileUploadUrl);
export const POST: APIRoute = async ({ request }) => { try { await currentMemberId(); const body = await request.json() as { fileName?: string; mimeType?: string }; if (!body.fileName || !body.mimeType?.startsWith('image/')) return json({ error: 'A valid image file is required' }, 400); const result = await elevatedUpload(body.mimeType, { fileName: body.fileName.slice(0, 180), private: false, labels: ['marketplace-listing'] }); return json({ uploadUrl: result.uploadUrl }); } catch (error) { return handleError(error); } };
