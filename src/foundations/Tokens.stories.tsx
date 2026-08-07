import type { Meta, StoryObj } from '@storybook/react-vite';
import { TokenTable, type CategoryKey, type TokenLayer } from './TokenTable';
import { Eyebrow, Lede, Page, Stack, Title } from '../pages/kit';

/**
 * The token index — every token in the build, searchable and sortable, grouped by type.
 *
 * These are stories rather than MDX on purpose. A story runs inside the preview decorator,
 * so it gets a real `ThemeProvider` and the toolbar's theme + mode for free; the Foundations
 * MDX pages have to mirror those onto the docs root by hand (see `useThemeAttrs`) because
 * prose renders outside any story. For a page that is mostly a live table, the story path is
 * both simpler and more honest about what it is showing.
 */

function TokenPage({
  title,
  lede,
  categories,
  layer,
}: {
  title: string;
  lede: string;
  categories?: CategoryKey[];
  layer?: TokenLayer;
}) {
  return (
    /* One scrollbar, and it is the page's. The heading scrolls away with everything else and
       the table runs its full length; `TokenTable`'s `pageScroll` mode pins the search
       toolbar instead, so the one control you need stays put without the rows being boxed
       inside a second scroller.

       The cost, and it is a real one: with the full build this page runs to roughly 21,000px.
       That is past what Chromatic captures in a single snapshot, so treat this story's visual
       coverage as the top of the page rather than the whole of it. */
    <Page width={1100} gap="var(--space-stack-lg)">
      <Stack gap="var(--space-2)">
        <Eyebrow>Tokens</Eyebrow>
        <Title>{title}</Title>
        <Lede>{lede}</Lede>
      </Stack>
      <TokenTable categories={categories} layer={layer} pageScroll />
    </Page>
  );
}

const meta: Meta = {
  title: 'Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
};
export default meta;

export const All: StoryObj = {
  name: 'All tokens',
  render: () => (
    <TokenPage
      title="Every token"
      lede="The whole build in one table — search by name, value or note, and sort by any column. Values are read live from the generated index for the theme and mode in the toolbar, so switching Mode repoints every value while the names stay put."
      categories={undefined}
    />
  ),
};

export const Color: StoryObj = {
  render: () => (
    <TokenPage
      title="Color"
      lede="Palette ramps, the semantic roles that name them, and the status pair. The Layer column is the thing to watch: components may only consume the component tier, and the semantic tier is the API for application code."
      categories={['color']}
    />
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <TokenPage
      title="Typography"
      lede="Families, the modular size ramp, weights, tracking and leading. Family is theme-tunable and resolves through the brand kit; everything else is axis-independent."
      categories={['type']}
    />
  ),
};

export const SpaceAndSize: StoryObj = {
  name: 'Space & size',
  render: () => (
    <TokenPage
      title="Space & size"
      lede="One 4px primitive ramp, two semantic families on top of it: component spacing (inset / stack / inline) and layout spacing. Control and icon sizes sit here too."
      categories={['space']}
    />
  ),
};

export const Shape: StoryObj = {
  render: () => (
    <TokenPage
      title="Shape"
      lede="Radii and border widths. `radius.control` and `radius.container` are brand-kit inputs — a theme repoints them to go from full pills to sharp corners without touching a component."
      categories={['shape']}
    />
  ),
};

export const ElevationAndMotion: StoryObj = {
  name: 'Elevation & motion',
  render: () => (
    <TokenPage
      title="Elevation & motion"
      lede="Hard offset shadows, the focus ring, transforms, durations and easings. The lift shadows live on the mode axis because they invert ink → chalk; `flat` is axis-independent because it is the absence of one."
      categories={['depth']}
    />
  ),
};

export const BrandKit: StoryObj = {
  name: 'Brand kit',
  render: () => (
    <TokenPage
      title="Brand kit"
      lede="The contract a theme fills in: brand colour, four accents, shape, fonts, syntax ground and the button hover style. Everything visible in the system derives from these through the wiring — this is the whole surface a new theme has to define."
      categories={['brand']}
    />
  ),
};

export const Component: StoryObj = {
  render: () => (
    <TokenPage
      title="Component"
      lede="Per-widget values, one group per component. Every one of these references a semantic role and never a primitive — that rule is enforced by the layer audit at build time, not by convention."
      categories={['component']}
    />
  ),
};
