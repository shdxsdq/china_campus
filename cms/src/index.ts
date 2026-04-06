import type { Core } from '@strapi/strapi';

import { demoSeed } from './seed/demo-content';

type ContentManagerEditMetadata = {
  label?: string;
  description?: string;
  placeholder?: string;
  visible?: boolean;
  editable?: boolean;
  mainField?: string;
};

type ContentManagerListMetadata = {
  label?: string;
  searchable?: boolean;
  sortable?: boolean;
};

type ContentManagerMetadata = {
  edit?: ContentManagerEditMetadata;
  list?: ContentManagerListMetadata;
};

type ContentManagerLayoutField = {
  name: string;
  size: number;
};

type ContentManagerConfiguration = {
  settings: Record<string, unknown>;
  metadatas: Record<string, ContentManagerMetadata>;
  layouts: {
    list: string[];
    edit: ContentManagerLayoutField[][];
  };
};

type ContentManagerContentTypeService = {
  findConfiguration: (
    contentType: unknown,
  ) => Promise<ContentManagerConfiguration & { uid: string }>;
  updateConfiguration: (
    contentType: unknown,
    configuration: ContentManagerConfiguration,
  ) => Promise<unknown>;
};

type ContentManagerComponentService = {
  findConfiguration: (
    component: unknown,
  ) => Promise<ContentManagerConfiguration & { uid: string; category: string }>;
  updateConfiguration: (
    component: unknown,
    configuration: ContentManagerConfiguration,
  ) => Promise<unknown>;
};

const IMAGE_URL_PATTERN = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i;

const seedCollection = async (
  strapi: Core.Strapi,
  uid: string,
  items: Record<string, unknown>[],
) => {
  const count = await strapi.db.query(uid).count();
  if (count > 0) {
    return;
  }

  for (const item of items) {
    await strapi.db.query(uid).create({ data: item });
  }
};

const toBlocksBody = (paragraphs: string[]) =>
  paragraphs
    .filter((paragraph) => paragraph.trim().length > 0)
    .map((paragraph) => ({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: paragraph,
        },
      ],
    }));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isBlocksBody = (value: unknown) =>
  Array.isArray(value) &&
  value.some((item) => isRecord(item) && typeof item.type === 'string');

const hasContentSections = (value: unknown) =>
  Array.isArray(value) &&
  value.some(
    (item) => isRecord(item) && typeof item.__component === 'string',
  );

const isImageUrl = (value: string) => IMAGE_URL_PATTERN.test(value.trim());

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const extractParagraphs = (body: unknown) => {
  if (isBlocksBody(body)) {
    return [];
  }

  if (Array.isArray(body)) {
    return body
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      if (Array.isArray(parsed)) {
        return extractParagraphs(parsed);
      }
    } catch {
      return body
        .split(/\r?\n\r?\n|\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  return [];
};

const toContentSections = (body: unknown) => {
  if (isBlocksBody(body)) {
    return [
      {
        __component: 'shared.rich-text-block',
        content: body,
      },
    ];
  }

  const paragraphs = extractParagraphs(body);

  if (paragraphs.length === 0) {
    return [];
  }

  return [
    {
      __component: 'shared.rich-text-block',
      content: toBlocksBody(paragraphs),
    },
  ];
};

const getNodeText = (node: unknown): string => {
  if (!isRecord(node)) {
    return '';
  }

  if (typeof node.text === 'string') {
    return node.text;
  }

  if (Array.isArray(node.children)) {
    return node.children.map((child) => getNodeText(child)).join('');
  }

  return '';
};

const normalizeMediaUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return normalizeMediaUrl(value[0]);
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.url === 'string' && value.url.trim().length > 0) {
    return value.url.trim();
  }

  if ('data' in value) {
    return normalizeMediaUrl(value.data);
  }

  return undefined;
};

