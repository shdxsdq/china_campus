import type { Core } from '@strapi/strapi';

import { demoSeed } from './seed/demo-content';

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

const migrateLegacyNoticePosts = async (strapi: Core.Strapi) => {
  const noticePosts = (await strapi.db
    .query('api::notice-post.notice-post')
    .findMany()) as Array<Record<string, unknown>>;

  for (const noticePost of noticePosts) {
    const updates: Record<string, unknown> = {};
    const body = noticePost.body;
    const summary = String(noticePost.summary ?? '');

    if (!noticePost.author) {
      updates.author = '学校办公室';
    }

    if (Array.isArray(body) && body.every((item) => typeof item === 'string')) {
      updates.body = toBlocksBody(body as string[]);
    } else if (!body && summary) {
      updates.body = toBlocksBody([summary]);
    }

    if (Object.keys(updates).length > 0) {
      await strapi.db.query('api::notice-post.notice-post').update({
        where: { id: noticePost.id },
        data: updates,
      });
    }
  }
};

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
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
    await migrateLegacyNoticePosts(strapi);
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
