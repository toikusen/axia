import { getAdminResourceConfig } from './resource-registry';

describe('resource-registry field types', () => {
  it('member.bio should be richtext', () => {
    const config = getAdminResourceConfig('member');
    const field = config.fields.find(f => f.key === 'bio');
    expect(field?.type).toBe('richtext');
  });

  it('schedule.notes should be richtext', () => {
    const config = getAdminResourceConfig('schedule');
    const field = config.fields.find(f => f.key === 'notes');
    expect(field?.type).toBe('richtext');
  });

  it('video.description should be richtext', () => {
    const config = getAdminResourceConfig('video');
    const field = config.fields.find(f => f.key === 'description');
    expect(field?.type).toBe('richtext');
  });

  it('goods.description should be richtext', () => {
    const config = getAdminResourceConfig('goods');
    const field = config.fields.find(f => f.key === 'description');
    expect(field?.type).toBe('richtext');
  });

  it('information.content_rich_text should be richtext', () => {
    const config = getAdminResourceConfig('information');
    const field = config.fields.find(f => f.key === 'content_rich_text');
    expect(field?.type).toBe('richtext');
  });

  it('rules.content_rich_text should be richtext', () => {
    const config = getAdminResourceConfig('rules');
    const field = config.fields.find(f => f.key === 'content_rich_text');
    expect(field?.type).toBe('richtext');
  });
});
