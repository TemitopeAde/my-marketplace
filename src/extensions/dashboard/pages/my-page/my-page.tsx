import { useEffect, useState } from 'react';
import { httpClient } from '@wix/essentials';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import '@/styles/global.css';
import '@wix/design-system/styles.global.css';

type Listing = { _id?: string; title?: string; price?: number; currency?: string; status?: string; city?: string; views?: number; favoriteCount?: number };
type ListingResponse = { listings?: Listing[] };

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    httpClient.fetchWithAuth(`${new URL('/api/listings', import.meta.url).href}?limit=50`).then(async (response) => {
      if (!response.ok) throw new Error('Unable to load listings');
      const data = await response.json() as ListingResponse;
      if (active) setListings(data.listings ?? []);
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load listings'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const activeCount = listings.filter((item) => item.status === 'ACTIVE').length;
  const soldCount = listings.filter((item) => item.status === 'SOLD').length;
  const views = listings.reduce((sum, item) => sum + (item.views ?? 0), 0);
  const favorites = listings.reduce((sum, item) => sum + (item.favoriteCount ?? 0), 0);
  return <main className="min-h-screen bg-muted/40 px-5 py-8 text-foreground sm:px-8"><div className="mx-auto max-w-7xl space-y-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="font-heading text-3xl font-semibold tracking-tight">Marketplace</h1><p className="mt-1 text-sm text-muted-foreground">Manage listings, conversations, and marketplace settings.</p></div><div className="flex gap-2"><Button type="button" variant="outline">Settings</Button><Button type="button">Create listing</Button></div></header>
    <section aria-label="Marketplace summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Active listings" value={activeCount} /><Stat label="Sold listings" value={soldCount} /><Stat label="Total views" value={views} /><Stat label="Favorites" value={favorites} /><Stat label="Messages" value="—" /></section>
    <Card><CardHeader className="flex flex-row items-center justify-between border-b"><CardTitle>My listings</CardTitle><Button type="button" variant="ghost" size="sm">View all</Button></CardHeader><CardContent className="p-0">{error ? <p className="p-6 text-sm text-destructive" role="alert">{error}</p> : loading ? <p className="p-6 text-sm text-muted-foreground">Loading listings…</p> : listings.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No listings yet. Create your first listing to get started.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr className="border-b">{['Title', 'Price', 'Status', 'Location', 'Views', 'Actions'].map((heading) => <th className="px-6 py-3 text-left font-medium" key={heading}>{heading}</th>)}</tr></thead><tbody>{listings.slice(0, 10).map((listing) => <tr className="border-b last:border-0" key={listing._id}><td className="px-6 py-4 font-medium">{listing.title ?? 'Untitled'}</td><td className="px-6 py-4">{new Intl.NumberFormat(undefined, { style: 'currency', currency: listing.currency ?? 'USD' }).format(listing.price ?? 0)}</td><td className="px-6 py-4"><Badge variant="secondary">{listing.status ?? 'DRAFT'}</Badge></td><td className="px-6 py-4 text-muted-foreground">{listing.city ?? '—'}</td><td className="px-6 py-4">{listing.views ?? 0}</td><td className="px-6 py-4"><Button type="button" variant="ghost" size="sm">Edit</Button></td></tr>)}</tbody></table></div>}</CardContent></Card>
  </div></main>;
}

function Stat({ label, value }: { label: string; value: number | string }) { return <Card><CardContent className="p-5"><span className="text-sm text-muted-foreground">{label}</span><strong className="mt-2 block text-2xl font-semibold tracking-tight">{value}</strong></CardContent></Card>; }