const normalizeMediaAlt = (
  value: unknown,
  fallback = '',
): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return normalizeMediaAlt(value[0], fallback);
  }

  if (!isRecord(value)) {
    return fallback || undefined;
  }

  if (
    typeof value.alternativeText === 'string' &&
    value.alternativeText.trim().length > 0
  ) {
    return value.alternativeText.trim();
  }

  if (typeof value.name === 'string' && value.name.trim().length > 0) {
    return value.name.trim();
  }

  if ('data' in value) {
    return normalizeMediaAlt(value.data, fallback);
  }

  return fallback || undefined;
};

const mediaFigureToHtml = (value: unknown, fallbackAlt = '') => {
  const url = normalizeMediaUrl(value);

  if (!url) {
    return '';
  }

  const alt = normalizeMediaAlt(value, fallbackAlt) ?? '';
  return `<figure class="image"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" /></figure>`;
};

const renderInlineNodeToHtml = (node: unknown): string => {
  if (!isRecord(node)) {
    return '';
  }

  if (typeof node.text === 'string') {
    let content = escapeHtml(node.text);

    if (node.code) {
      content = `<code>${content}</code>`;
    }

    if (node.bold) {
      content = `<strong>${content}</strong>`;
    }

    if (node.italic) {
      content = `<em>${content}</em>`;
    }

    if (node.underline) {
      content = `<u>${content}</u>`;
    }

    if (node.strikethrough) {
      content = `<s>${content}</s>`;
    }

    return content;
  }

  const children = Array.isArray(node.children)
    ? node.children.map((child) => renderInlineNodeToHtml(child)).join('')
    : '';

  if (typeof node.url === 'string') {
    const href = escapeHtml(node.url);
    const label = children || escapeHtml(node.url);

    return `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`;
  }

  return children;
};

const extractStandaloneImage = (
  children: unknown,
): { url: string; alt: string } | null => {
  if (!Array.isArray(children) || children.length === 0) {
    return null;
  }

  if (
    children.length === 1 &&
    isRecord(children[0]) &&
    typeof children[0].url === 'string' &&
    isImageUrl(children[0].url)
  ) {
    return {
      url: children[0].url.trim(),
      alt: getNodeText(children[0]).trim(),
    };
  }

  const text = children.map((child) => getNodeText(child)).join('').trim();
  if (!isImageUrl(text)) {
    return null;
  }

  return {
    url: text,
    alt: '',
  };
};

const renderListItemToHtml = (node: unknown): string => {
  if (!isRecord(node)) {
    return '';
  }

  const children = Array.isArray(node.children) ? node.children : [];
  const content = children
    .map((child) => {
      if (isRecord(child) && child.type === 'list') {
        return renderBlockToHtml(child);
      }

      if (isRecord(child) && Array.isArray(child.children)) {
        return child.children.map((grandchild) => renderInlineNodeToHtml(grandchild)).join('');
      }

      return renderInlineNodeToHtml(child);
    })
    .join('');

  return `<li>${content}</li>`;
};

function renderBlockToHtml(block: unknown): string {
  if (!isRecord(block) || typeof block.type !== 'string') {
    return '';
  }

  switch (block.type) {
    case 'paragraph': {
      const image = extractStandaloneImage(block.children);
      if (image) {
        return mediaFigureToHtml(
          {
            url: image.url,
            alternativeText: image.alt,
          },
          image.alt,
        );
      }

      const content = Array.isArray(block.children)
        ? block.children.map((child) => renderInlineNodeToHtml(child)).join('')
        : '';

      return content.trim().length > 0 ? `<p>${content}</p>` : '';
    }

    case 'heading': {
      const level =
        typeof block.level === 'number' && block.level >= 1 && block.level <= 6
          ? block.level
          : 2;
      const content = Array.isArray(block.children)
        ? block.children.map((child) => renderInlineNodeToHtml(child)).join('')
        : '';

      return content.trim().length > 0 ? `<h${level}>${content}</h${level}>` : '';
    }

    case 'list': {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = Array.isArray(block.children)
        ? block.children.map((child) => renderListItemToHtml(child)).join('')
        : '';

      return items.trim().length > 0 ? `<${tag}>${items}</${tag}>` : '';
    }

    case 'quote': {
      const content = Array.isArray(block.children)
        ? block.children.map((child) => renderInlineNodeToHtml(child)).join('')
        : '';

      return content.trim().length > 0 ? `<blockquote><p>${content}</p></blockquote>` : '';
    }

    case 'code': {
      const plainText =
        typeof block.plainText === 'string'
          ? block.plainText
          : Array.isArray(block.children)
            ? block.children.map((child) => getNodeText(child)).join('')
            : '';

      return plainText.trim().length > 0
        ? `<pre><code>${escapeHtml(plainText)}</code></pre>`
        : '';
    }

    case 'image': {
      if ('image' in block) {
        return mediaFigureToHtml(block.image);
      }

      return mediaFigureToHtml(block);
    }

    default:
      return '';
  }
}

