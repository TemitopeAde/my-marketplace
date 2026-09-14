import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import dataCollections from './extensions/backend/data-collections/data-collections.extension.ts';

import marketplaceWidget from './extensions/site/widgets/marketplace-widget/marketplace-widget.extension.ts';

import listingDetailWidget from './extensions/site/widgets/listing-detail-widget/listing-detail-widget.extension.ts';

export default app()
  .use(myPage).use(dataCollections).use(marketplaceWidget).use(listingDetailWidget);
