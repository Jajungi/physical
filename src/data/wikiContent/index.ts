import { wikiContent } from './units-1-2'
import { wikiContentPart2 } from './units-3-5'
import type { UnitWikiContent } from './units-1-2'

export type { UnitWikiContent }

/** Merged wiki content for all units that currently have method/advanced articles. */
export const allWikiContent: Record<number, UnitWikiContent> = {
  ...wikiContent,
  ...wikiContentPart2,
}
