// Bomstad Display, the dashboard's typeface, is a licensed font and is not
// part of this repository. When its files are in public/fonts/ the root
// layout adds the faces below; without them the same stacks fall through to
// the system font and everything still works (public/fonts/README.md).
//
// The font is declared twice from the same files
// (docs/frontend/foundations.md#typography). "Bomstad Letters" leaves out the
// numerals and the signs around them, so in the default stack (`font-sans`)
// numbers fall through to the system font: words in Bomstad, data in the
// system font. "Bomstad Face" keeps every glyph, for the places where the
// design sets digits in Bomstad (dates, calendar days, counters). Both leave
// out ı (U+0131), which the files draw as a slanted sliver; it comes from the
// system font like ğ ş İ, missing from the web subset. `font-bold` (700) maps
// to SemiBold; ExtraBold is for the logo.

const FONT_DIR = "/fonts";

/** weight → file in public/fonts/. */
export const BOMSTAD_FILES = {
  500: "BomstadDisplay-Medium.woff2",
  600: "BomstadDisplay-SemiBold.woff2",
  700: "BomstadDisplay-SemiBold.woff2",
  800: "BomstadDisplay-ExtraBold.woff2",
} as const;

// Everything except 0-9 $ % + , - . £ € the minus sign and ı.
const LETTERS_RANGE =
  "U+0000-0023, U+0026-002A, U+002F, U+003A-00A2, U+00A4-0130, U+0132-20AB, U+20AD-2211, U+2213-FFFF";
// Everything except ı.
const FACE_RANGE = "U+0000-0130, U+0132-FFFF";

const faces = (family: string, range: string) =>
  Object.entries(BOMSTAD_FILES)
    .map(
      ([weight, file]) =>
        `@font-face{font-family:"${family}";src:url("${FONT_DIR}/${file}") format("woff2");font-weight:${weight};font-style:normal;font-display:swap;unicode-range:${range}}`,
    )
    .join("");

/** The family names globals.css builds its stacks from; set whether or not the files exist. */
export const BOMSTAD_VARIABLES_CSS = `:root{--font-bomstad-letters:"Bomstad Letters";--font-bomstad-face:"Bomstad Face"}`;

export const BOMSTAD_FACES_CSS = faces("Bomstad Letters", LETTERS_RANGE) + faces("Bomstad Face", FACE_RANGE);

/** The weights body text uses, worth preloading. */
export const BOMSTAD_PRELOAD = [BOMSTAD_FILES[500], BOMSTAD_FILES[600]].map((file) => `${FONT_DIR}/${file}`);
