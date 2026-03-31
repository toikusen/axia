import { Injector } from '@angular/core';
import { DiscographyService } from '../../core/services/discography.service';
import { GoodsService } from '../../core/services/goods.service';
import { InformationService } from '../../core/services/information.service';
import { MemberService } from '../../core/services/member.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { StaticPageService } from '../../core/services/static-page.service';
import { VideoService } from '../../core/services/video.service';
import {
  formatDateLabel,
  sanitizeStringMap,
  sanitizeTags,
  toDateValue,
  toIsoDate,
  toIsoDateTime,
} from './admin.utils';
import { AdminResourceConfig, AdminResourceKey } from './admin.types';

type AdminRecord = Record<string, unknown>;

function asAdminRecordPromise<T extends object>(value: Promise<T>): Promise<AdminRecord> {
  return value as unknown as Promise<AdminRecord>;
}

function asAdminRecordArrayPromise<T extends object>(value: Promise<T[]>): Promise<AdminRecord[]> {
  return value as unknown as Promise<AdminRecord[]>;
}

function defaultString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function defaultNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

function defaultBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

const informationService = (injector: Injector) => injector.get(InformationService);
const scheduleService = (injector: Injector) => injector.get(ScheduleService);
const memberService = (injector: Injector) => injector.get(MemberService);
const videoService = (injector: Injector) => injector.get(VideoService);
const discographyService = (injector: Injector) => injector.get(DiscographyService);
const goodsService = (injector: Injector) => injector.get(GoodsService);
const staticPageService = (injector: Injector) => injector.get(StaticPageService);

