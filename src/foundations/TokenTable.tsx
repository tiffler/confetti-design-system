import { useMemo, useState, type CSSProperties } from 'react';
import { useTokens, type TokenRecord } from './tokens';
import { luminanceOf } from './contrast';

/**
 * A searchable, sortable index of every token in the build, grouped by type.
 *
 * Values come from `build/portfolio/tokens.json` for the theme and mode selected in the
 * toolbar, so the table is never a second copy of the truth — switch Mode and every value
 * here repoints while the names stay put.
 */

export type TokenLayer = 'Primitive' | 'Semantic' | 'Component';

/* ---- Layer detection ------------------------------------------------------------------
   The generated index records a token's value and path but not which tier it came from,
   and tier is the most interesting thing about a token in a three-tier system. Rather than
   infer it from naming (which would quietly lie the moment someone adds a ramp), we read
   the same source files the build reads and ask which folder each path was authored in.
   `import.meta.glob` is resolved by Vite at build time, so this costs nothing at runtime
   and cannot drift from the pipeline. */

type JsonNode = Record<string, unknown>;

function collectPaths(node: JsonNode, trail: string[], out: Set<string>) {
  for (const [key, child] of Object.entries(node)) {
    // `$comment`, `$comment-danger`, `$schema` … are annotations, not tokens.
    if (key.startsWith('$')) continue;
    if (!child || typeof child !== 'object') continue;
    const obj = child as JsonNode;
    if ('value' in obj) out.add([...trail, key].join('.'));
    else collectPaths(obj, [...trail, key], out);
  }
}

function pathsFrom(modules: Record<string, unknown>): Set<string> {
  const out = new Set<string>();
  for (const mod of Object.values(modules)) {
    const json = (mod as { default?: JsonNode }).default;
    if (json) collectPaths(json, [], out);
  }
  return out;
}

const PRIMITIVE_PATHS = pathsFrom(
  import.meta.glob('../../tokens/primitives/*.json', { eager: true })
);
const COMPONENT_PATHS = pathsFrom(
  import.meta.glob('../../tokens/component/**/*.json', { eager: true })
);

function layerOf(path: string[]): TokenLayer {
  const dotted = path.join('.');
  if (COMPONENT_PATHS.has(dotted)) return 'Component';
  if (PRIMITIVE_PATHS.has(dotted)) return 'Primitive';
  // Everything else was authored in semantic/, modes/, themes/ or overrides/ — all of which
  // are the semantic layer, including a theme's brand-kit inputs.
  return 'Semantic';
}

/* ---- Categories ----------------------------------------------------------------------- */

export type CategoryKey =
  | 'color'
  | 'type'
  | 'space'
  | 'shape'
  | 'depth'
  | 'brand'
  | 'component';

const CATEGORIES: Array<{ key: CategoryKey; label: string; roots: string[] }> = [
  { key: 'color', label: 'Color', roots: ['color'] },
  { key: 'type', label: 'Typography', roots: ['font'] },
  { key: 'space', label: 'Space & size', roots: ['space', 'size', 'width'] },
  { key: 'shape', label: 'Shape', roots: ['radius', 'border'] },
  { key: 'depth', label: 'Elevation & motion', roots: ['shadow', 'motion', 'effect', 'z', 'focus'] },
  { key: 'brand', label: 'Brand kit', roots: ['brand', 'accent', 'syntax', 'shape', 'interaction'] },
  {
    key: 'component',
    label: 'Component',
    roots: ['button', 'card', 'badge', 'tabs', 'modal', 'toast', 'icon', 'code'],
  },
];

const ROOT_TO_CATEGORY = new Map<string, CategoryKey>();
for (const c of CATEGORIES) for (const r of c.roots) ROOT_TO_CATEGORY.set(r, c.key);

/* ---- Rendering helpers ----------------------------------------------------------------- */

