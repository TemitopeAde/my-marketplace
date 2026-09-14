import { httpClient } from '@wix/essentials';
import { location } from '@wix/site-location';
import styles from './listing-detail-widget.module.css';

type Listing = {
  _id?: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categoryId?: string;
  condition?: string;
  location?: string;
  city?: string;
  country?: string;
  sellerName?: string;
  coverImage?: string;
  images?: string[];
};

type ListingResponse = { listing?: Listing; error?: string };
type FavoritesResponse = { favorites?: Array<{ listingId?: string }> };
type ConversationResponse = { conversation?: { _id?: string }; error?: string };

const escapeHtml = (value: string) => value.replace(/[&<>'\"]/g, (character) => ({ '&': '&#38;', '<': '&#60;', '>': '&#62;', "'": '&#39;', '"': '&#34;' })[character] ?? character);

const readableValue = (value?: string) => value ? value.replace(/[_-]/g, ' ').toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()) : 'Not specified';

const formatPrice = (listing: Listing) => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: listing.currency ?? 'USD',
}).format(listing.price ?? 0);

const getListingId = async (): Promise<string | null> => {
  const path = await location.path();
  const segments = path.map((segment) => segment.trim()).filter(Boolean);
  if (segments.length !== 2 || segments[0].toLowerCase() !== 'listing') return null;
  try {
    const listingId = decodeURIComponent(segments[1]);
    return listingId || null;
  } catch {
    return null;
  }
};

class ListingDetailWidget extends HTMLElement {
  connectedCallback() { void this.render(); }

  async render() {
    this.innerHTML = `<section class="${styles.root}"><div class="${styles.state}">Loading listing…</div></section>`;
    const root = this.firstElementChild as HTMLElement | null;
    if (!root) return;

    try {
      const listingId = await getListingId();
      if (!listingId) {
        root.innerHTML = `<div class="${styles.state}" role="alert">A valid listing URL is required.</div>`;
        return;
      }

      const listingUrl = new URL(`/api/listings/${encodeURIComponent(listingId)}`, import.meta.url);
      const favoritesUrl = new URL('/api/favorites', import.meta.url);
      const [listingResponse, favoritesResponse] = await Promise.all([
        httpClient.fetchWithAuth(listingUrl.href),
        httpClient.fetchWithAuth(favoritesUrl.href),
      ]);

      if (!listingResponse.ok) {
        root.innerHTML = `<div class="${styles.state}" role="alert">${listingResponse.status === 404 ? 'Listing not found.' : 'This listing is temporarily unavailable.'}</div>`;
        return;
      }

      const listingData = await listingResponse.json() as ListingResponse;
      const listing = listingData.listing;
      if (!listing) {
        root.innerHTML = `<div class="${styles.state}" role="alert">Listing not found.</div>`;
        return;
      }

      const favoritesData = favoritesResponse.ok ? await favoritesResponse.json() as FavoritesResponse : { favorites: [] };
      const isFavorite = favoritesData.favorites?.some((favorite) => favorite.listingId === listingId) ?? false;
      const images = [listing.coverImage, ...(listing.images ?? [])].filter((image, index, all): image is string => Boolean(image) && all.indexOf(image) === index);
      const gallery = images.length
        ? images.map((image, index) => `<img class="${styles.image}" src="${escapeHtml(image)}" alt="${escapeHtml(listing.title ?? 'Listing image')} ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}"/>`).join('')
        : `<div class="${styles.imagePlaceholder}">No images available</div>`;

      root.innerHTML = `
        <a class="${styles.back}" href="/" data-back-link>← Back to marketplace</a>
        <article class="${styles.card}">
          <div class="${styles.gallery}" aria-label="Listing images">${gallery}</div>
          <div class="${styles.content}">
            <div class="${styles.heading}">
              <div><p class="${styles.eyebrow}">${escapeHtml(readableValue(listing.condition))}</p><h1 class="${styles.title}">${escapeHtml(listing.title ?? 'Untitled listing')}</h1></div>
              <p class="${styles.price}">${escapeHtml(formatPrice(listing))}</p>
            </div>
            <p class="${styles.location}">${escapeHtml(listing.location ?? ([listing.city, listing.country].filter(Boolean).join(', ') || 'Location not specified'))}</p>
            <div class="${styles.actions}"><button class="${styles.secondaryButton}" type="button" data-favorite>${isFavorite ? '♥ Saved' : '♡ Save'}</button><button class="${styles.primaryButton}" type="button" data-contact>Contact Seller</button></div>
            <dl class="${styles.metadata}"><div><dt>Category</dt><dd>${escapeHtml(readableValue(listing.categoryId))}</dd></div><div><dt>Seller</dt><dd>${escapeHtml(listing.sellerName ?? 'Member')}</dd></div></dl>
            <div class="${styles.description}"><h2>Description</h2><p>${escapeHtml(listing.description ?? 'No description provided.')}</p></div>
            <p class="${styles.feedback}" role="status" aria-live="polite" data-feedback></p>
          </div>
        </article>`;

      root.querySelector('[data-back-link]')?.addEventListener('click', (event) => {
        event.preventDefault();
        void location.to('/');
      });

      const favoriteButton = root.querySelector<HTMLButtonElement>('[data-favorite]');
      let favoriteState = isFavorite;
      favoriteButton?.addEventListener('click', () => {
        void this.toggleFavorite(favoriteButton, listingId, favoriteState, root).then((updated) => {
          if (updated) favoriteState = !favoriteState;
        });
      });
      root.querySelector<HTMLButtonElement>('[data-contact]')?.addEventListener('click', (event) => void this.contactSeller(event.currentTarget as HTMLButtonElement, listingId, root));
    } catch (error) {
      console.error(error);
      root.innerHTML = `<div class="${styles.state}" role="alert">This listing is temporarily unavailable.</div>`;
    }
  }

  async toggleFavorite(button: HTMLButtonElement, listingId: string, isFavorite: boolean, root: HTMLElement): Promise<boolean> {
    button.disabled = true;
    try {
      const response = await httpClient.fetchWithAuth('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      if (response.status === 401) throw new Error('Sign in to save listings.');
      if (!response.ok) throw new Error('Unable to update saved listings.');
      button.textContent = isFavorite ? '♡ Save' : '♥ Saved';
      button.disabled = false;
      return true;
    } catch (error) {
      const feedback = root.querySelector<HTMLElement>('[data-feedback]');
      if (feedback) feedback.textContent = error instanceof Error ? error.message : 'Unable to update saved listings.';
      button.disabled = false;
      return false;
    }
  }

  async contactSeller(button: HTMLButtonElement, listingId: string, root: HTMLElement) {
    button.disabled = true;
    try {
      const response = await httpClient.fetchWithAuth('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      const data = await response.json() as ConversationResponse;
      if (response.status === 401) throw new Error('Sign in to contact the seller.');
      if (!response.ok) throw new Error(data.error ?? 'Unable to contact the seller.');
      const feedback = root.querySelector<HTMLElement>('[data-feedback]');
      if (feedback) feedback.textContent = data.conversation?._id ? 'Conversation started. You can continue from your messages.' : 'Conversation is ready in your messages.';
    } catch (error) {
      const feedback = root.querySelector<HTMLElement>('[data-feedback]');
      if (feedback) feedback.textContent = error instanceof Error ? error.message : 'Unable to contact the seller.';
    } finally {
      button.disabled = false;
    }
  }
}

export default ListingDetailWidget;
