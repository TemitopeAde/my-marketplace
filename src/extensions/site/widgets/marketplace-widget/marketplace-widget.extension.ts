import { extensions } from '@wix/astro/builders'

export default extensions.customElement({
  id: '8aa026fb-1d57-480b-a76f-1e2b8de0b8ff',
  name: 'Marketplace Widget',
  width: {
    defaultWidth: 450,
    allowStretch: true
  },
  height: {
    defaultHeight: 250
  },
  installation: {
    autoAdd: true
  },
  presets: [
    {
      id: 'e706682a-cef1-4ec6-96a5-1565614c1c10',
      name: 'default',
      thumbnailUrl: '{{BASE_URL}}/marketplace-widget-thumbnail.png',
    },
  ],
  
  tagName: 'marketplace-widget',
  element: './extensions/site/widgets/marketplace-widget/marketplace-widget.tsx',
  settings: './extensions/site/widgets/marketplace-widget/marketplace-widget.panel.tsx',
});