const COLOR_VALUE = /^(#|rgb|hsl|transparent$)/i;
const isColor = (value: string) => COLOR_VALUE.test(value.trim());

type Row = { name: string; value: string; comment: string | null; layer: TokenLayer };
type SortKey = 'name' | 'value' | 'layer';

const LAYER_ORDER: Record<TokenLayer, number> = { Primitive: 0, Semantic: 1, Component: 2 };

const mono: CSSProperties = {
  fontFamily: 'var(--font-family-label)',
  fontSize: 'var(--font-size-label)',
  letterSpacing: 'var(--font-tracking-normal)',
};

function LayerChip({ layer }: { layer: TokenLayer }) {
  return (
    <span
      style={{
        ...mono,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        padding: '0 var(--space-inset-xs)',
        borderRadius: 'var(--radius-chip)',
        border: 'var(--border-width-thin) solid var(--color-border-subtle)',
        color: 'var(--color-text-muted)',
      }}
    >
      {layer}
    </span>
  );
}

function Swatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 'var(--size-icon-md)',
        height: 'var(--size-icon-md)',
        borderRadius: 'var(--radius-xs)',
        border: 'var(--border-width-thin) solid var(--color-border-subtle)',
        background: value,
        verticalAlign: '-0.25em',
      }}
    />
  );
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...mono,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-inset-xs)',
        background: 'transparent',
        border: 0,
        padding: 0,
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: 'var(--font-tracking-label)',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
      }}
    >
      {label}
      {/* The caret is decorative — `aria-sort` on the header carries this to assistive tech. */}
      <span aria-hidden style={{ opacity: active ? 1 : 0.35 }}>
        {active && dir === 'desc' ? '↓' : '↑'}
      </span>
    </button>
  );
}