const blocksToHtml = (value: unknown) => {
  if (!isBlocksBody(value)) {
    return '';
  }

  return (value as unknown[])
    .map((block) => renderBlockToHtml(block))
    .join('');
};

const contentSectionsToHtml = (value: unknown) => {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map((section) => {
      if (!isRecord(section) || typeof section.__component !== 'string') {
        return '';
      }

      if (section.__component === 'shared.rich-text-block') {
        return blocksToHtml(section.content);
      }

      if (section.__component === 'shared.image-gallery-block') {
        const images = Array.isArray(section.images) ? section.images : [];
        return images.map((image) => mediaFigureToHtml(image)).join('');
      }

      return '';
    })
    .join('');
};

const paragraphsToHtml = (paragraphs: string[]) =>
  paragraphs
    .map((paragraph) =>
      isImageUrl(paragraph)
        ? mediaFigureToHtml({ url: paragraph })
        : `<p>${escapeHtml(paragraph)}</p>`,
    )
    .join('');

const toLegacyHtmlBody = (body: unknown, contentSections: unknown) => {
  const sectionsHtml = contentSectionsToHtml(contentSections);
  if (sectionsHtml.trim().length > 0) {
    return sectionsHtml;
  }

  const blocksHtml = blocksToHtml(body);
  if (blocksHtml.trim().length > 0) {
    return blocksHtml;
  }

  const paragraphs = extractParagraphs(body);
  if (paragraphs.length > 0) {
    return paragraphsToHtml(paragraphs);
  }

  return '';
};

const withMetadata = (
  metadata: ContentManagerMetadata | undefined,
  {
    label,
    description = '',
    visible = true,
  }: {
    label: string;
    description?: string;
    visible?: boolean;
  },
): ContentManagerMetadata => ({
  ...metadata,
  edit: {
    ...(metadata?.edit ?? {}),
    label,
    description,
    placeholder: metadata?.edit?.placeholder ?? '',
    visible,
    editable: metadata?.edit?.editable ?? true,
  },
  list: {
    ...(metadata?.list ?? {}),
    label,
  },
});

