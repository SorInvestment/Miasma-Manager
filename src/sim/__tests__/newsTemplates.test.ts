import { describe, expect, it } from 'vitest';
import { NEWS_TEMPLATES, formatNews } from '../newsTemplates';

describe('news templates', () => {
  it('every template has at least one variant', () => {
    for (const tpl of Object.values(NEWS_TEMPLATES)) {
      expect(tpl.variants.length).toBeGreaterThan(0);
    }
  });

  it('every template severity is 1, 2 or 3', () => {
    for (const tpl of Object.values(NEWS_TEMPLATES)) {
      expect([1, 2, 3]).toContain(tpl.severity);
    }
  });

  it('formatNews substitutes country and flag tokens', () => {
    const result = formatNews('country-collapsed', {
      country: 'Test Country',
      flag: '🏴',
    }, 0);
    expect(result.text).toContain('Test Country');
    expect(result.text).toContain('🏴');
    expect(result.text).not.toContain('{country}');
    expect(result.text).not.toContain('{flag}');
  });

  it('formatNews substitutes pathogen and city tokens', () => {
    const result = formatNews('patient-zero', {
      country: 'Nation',
      city: 'Capital',
      pathogen: 'Plague-X',
    }, 0);
    expect(result.text).toContain('Capital');
  });

  it('different seeds pick different variants when multiple exist', () => {
    const tpl = NEWS_TEMPLATES['country-collapsed'];
    expect(tpl.variants.length).toBeGreaterThan(1);
    const a = formatNews('country-collapsed', { country: 'A', flag: '🏴' }, 0).text;
    const b = formatNews('country-collapsed', { country: 'A', flag: '🏴' }, 1).text;
    const c = formatNews('country-collapsed', { country: 'A', flag: '🏴' }, 2).text;
    const distinct = new Set([a, b, c]);
    expect(distinct.size).toBeGreaterThan(1);
  });

  it('falls back gracefully when tokens absent', () => {
    const result = formatNews('country-collapsed', {}, 0);
    expect(result.text).not.toContain('{country}');
    expect(result.text).not.toContain('{flag}');
  });

  it('no template references missing placeholders', () => {
    const knownTokens = ['{country}', '{flag}', '{city}', '{pathogen}', '{percent}', '{day}', '{count}'];
    const tokenPattern = /\{(\w+)\}/g;
    for (const tpl of Object.values(NEWS_TEMPLATES)) {
      for (const v of tpl.variants) {
        const matches = v.match(tokenPattern) ?? [];
        for (const m of matches) {
          expect(knownTokens).toContain(m);
        }
      }
    }
  });
});
