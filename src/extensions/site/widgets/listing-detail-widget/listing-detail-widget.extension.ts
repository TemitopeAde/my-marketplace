import { extensions } from '@wix/astro/builders'

export default extensions.customElement({
  id: '32472699-2386-4d54-92a9-4bb61c56f356',
  name: 'Listing Detail Widget',
  width: {
    defaultWidth: 450,
    allowStretch: true
  },
  height: {
    defaultHeight: 250
  },
  installation: {
    autoAdd: false
  },
  presets: [
    {
      id: '1220c700-a005-49af-b90b-4dc3dc0b1db0',
      name: 'default',
      thumbnailUrl: '{{BASE_URL}}/listing-detail-widget-thumbnail.png',
    },
  ],
  
  tagName: 'listing-detail-widget',
  element: './extensions/site/widgets/listing-detail-widget/listing-detail-widget.tsx',
  settings: './extensions/site/widgets/listing-detail-widget/listing-detail-widget.panel.tsx',
});