const syncArticleEditorLayout = async (
  strapi: Core.Strapi,
  uid: string,
) => {
  const contentTypeService = strapi
    .plugin('content-manager')
    .service('content-types') as ContentManagerContentTypeService;
  const contentType = strapi.contentTypes[uid];

  if (!contentType) {
    return;
  }

  const current = await contentTypeService.findConfiguration(contentType);
  const attributes = contentType.attributes ?? {};
  const hasBody = Object.prototype.hasOwnProperty.call(attributes, 'body');
  const hasBodyHtml = Object.prototype.hasOwnProperty.call(attributes, 'bodyHtml');
  const hasBodyImages = Object.prototype.hasOwnProperty.call(
    attributes,
    'bodyImages',
  );
  const bodyFieldName = hasBodyHtml ? 'bodyHtml' : hasBody ? 'body' : undefined;

  await contentTypeService.updateConfiguration(contentType, {
    settings: {
      ...current.settings,
      mainField: 'title',
      defaultSortBy: 'publishedDate',
      defaultSortOrder: 'DESC',
      pageSize: 10,
    },
    metadatas: {
      ...current.metadatas,
      title: withMetadata(current.metadatas.title, {
        label: '\u6807\u9898',
      }),
      slug: withMetadata(current.metadatas.slug, {
        label: 'Slug',
        description:
          '\u7528\u4e8e\u751f\u6210\u6587\u7ae0\u94fe\u63a5\uff0c\u5efa\u8bae\u4f7f\u7528\u82f1\u6587\u6216\u62fc\u97f3',
      }),
      publishedDate: withMetadata(current.metadatas.publishedDate, {
        label: '\u53d1\u5e03\u65f6\u95f4',
      }),
      author: withMetadata(current.metadatas.author, {
        label: '\u4f5c\u8005',
      }),
      body: withMetadata(current.metadatas.body, {
        label: '\u65e7\u7248\u6b63\u6587',
        description: '',
        visible: !hasBodyHtml && hasBody,
      }),
      bodyHtml: withMetadata(current.metadatas.bodyHtml, {
        label: '\u6b63\u6587\u5185\u5bb9',
        description:
          '\u5149\u6807\u505c\u5728\u54ea\u91cc\uff0c\u56fe\u7247\u5c31\u63d2\u5230\u54ea\u91cc\u3002\u53ef\u76f4\u63a5\u4e0a\u4f20\u6216\u4ece\u5a92\u4f53\u5e93\u9009\u62e9\u591a\u5f20\u56fe\u7247\uff0c\u7f16\u8f91\u533a\u4f1a\u76f4\u63a5\u9884\u89c8\u6548\u679c\u3002',
        visible: hasBodyHtml,
      }),
      contentSections: withMetadata(current.metadatas.contentSections, {
        label: '\u65e7\u7248\u5206\u6bb5\u5185\u5bb9',
        description: '',
        visible: false,
      }),
      coverImageUrl: withMetadata(current.metadatas.coverImageUrl, {
        label: '\u65e7\u7248\u5c01\u9762\u56fe\u94fe\u63a5',
        visible: false,
      }),
      coverImage: withMetadata(current.metadatas.coverImage, {
        label: '\u9876\u90e8\u5c01\u9762\u56fe',
        description:
          '\u663e\u793a\u5728\u6587\u7ae0\u9876\u90e8\uff0c\u4e0d\u4f1a\u63d2\u5165\u5230\u6b63\u6587\u4e2d\u95f4',
      }),
      attachments: withMetadata(current.metadatas.attachments, {
        label: '\u6587\u672b\u9644\u4ef6',
        description:
          '\u9644\u4ef6\u4f1a\u7edf\u4e00\u663e\u793a\u5728\u6587\u7ae0\u6700\u4e0b\u65b9\uff0c\u652f\u6301\u4e00\u6b21\u4e0a\u4f20\u591a\u4e2a\u6587\u4ef6',
      }),
      bodyImages: withMetadata(current.metadatas.bodyImages, {
        label: '\u65e7\u7248\u6b63\u6587\u56fe\u5e93',
        description: '',
        visible: false,
      }),
    },
    layouts: {
      ...current.layouts,
      list: ['title', 'publishedDate', 'author', 'slug'],
      edit: [
        [
          { name: 'title', size: 8 },
          { name: 'slug', size: 4 },
        ],
        [
          { name: 'publishedDate', size: 4 },
          { name: 'author', size: 4 },
        ],
        ...(bodyFieldName ? [[{ name: bodyFieldName, size: 12 }]] : []),
        [
          { name: 'coverImage', size: 6 },
          { name: 'attachments', size: 6 },
        ],
      ],
    },
  });
};