export function TokenTable({
  categories,
  layer,
}: {
  /** Restrict to these categories. Omit for every token in the build. */
  categories?: CategoryKey[];
  /** Restrict to one tier — e.g. the semantic colour roles. */
  layer?: TokenLayer;
}) {
  const tokens = useTokens();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'name',
    dir: 'asc',
  });

  const groups = useMemo(() => {
    const wanted = categories ? new Set<CategoryKey>(categories) : null;
    const buckets = new Map<CategoryKey, Row[]>();

    for (const [name, record] of Object.entries(tokens as Record<string, TokenRecord>)) {
      const category = ROOT_TO_CATEGORY.get(record.path[0]);
      if (!category) continue;
      if (wanted && !wanted.has(category)) continue;

      const rowLayer = layerOf(record.path);
      if (layer && rowLayer !== layer) continue;

      const row: Row = { name, value: record.value, comment: record.comment, layer: rowLayer };
      const list = buckets.get(category);
      if (list) list.push(row);
      else buckets.set(category, [row]);
    }
    return buckets;
  }, [tokens, categories, layer]);

  const needle = query.trim().toLowerCase();

  /* Translucent values are flattened onto the page before ranking, so they sort by what
     actually renders — the same treatment ColorGrid gives them. */
  const page = (tokens as Record<string, TokenRecord>)['color-surface-page']?.value ?? '#ffffff';
  const lum = (value: string) => (isColor(value) ? luminanceOf(value, page) : null);

  const compare = (a: Row, b: Row) => {
    const flip = sort.dir === 'asc' ? 1 : -1;

    if (sort.key === 'layer') {
      const d = LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer];
      return (d !== 0 ? d : a.name.localeCompare(b.name)) * flip;
    }

    if (sort.key === 'value') {
      /* Colours sort by relative luminance, lightest first — the convention the rest of
         the docs use, and the only ordering of a ramp that means anything. Sorting hex as
         text puts #00e5ff between #0d0221 and #0e1012, which tells you nothing.
         Non-colours (lengths, families, shadows) fall back to a numeric-aware compare so
         4px lands before 12px. Colours group ahead of non-colours either way, so a mixed
         component group stays predictable. */
      const la = lum(a.value);
      const lb = lum(b.value);
      if (la !== null && lb !== null) return (lb - la) * flip;
      if (la !== null) return -1;
      if (lb !== null) return 1;
      return a.value.localeCompare(b.value, undefined, { numeric: true }) * flip;
    }

    return a.name.localeCompare(b.name, undefined, { numeric: true }) * flip;
  };

  const visible = CATEGORIES.map((category) => {
    const rows = (groups.get(category.key) ?? [])
      .filter(
        (r) =>
          !needle ||
          r.name.toLowerCase().includes(needle) ||
          r.value.toLowerCase().includes(needle) ||
          (r.comment ?? '').toLowerCase().includes(needle)
      )
      .sort(compare);
    return { ...category, rows };
  }).filter((c) => c.rows.length > 0);

  const shown = visible.reduce((n, c) => n + c.rows.length, 0);
  const total = [...groups.values()].reduce((n, rows) => n + rows.length, 0);

  const toggle = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const th: CSSProperties = {
    ...mono,
    textAlign: 'left',
    padding: 'var(--space-inset-xs) var(--space-inline)',
    /* An inset shadow, not a border. The table is `border-collapse: collapse`, where borders
       are painted by the table rather than by the cell — so a sticky header's border stays
       behind with the rows while the header itself travels, and the head ends up with no
       rule under it. An inset shadow is painted by the element, so it comes along. */
    boxShadow: 'inset 0 calc(-1 * var(--border-width-default)) 0 var(--color-border-default)',
    position: 'sticky',
    top: 0,
    background: 'var(--color-surface-page)',
    /* Without this the header is in the right place and invisible: the rows come later in
       the DOM, so they paint over a sticky cell that has no stacking order of its own. */
    zIndex: 1,
  };
  const td: CSSProperties = {
    padding: 'var(--space-inset-xs) var(--space-inline)',
    borderBottom: 'var(--border-width-hairline) solid var(--color-border-subtle)',
    verticalAlign: 'top',
  };

  return (
    /* `pg-token-table` exists only so the Storybook docs chrome can opt this table out of
       its inline-`code` chip styling — see the note in .storybook/preview-head.html. */
    <div className="pg-token-table" style={{ display: 'grid', gap: 'var(--space-stack)' }}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-inline)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <label style={{ display: 'contents' }}>
          <span className="sr-only" style={{ position: 'absolute', left: -9999 }}>
            Search tokens
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, value or note…"
            style={{
              ...mono,
              flex: '1 1 22ch',
              minWidth: '18ch',
              padding: 'var(--space-inset-tight) var(--space-inset-sm)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-raised)',
              border: 'var(--border-width-default) solid var(--color-border-default)',
              borderRadius: 'var(--radius-control)',
            }}
          />
        </label>
        <span style={{ ...mono, color: 'var(--color-text-muted)' }}>
          {shown === total ? `${total} tokens` : `${shown} of ${total} tokens`}
        </span>
      </div>

      {visible.length === 0 ? (
        <p style={{ ...mono, color: 'var(--color-text-muted)', margin: 0 }}>
          Nothing matches “{query}”.
        </p>
      ) : (
        /* The results scroll inside a fixed region rather than growing the page.
           Two reasons, and the second is the one that bites: with 471 tokens the page ran to
           21,000px, which is a poor reading experience — the search box scrolls out of sight
           the moment you start looking — and it is far past what a snapshot tool will
           capture, which is exactly how this page broke the visual-regression build.
           A bounded region keeps the toolbar in view and the page a constant height whatever
           the token count. The sticky column headers now stick to this box, not the page. */
        <div
          style={{
            maxHeight: '70vh',
            /* Both axes on ONE element. `position: sticky` resolves against the nearest
               scrolling ancestor, so a per-table `overflow-x` wrapper would capture the
               column headers and they would scroll away with the rows instead of sticking. */
            overflow: 'auto',
            display: 'grid',
            gap: 'var(--space-stack)',
            alignContent: 'start',
          }}
        >
          {visible.map((category) => (
          <section key={category.key} style={{ display: 'grid', gap: 'var(--space-inline)' }}>
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--font-size-h5)',
                color: 'var(--color-text-primary)',
              }}
            >
              {category.label}{' '}
              <span style={{ ...mono, color: 'var(--color-text-muted)' }}>
                {category.rows.length}
              </span>
            </h3>

            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      style={th}
                      aria-sort={
                        sort.key === 'name'
                          ? sort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <SortButton
                        label="Token"
                        active={sort.key === 'name'}
                        dir={sort.dir}
                        onClick={() => toggle('name')}
                      />
                    </th>
                    <th
                      scope="col"
                      style={th}
                      aria-sort={
                        sort.key === 'value'
                          ? sort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <SortButton
                        label="Value"
                        active={sort.key === 'value'}
                        dir={sort.dir}
                        onClick={() => toggle('value')}
                      />
                    </th>
                    <th
                      scope="col"
                      style={th}
                      aria-sort={
                        sort.key === 'layer'
                          ? sort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <SortButton
                        label="Layer"
                        active={sort.key === 'layer'}
                        dir={sort.dir}
                        onClick={() => toggle('layer')}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {category.rows.map((row) => (
                    <tr key={row.name}>
                      {/* Colour lives on the cell, not the `code` — the docs chrome resets
                          `code` colour with `!important`, which would beat an inline style. */}
                      <td style={{ ...td, color: 'var(--color-text-primary)' }}>
                        <code style={mono}>--{row.name}</code>
                        {row.comment ? (
                          <p
                            style={{
                              margin: 'var(--space-inset-xs) 0 0',
                              maxWidth: '52ch',
                              fontFamily: 'var(--font-family-body)',
                              fontSize: 'var(--font-size-body-secondary)',
                              lineHeight: 'var(--font-leading-body)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {row.comment}
                          </p>
                        ) : null}
                      </td>
                      <td
                        style={{ ...td, whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}
                      >
                        {isColor(row.value) ? (
                          <>
                            <Swatch value={row.value} />{' '}
                          </>
                        ) : null}
                        <code style={mono}>{row.value}</code>
                      </td>
                      <td style={td}>
                        <LayerChip layer={row.layer} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          ))}
        </div>
      )}
    </div>
  );
}
