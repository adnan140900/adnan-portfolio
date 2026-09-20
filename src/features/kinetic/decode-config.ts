/** Original geometric notation, with no historical, religious or semantic claim.
 * 24-unit paths share stroke weight and baseline. No external assets/fonts. */
export const decodeConfig = {
  systemPool: ["△", "▽", "◇", "⊙"],
  editorialPool: ["◇", "△"],
  customGlyphs: [
    { id: "split-triangle", path: "M4 18 11 4 M14 6 21 18H14 M10 18H4 M12 12V17" },
    { id: "open-diamond", path: "M9 5 3 12 10 20 M15 19 21 12 14 4 M10 12H14" },
    { id: "offset-orbit", path: "M18 5A9 9 0 1 0 21 13 M16 9A5 5 0 1 0 17 14 M19 3V7" },
    { id: "branch-index", path: "M4 19 10 13V5 M10 13 19 8 M10 13 19 19 M8 3H12 M18 6 20 10 M17 19H21" },
    { id: "three-station-orbit", path: "M7 5A9 9 0 0 1 20 10 M19 16A9 9 0 0 1 8 21 M3 15A9 9 0 0 1 3 8 M6 3H9V6H6Z M19 11H22V14H19Z M4 18H7V21H4Z" },
    { id: "paired-arc", path: "M5 5Q16 3 16 12 M19 19Q8 21 8 12 M3 10H7 M17 14H21 M11 7 13 9 M11 15 13 17" },
  ],
  cursor: "offset-orbit",
  timing: { system: 1.3, editorial: 1.65, major: 1.95, cursorHold: 0.14, fps: 12 },
  policy: { editorialStride: 5, editorialMax: 3, symbolicUntil: 0.22, mostlyResolvedAt: 0.57, tailAt: 0.78, finalAt: 0.91, glyphStages: 3, maxJobs: 2 },
} as const;
