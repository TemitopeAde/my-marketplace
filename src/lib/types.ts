export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SOLD' | 'ARCHIVED' | 'REJECTED';
export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS';

export interface ListingInput {
  title: string; description: string; price: number; currency: string;
  categoryId: string; subcategoryId?: string; condition: ListingCondition;
  location: string; city: string; country: string; images: string[]; coverImage?: string;
}

export interface Listing extends ListingInput {
  _id: string; sellerId: string; sellerName: string; status: ListingStatus;
  views: number; favoriteCount: number; messageCount: number;
  _createdDate?: string; _updatedDate?: string;
}

export interface ApiError { error: string; code?: string }
