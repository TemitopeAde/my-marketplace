import { httpClient } from '@wix/essentials';
import { location } from '@wix/site-location';
import styles from './marketplace-widget.module.css';

type Listing = { _id?: string; title?: string; price?: number; currency?: string; city?: string; coverImage?: string; images?: string[] };
const escapeHtml = (value: string) => value.replace(/[&<>'\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);

class MarketplaceWidget extends HTMLElement {
  connectedCallback() { void this.render(); }
  async render() {
    this.innerHTML = `<section class="${styles.root}"><div class="${styles.header}"><input class="${styles.search}" aria-label="Search listings" placeholder="Search listings"/><button class="${styles.button}">Search</button></div><div class="${styles.state}">Loading listings…</div></section>`;
    const root = this.firstElementChild as HTMLElement | null;
    if (!root) return;
    const load = async () => {
      const input = root.querySelector('input');
      const search = input instanceof HTMLInputElement ? input.value : '';
      try {
        const url = new URL('/api/listings', import.meta.url); url.searchParams.set('limit', '12'); if (search) url.searchParams.set('search', search);
        const response = await httpClient.fetchWithAuth(url.href); if (!response.ok) throw new Error(`Listings request failed: ${response.status}`);
        const data = await response.json() as { listings?: Listing[] }, listings = data.listings ?? [];
        const content = listings.length ? listings.map((item) => {
          const listingId = item._id ?? '';
          return `<button class="${styles.card}" type="button" data-listing-id="${escapeHtml(listingId)}"><img loading="lazy" src="${escapeHtml(item.coverImage ?? item.images?.[0] ?? '')}" alt="${escapeHtml(item.title ?? 'Listing image')}"/><div class="${styles.body}"><p class="${styles.title}">${escapeHtml(item.title ?? 'Untitled listing')}</p><span class="${styles.price}">${new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency ?? 'USD' }).format(item.price ?? 0)}</span><p class="${styles.muted}">${escapeHtml(item.city ?? '')}</p></div></button>`;
        }).join('') : `<div class="${styles.state}">No listings found.</div>`;
        root.innerHTML = `<div class="${styles.header}"><input class="${styles.search}" aria-label="Search listings" placeholder="Search listings" value="${escapeHtml(search)}"/><button class="${styles.button}">Search</button></div><div class="${styles.grid}">${content}</div>`;
        root.querySelector('button')?.addEventListener('click', () => void load());
        root.querySelectorAll<HTMLElement>('[data-listing-id]').forEach((card) => {
          card.addEventListener('click', () => {
            const listingId = card.dataset.listingId;
            if (listingId) void location.to(`/listing/${encodeURIComponent(listingId)}`);
          });
        });
      } catch (error) { console.error(error); root.innerHTML = `<div class="${styles.state}">Listings are temporarily unavailable.</div>`; }
    };
    root.querySelector('button')?.addEventListener('click', () => void load()); await load();
  }
}

export default MarketplaceWidget;