export function getAdminResourceConfig(resourceKey: AdminResourceKey): AdminResourceConfig {
  const registry: Record<AdminResourceKey, AdminResourceConfig> = {
    information: {
      resourceKey: 'information',
      tableName: 'information',
      title: 'Information',
      singularLabel: '消息',
      basePath: '/admin/information',
      columns: [
        { header: '標題', key: 'title' },
        { header: '狀態', key: 'status' },
        {
          header: '發布時間',
          render: item => formatDateLabel(item['published_at']),
        },
      ],
      fields: [
        { key: 'title', label: '標題', type: 'text', required: true },
        {
          key: 'content_rich_text',
          label: '內容',
          type: 'richtext',
          required: true,
          span: 2,
          rows: 12,
        },
        {
          key: 'cover_image_url',
          label: '封面圖片',
          type: 'image',
          span: 2,
          uploadFolder: 'information',
        },
        {
          key: 'tags',
          label: '標籤',
          type: 'tags',
          span: 2,
          placeholder: '以半形逗號分隔，例如：公告, 活動',
        },
        {
          key: 'status',
          label: '狀態',
          type: 'select',
          required: true,
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
        },
        { key: 'published_at', label: '發布時間', type: 'datetime' },
      ],
      emptyValue: () => ({
        title: '',
        content_rich_text: '',
        cover_image_url: '',
        tags: [],
        status: 'draft',
        published_at: null,
      }),
      loadList: injector => asAdminRecordArrayPromise(informationService(injector).listAdmin()),
      loadOne: (injector, id) => asAdminRecordPromise(informationService(injector).findById(id)),
      create: (injector, payload) => informationService(injector).create(payload as never),
      update: (injector, id, payload) => informationService(injector).update(id, payload as never),
      delete: (injector, id) => informationService(injector).delete(id),
      toFormValue: record => ({
        ...record,
        cover_image_url: defaultString(record['cover_image_url']),
        tags: Array.isArray(record['tags']) ? record['tags'] : [],
        published_at: toDateValue(record['published_at']),
      }),
      fromFormValue: value => ({
        title: defaultString(value['title']),
        content_rich_text: defaultString(value['content_rich_text']),
        cover_image_url: defaultString(value['cover_image_url']) || null,
        tags: sanitizeTags(value['tags']),
        status: defaultString(value['status']) || 'draft',
        published_at: toIsoDateTime(value['published_at']),
      }),
    },
    schedule: {
      resourceKey: 'schedule',
      tableName: 'schedule',
      title: 'Schedule',
      singularLabel: '行程',
      basePath: '/admin/schedule',
      columns: [
        { header: '活動名稱', key: 'event_name' },
        {
          header: '日期',
          render: item => formatDateLabel(item['event_date']),
        },
        { header: '場地', key: 'venue' },
      ],
      fields: [
        { key: 'event_name', label: '活動名稱', type: 'text', required: true },
        { key: 'event_date', label: '活動時間', type: 'datetime', required: true },
        { key: 'venue', label: '場地', type: 'text', required: true },
        { key: 'ticket_url', label: '購票連結', type: 'text' },
        { key: 'notes', label: '備註', type: 'textarea', span: 2, rows: 6 },
      ],
      emptyValue: () => ({
        event_name: '',
        event_date: null,
        venue: '',
        ticket_url: '',
        notes: '',
      }),
      loadList: injector => asAdminRecordArrayPromise(scheduleService(injector).listAdmin()),
      loadOne: (injector, id) => asAdminRecordPromise(scheduleService(injector).findById(id)),
      create: (injector, payload) => scheduleService(injector).create(payload as never),
      update: (injector, id, payload) => scheduleService(injector).update(id, payload as never),
      delete: (injector, id) => scheduleService(injector).delete(id),
      toFormValue: record => ({
        ...record,
        event_date: toDateValue(record['event_date']),
      }),
      fromFormValue: value => ({
        event_name: defaultString(value['event_name']),
        event_date: toIsoDateTime(value['event_date']),
        venue: defaultString(value['venue']),
        ticket_url: defaultString(value['ticket_url']) || null,
        notes: defaultString(value['notes']) || null,
      }),
    },
    member: {
      resourceKey: 'member',
      tableName: 'member',
      title: 'Member',
      singularLabel: '成員',
      basePath: '/admin/member',
      columns: [
        { header: '名稱', key: 'name' },
        { header: '代表色', key: 'color_hex' },
        { header: '排序', render: item => String(item['sort_order'] ?? 0) },
      ],
      fields: [
        { key: 'name', label: '名稱', type: 'text', required: true },
        {
          key: 'photo_url',
          label: '照片',
          type: 'image',
          uploadFolder: 'member',
        },
        { key: 'color_hex', label: '代表色', type: 'color' },
        { key: 'sort_order', label: '排序', type: 'number', step: '1' },
        { key: 'bio', label: '簡介', type: 'textarea', span: 2, rows: 8 },
        {
          key: 'sns_links',
          label: 'SNS Links',
          type: 'json',
          span: 2,
        },
      ],
      emptyValue: () => ({
        name: '',
        photo_url: '',
        bio: '',
        color_hex: '#c8a882',
        sns_links: {},
        sort_order: 0,
      }),
      loadList: injector => asAdminRecordArrayPromise(memberService(injector).listAdmin()),
      loadOne: (injector, id) => asAdminRecordPromise(memberService(injector).findById(id)),
      create: (injector, payload) => memberService(injector).create(payload as never),
      update: (injector, id, payload) => memberService(injector).update(id, payload as never),
      delete: (injector, id) => memberService(injector).delete(id),
      toFormValue: record => ({
        ...record,
        photo_url: defaultString(record['photo_url']),
        sns_links: sanitizeStringMap(record['sns_links']),
      }),
      fromFormValue: value => ({
        name: defaultString(value['name']),
        photo_url: defaultString(value['photo_url']) || null,
        bio: defaultString(value['bio']),
        color_hex: defaultString(value['color_hex']) || '#c8a882',
        sns_links: sanitizeStringMap(value['sns_links']),
        sort_order: defaultNumber(value['sort_order']),
      }),
    },
    video: {
      resourceKey: 'video',
      tableName: 'video',
      title: 'Video',
      singularLabel: '影片',
      basePath: '/admin/video',
      columns: [
        { header: '標題', key: 'title' },
        {
          header: '精選',
          render: item => (item['is_featured'] ? 'Yes' : 'No'),
        },
        {
          header: '發布時間',
          render: item => formatDateLabel(item['published_at']),
        },
      ],
      fields: [
        { key: 'title', label: '標題', type: 'text', required: true },
        { key: 'youtube_url', label: 'YouTube 連結', type: 'text', required: true },
        {
          key: 'thumbnail_url',
          label: '縮圖',
          type: 'image',
          uploadFolder: 'video',
        },
        { key: 'published_at', label: '發布時間', type: 'datetime', required: true },
        { key: 'is_featured', label: '首頁精選', type: 'toggle' },
        { key: 'description', label: '描述', type: 'textarea', span: 2, rows: 6 },
      ],
      emptyValue: () => ({
        title: '',
        youtube_url: '',
        thumbnail_url: '',
        description: '',
        is_featured: false,
        published_at: new Date(),
      }),
      loadList: injector => asAdminRecordArrayPromise(videoService(injector).listAdmin()),
      loadOne: (injector, id) => asAdminRecordPromise(videoService(injector).findById(id)),
      create: (injector, payload) => videoService(injector).create(payload as never),
      update: (injector, id, payload) => videoService(injector).update(id, payload as never),
      delete: (injector, id) => videoService(injector).delete(id),
      toFormValue: record => ({
        ...record,
        thumbnail_url: defaultString(record['thumbnail_url']),
        published_at: toDateValue(record['published_at']),
      }),
      fromFormValue: value => ({
        title: defaultString(value['title']),
        youtube_url: defaultString(value['youtube_url']),
        thumbnail_url: defaultString(value['thumbnail_url']) || null,
        description: defaultString(value['description']) || null,
        is_featured: defaultBoolean(value['is_featured']),
        published_at: toIsoDateTime(value['published_at']) ?? new Date().toISOString(),
      }),
    },
    discography: {
      resourceKey: 'discography',
      tableName: 'discography',
      title: 'Discography',
      singularLabel: '作品',
      basePath: '/admin/discography',
      columns: [
        { header: '標題', key: 'title' },
        { header: '類型', key: 'type' },
        {
          header: '發行日期',
          render: item => formatDateLabel(item['release_date'], false),
        },
      ],
      fields: [
        { key: 'title', label: '標題', type: 'text', required: true },
        {
          key: 'cover_image_url',
          label: '封面',
          type: 'image',
          uploadFolder: 'discography',
        },
        { key: 'release_date', label: '發行日期', type: 'date', required: true },
        {
          key: 'type',
          label: '類型',
          type: 'select',
          required: true,
          options: [
            { label: 'Single', value: 'single' },
            { label: 'EP', value: 'ep' },
            { label: 'Album', value: 'album' },
          ],
        },
        {
          key: 'streaming_links',
          label: '串流連結',
          type: 'json',
          span: 2,
        },
      ],
      emptyValue: () => ({
        title: '',
        cover_image_url: '',
        release_date: null,
        type: 'single',
        streaming_links: {},
      }),
      loadList: injector => asAdminRecordArrayPromise(discographyService(injector).listAdmin()),
      loadOne: (injector, id) => asAdminRecordPromise(discographyService(injector).findById(id)),
      create: (injector, payload) => discographyService(injector).create(payload as never),
      update: (injector, id, payload) => discographyService(injector).update(id, payload as never),
      delete: (injector, id) => discographyService(injector).delete(id),
      toFormValue: record => ({
        ...record,
        cover_image_url: defaultString(record['cover_image_url']),
        release_date: toDateValue(record['release_date']),
        streaming_links: sanitizeStringMap(record['streaming_links']),
      }),
      fromFormValue: value => ({
        title: defaultString(value['title']),
        cover_image_url: defaultString(value['cover_image_url']) || null,
        release_date: toIsoDate(value['release_date']),
        type: defaultString(value['type']) || 'single',
        streaming_links: sanitizeStringMap(value['streaming_links']),
      }),
    },
    goods: {
      resourceKey: 'goods',
      tableName: 'goods',
      title: 'Goods',
      singularLabel: '商品',
      basePath: '/admin/goods',
      columns: [
        { header: '名稱', key: 'name' },
        {
          header: '售罄',
          render: item => (item['is_sold_out'] ? 'Yes' : 'No'),
        },
        { header: '排序', render: item => String(item['sort_order'] ?? 0) },
      ],
      fields: [
        { key: 'name', label: '名稱', type: 'text', required: true },
        {
          key: 'image_url',
          label: '商品圖片',
          type: 'image',
          uploadFolder: 'goods',
        },
        { key: 'purchase_url', label: '購買連結', type: 'text' },
        { key: 'is_sold_out', label: '已售完', type: 'toggle' },
        { key: 'sort_order', label: '排序', type: 'number', step: '1' },
        { key: 'description', label: '描述', type: 'textarea', span: 2, rows: 6 },
      ],
      emptyValue: () => ({
        name: '',
        image_url: '',
        description: '',
        purchase_url: '',
        is_sold_out: false,
        sort_order: 0,
      }),
      loadList: injector => asAdminRecordArrayPromise(goodsService(injector).listAdmin()),
      loadOne: (injector, id) => asAdminRecordPromise(goodsService(injector).findById(id)),
      create: (injector, payload) => goodsService(injector).create(payload as never),
      update: (injector, id, payload) => goodsService(injector).update(id, payload as never),
      delete: (injector, id) => goodsService(injector).delete(id),
      toFormValue: record => ({
        ...record,
        image_url: defaultString(record['image_url']),
      }),
      fromFormValue: value => ({
        name: defaultString(value['name']),
        image_url: defaultString(value['image_url']) || null,
        description: defaultString(value['description']) || null,
        purchase_url: defaultString(value['purchase_url']) || null,
        is_sold_out: defaultBoolean(value['is_sold_out']),
        sort_order: defaultNumber(value['sort_order']),
      }),
    },
    rules: {
      resourceKey: 'rules',
      tableName: 'static_page',
      title: 'Rules',
      singularLabel: '規則頁面',
      basePath: '/admin/rules',
      columns: [
        { header: 'Slug', key: 'slug' },
        { header: '標題', key: 'title' },
        { header: '排序', render: item => String(item['sort_order'] ?? 0) },
      ],
      fields: [
        { key: 'slug', label: 'Slug', type: 'text', required: true },
        { key: 'title', label: '標題', type: 'text', required: true },
        {
          key: 'content_rich_text',
          label: '內容',
          type: 'richtext',
          span: 2,
          required: true,
          rows: 12,
        },
        { key: 'sort_order', label: '排序', type: 'number', step: '1' },
      ],
      emptyValue: () => ({
        slug: '',
        title: '',
        content_rich_text: '',
        sort_order: 0,
      }),
      loadList: async injector =>
        (await staticPageService(injector).listAdmin()).filter(page => page.slug !== 'contact-info') as unknown as AdminRecord[],
      loadOne: (injector, id) => asAdminRecordPromise(staticPageService(injector).findById(id)),
      create: (injector, payload) => staticPageService(injector).create(payload as never),
      update: (injector, id, payload) => staticPageService(injector).update(id, payload as never),
      delete: (injector, id) => staticPageService(injector).delete(id),
      toFormValue: record => record,
      fromFormValue: value => ({
        slug: defaultString(value['slug']),
        title: defaultString(value['title']),
        content_rich_text: defaultString(value['content_rich_text']),
        sort_order: defaultNumber(value['sort_order']),
      }),
    },
  };

  return registry[resourceKey];
}
