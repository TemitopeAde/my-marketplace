import { extensions } from '@wix/astro/builders'

import listingsCollection from './listings';

import categoriesCollection from './categories';

import sellerProfilesCollection from './seller-profiles';

import favoritesCollection from './favorites';

import conversationsCollection from './conversations';

import messagesCollection from './messages';

import reportsCollection from './reports';

import marketplaceSettingsCollection from './marketplace-settings';

import translationsCollection from './translations';

export default extensions.dataCollections({
  id: 'aab01451-1812-4fee-accf-f57aa3a124b1',
  name: 'Data Collections',
  collections: [
    listingsCollection,
    categoriesCollection,
    sellerProfilesCollection,
    favoritesCollection,
    conversationsCollection,
    messagesCollection,
    reportsCollection,
    marketplaceSettingsCollection,
    translationsCollection
  ],
});
