import { filterNavLinks } from './navbar.component';

describe('filterNavLinks', () => {
  const links = [
    { path: '/information', label: 'INFORMATION' },
    { path: '/goods', label: 'GOODS' },
  ];

  it('shows all links when visibility is empty', () => {
    expect(filterNavLinks(links, {})).toEqual(links);
  });

  it('hides links whose key is false (key has no leading slash)', () => {
    expect(filterNavLinks(links, { goods: false })).toEqual([links[0]]);
  });

  it('shows links missing from the map', () => {
    expect(filterNavLinks(links, { information: true })).toEqual(links);
  });

  it('shows all links when visibility is null/undefined (fail-open)', () => {
    expect(filterNavLinks(links, null)).toEqual(links);
    expect(filterNavLinks(links, undefined)).toEqual(links);
  });
});
