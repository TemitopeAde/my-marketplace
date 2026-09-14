import type { DataCollection } from '@wix/astro/builders'

export const collectionIdSuffix = 'conversations';

export default {
  idSuffix: collectionIdSuffix,
  displayName: 'conversations',
  fields: [
    {
      type: 'TEXT',
      displayName: 'Title',
      key: 'title',
    },
    {
      type: 'IMAGE',
      displayName: 'Image',
      key: 'image',
    },
  ],
  displayField: 'title',
  dataPermissions: {
    itemInsert: 'CMS_EDITOR',
    itemRead: 'CMS_EDITOR',
    itemRemove: 'CMS_EDITOR',
    itemUpdate: 'CMS_EDITOR',
  },
  indexes: [],
  initialData: [],
} satisfies DataCollection;
