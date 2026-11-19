/**
 * Pixel icons for the service buoys: 9 × 9 grids, '#' = a filled pixel.
 * Each service picks one in the CMS (Services › Game icon).
 */
export const PIXEL_ICONS = {
  analytics: [
    '.........',
    '.......#.',
    '.......#.',
    '....#..#.',
    '....#..#.',
    '.#..#..#.',
    '.#..#..#.',
    '#########',
    '.........',
  ],
  seo: [
    '..###....',
    '.#...#...',
    '#.....#..',
    '#.....#..',
    '#.....#..',
    '.#...#...',
    '..####...',
    '......##.',
    '.......##',
  ],
  creative: [
    '.......##',
    '......###',
    '.....###.',
    '....###..',
    '...###...',
    '..###....',
    '.##......',
    '##.......',
    '#........',
  ],
  video: [
    '.........',
    '.##......',
    '.####....',
    '.######..',
    '.#######.',
    '.######..',
    '.####....',
    '.##......',
    '.........',
  ],
  web: [
    '#########',
    '#.#.#...#',
    '#########',
    '#.......#',
    '#.##.##.#',
    '#.......#',
    '#.#####.#',
    '#.......#',
    '#########',
  ],
  social: [
    '.#######.',
    '#.......#',
    '#.#.#.#.#',
    '#.......#',
    '.#######.',
    '..##.....',
    '.#.......',
    '.........',
    '.........',
  ],
  media: [
    '.......#.',
    '.....###.',
    '...#####.',
    '####.###.',
    '####.###.',
    '...#####.',
    '.....###.',
    '...#...#.',
    '...#.....',
  ],
} as const

export type PixelIcon = keyof typeof PIXEL_ICONS

export const isPixelIcon = (value: unknown): value is PixelIcon =>
  typeof value === 'string' && value in PIXEL_ICONS

/** Filled cells as [x, y] pairs, precomputed once per icon. */
export const ICON_CELLS: Record<PixelIcon, [number, number][]> = Object.fromEntries(
  Object.entries(PIXEL_ICONS).map(([name, rows]) => [
    name,
    rows.flatMap((row, y) =>
      [...row].flatMap((c, x) => (c === '#' ? [[x, y] as [number, number]] : [])),
    ),
  ]),
) as Record<PixelIcon, [number, number][]>