const syncArticleComponentLayout = async (
  strapi: Core.Strapi,
  uid: string,
  fieldName: string,
  fieldLabel: string,
  fieldDescription: string,
) => {
  const componentService = strapi
    .plugin('content-manager')
    .service('components') as ContentManagerComponentService;
  const component = strapi.components[uid];

  if (!component) {
    return;
  }

  const current = await componentService.findConfiguration(component);

  await componentService.updateConfiguration(component, {
    settings: {
      ...current.settings,
      mainField: fieldName,
    },
    metadatas: {
      ...current.metadatas,
      [fieldName]: withMetadata(current.metadatas[fieldName], {
        label: fieldLabel,
        description: fieldDescription,
      }),
    },
    layouts: {
      ...current.layouts,
      edit: [[{ name: fieldName, size: 12 }]],
    },
  });
};

const migrateLegacyPosts = async (
  strapi: Core.Strapi,
  uid: string,
  defaultAuthor: string,
) => {
  const posts = (await strapi.db.query(uid).findMany()) as Array<
    Record<string, unknown>
  >;

  for (const post of posts) {
    const updates: Record<string, unknown> = {};
    const body = post.body;
    const contentSections = post.contentSections;
    const bodyHtml =
      typeof post.bodyHtml === 'string' ? post.bodyHtml.trim() : '';

    if (!post.author) {
      updates.author = defaultAuthor;
    }

    if (!isBlocksBody(body)) {
      const paragraphs = extractParagraphs(body);

      if (paragraphs.length > 0) {
        updates.body = toBlocksBody(paragraphs);
      }
    }

    if (!bodyHtml) {
      const html = toLegacyHtmlBody(updates.body ?? body, contentSections);

      if (html.trim().length > 0) {
        updates.bodyHtml = html;
      }
    }

    if (Object.keys(updates).length > 0) {
      await strapi.db.query(uid).update({
        where: { id: post.id },
        data: updates,
      });
    }
  }
};

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncArticleEditorLayout(strapi, 'api::news-post.news-post');
    await syncArticleEditorLayout(strapi, 'api::notice-post.notice-post');
    await syncArticleComponentLayout(
      strapi,
      'shared.rich-text-block',
      'content',
      '\u6b63\u6587\u6587\u5b57',
      '\u5728\u8fd9\u4e00\u5757\u5199\u5f53\u524d\u4f4d\u7f6e\u7684\u6b63\u6587\u5185\u5bb9',
    );
    await syncArticleComponentLayout(
      strapi,
      'shared.image-gallery-block',
      'images',
      '\u56fe\u7247',
      '\u53ef\u4e00\u6b21\u9009\u62e9\u591a\u5f20\u56fe\u7247\uff0c\u663e\u793a\u5728\u5f53\u524d\u63d2\u5165\u4f4d\u7f6e',
    );

    if (process.env.SEED_DEMO_DATA === 'false') {
      return;
    }

    const existingSite = await strapi.db
      .query('api::site-setting.site-setting')
      .findOne({ where: { id: 1 } });

    if (!existingSite) {
      await strapi.db
        .query('api::site-setting.site-setting')
        .create({ data: demoSeed.site });
    }

    await seedCollection(strapi, 'api::news-post.news-post', demoSeed.newsPosts);
    await seedCollection(
      strapi,
      'api::notice-post.notice-post',
      demoSeed.noticePosts,
    );
    await migrateLegacyPosts(
      strapi,
      'api::news-post.news-post',
      '\u6821\u56ed\u65b0\u95fb\u7ec4',
    );
    await migrateLegacyPosts(
      strapi,
      'api::notice-post.notice-post',
      '\u5b66\u6821\u529e\u516c\u5ba4',
    );
    await seedCollection(
      strapi,
      'api::teacher-subject.teacher-subject',
      demoSeed.teacherSubjects,
    );
    await seedCollection(
      strapi,
      'api::teacher-profile.teacher-profile',
      demoSeed.teacherProfiles,
    );
    await seedCollection(
      strapi,
      'api::campus-spot.campus-spot',
      demoSeed.campusSpots,
    );
    await seedCollection(
      strapi,
      'api::gallery-album.gallery-album',
      demoSeed.galleryAlbums,
    );
  },
};
