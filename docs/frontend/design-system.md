# Papcorns Dashboard — Design System

> Bu doküman tasarım değerleri için **tek doğru kaynaktır**: token'lar, tip ölçeği, boşluklar, bileşen ölçüleri ve içerik kuralları.

---

## 1. Global kararlar

Bu kararlar tüm sayfalar için geçerlidir; yeni bir ekran yazarken önce bunlara uyun.

| Konu | Karar |
|---|---|
| **Arayüz dili** | Tüm UI metinleri **İngilizce** (başlık, sekme, buton, filtre, etiket, placeholder, loading, empty state). |
| **AI içerik dili** | AI sohbet / analiz içerikleri **kullanıcının yazdığı dilde** devam eder. AI bölümünün *başlığı* UI'dır → İngilizce ("AI Analysis"). |
| **Tarih formatı** ✅ | Kodda **her yerde** tek format — mockup'larda farklı yazılmış olsa bile (ör. date picker'da `2026-09-22`) bu kural uygulanır: **`17 Sep 2026`** (gün · kısa ay · yıl). Aralık: `17 Sep – 24 Sep 2026` (aynı yılsa yıl bir kez). Saat: 24h, `17 Sep 2026, 10:09`. `2026-09-17` sadece CSV export / teknik alanlarda. |
| **Sayı formatı** | EN: binlik virgül, ondalık nokta, `%` sonda → `1,797` · `$0.58` · `72.4%`. Kartlarda kısaltma (`$24.4K`), tablolarda tam + ayraçlı. Kuruş yalnızca gerektiğinde. |
| **Renk semantiği** | Renk **iyi / kötü** gösterir, ok **yön** gösterir. Her metrik için polarity tanımlanır (`higher_is_better: true/false/neutral`). Harcama gibi metrikler nötr. |
| **Durum renkleri** | 3 seviye: `danger` (gerçek sorun) · `warning` (dikkat / veri eksik) · `info` (bilgi). Kırmızı sadece gerçek sorunlarda. |
| **Kısaltmalar** | Metrik başlığında `?` ikonu → tooltip: tam ad + tek cümle tanım + formül. |
| **Teknik isimler** | Üstte okunur isim, altında küçük gri kod (`Photo Studio` / `photoStudio`). |
| **Dropdown davranışı** | Tüm açılır menüler `Esc` ve dışarı tıklama ile kapanır. Aynı anda tek popover açık. |

---

## 2. Tipografi

### 2.1 Font aileleri

| Rol | Font | Ağırlıklar | Kullanım |
|---|---|---|---|
| **Primary (UI)** | **Bomstad Display** | Medium (500), SemiBold (600), ExtraBold (800, sadece logo/özel) | Tüm arayüz metni |
| **Numeric display** ✅ | **System font** (`-apple-system` / `system-ui` stack) — tasarımdaki SF Pro'nun web karşılığı | 500, 600 | KPI değerleri (`$24.4K`), delta badge rakamları · `font-variant-numeric: tabular-nums` |
| **Mono** | **DM Mono** | Regular (400), Medium (500) | Kod, token, ID gösterimleri |

> **Not:**
> - *Bomstad Display* lisanslı bir fonttur; dosyaları repoda yoktur. `public/fonts/` klasörüne konduğunda kullanılır, yoksa metin sistem fontuna düşer.
> - Numeric display için **karar: system font** (font dosyası gömülmez). macOS/iOS'ta SF Pro, Windows'ta Segoe UI, Android'de Roboto render olur.
> - *DM Mono* Google Fonts'ta ücretsiz.

```css
--font-sans: "Bomstad Display", "Inter", system-ui, sans-serif;
--font-numeric: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
--font-mono: "DM Mono", ui-monospace, monospace;
```

### 2.2 Tip ölçeği (onaylı ekranlardaki gerçek değerler)

| Token | Font / Ağırlık | Size | Line-height | Renk | Nerede |
|---|---|---|---|---|---|
| `text-page-title` | Bomstad SemiBold | 28 | auto (~39) | `--text-primary` | Sayfa başlığı ("Weekly Report"); letter-spacing bazı yerlerde `-0.35px` |
| `text-section-title` | Bomstad SemiBold | 28 | auto | `--text-primary` | Kart başlığı ("Trend Chart") |
| `text-page-desc` | Bomstad Medium | 14 | 20 | `--text-tertiary` | Başlık altı açıklama |
| `text-kpi-value` | System font Semibold | 32 | auto (~38) | `--text-primary` | KPI değerleri |
| `text-kpi-label` | Bomstad SemiBold | 11 | auto (~15) | `--text-secondary` | KPI etiketi — **UPPERCASE** |
| `text-body` / control | Bomstad Medium | 13 | 19.5 / auto | `--text-secondary` | Filter pill, buton, input, search |
| `text-body-sm` | Bomstad Medium | 12 | 16–18 | `--text-secondary` | Liste satırı, legend, chip |
| `text-caption` | Bomstad Medium | 11 | 16.5 | `--text-tertiary` | Tarih aralığı, yardımcı metin |
| `text-micro` | Bomstad Medium / SemiBold | 10 | auto / 15 | `--text-tertiary` | Kompakt KPI kartı, overline (`ls: 1px`) |
| `text-delta` | System font Semibold | 10–11 | auto | success / danger | Delta badge rakamı |
| `text-overline` | Bomstad SemiBold | 10–11 | 15 | `--text-tertiary` | "PRESETS", "ACQUISITION" grup başlıkları, UPPERCASE, `ls: 1px` |
| `text-code` | DM Mono Regular | 12 | auto | — | Token / kod |

> Kullanım dağılımı: 12px (%41) › 13px (%26) › 11px (%16) › 10px (%8). Gövde metni **12–13px** aralığında; 14px yalnızca sayfa açıklamasında.
> 12.5 / 10.5 gibi yarım değerler birkaç yerde var → kodda **12 / 10**'a yuvarlayın.

---

## 3. Renkler

### 3.1 Accent (tema) — `data-theme` ile değişir

Uygulama tek bir accent rengiyle çalışır; tema değiştirmek için sadece `--accent-*` değerleri değişir, ekranlar yeniden çizilmez.
`--accent-contrast` açık temalarda (Lilac, Green) koyu metne, koyu temada (Blue) beyaza döner.

```css
[data-theme="blue"] {          /* varsayılan — Papcorns */
  --accent:          #0051ED;
  --accent-hover:    #0047D1;
  --accent-active:   #003FB9;  /* pressed / selected */
  --accent-muted:    #D1E0FC;  /* chip / badge bg */
  --accent-subtle:   #E6EEFD;  /* row / column tint */
  --accent-border:   #94B6F7;  /* border / focus ring */
  --accent-contrast: #FFFFFF;  /* accent üstündeki metin/ikon */
}
[data-theme="lilac"] {
  --accent:          #C6B5F5;
  --accent-hover:    #AE9FD8;
  --accent-active:   #9A8DBF;
  --accent-muted:    #F5F2FD;
  --accent-subtle:   #F9F8FE;
  --accent-border:   #E7E0FB;
  --accent-contrast: #111827;
}
[data-theme="green"] {
  --accent:          #8EFF1E;
  --accent-hover:    #7DE01A;
  --accent-active:   #6FC717;
  --accent-muted:    #EBFFD7;
  --accent-subtle:   #F4FFE9;
  --accent-border:   #D0FFA1;
  --accent-contrast: #111827;
}
```

> Not: Listede seçili satır arka planı ekranlarda `#EFF6FF` kullanılmış → kodda `--accent-subtle` ile eşleyin.
> Logo wordmark rengi `#0151EE` (accent ile neredeyse aynı) → logo SVG'sinde sabit kalır.

### 3.2 Nötr / yüzey

| Token | Hex | Figma style | Kullanım |
|---|---|---|---|
| `--bg-page` | `#FAFAFA` | White2 | Sayfa arka planı, search input bg |
| `--bg-surface` | `#FFFFFF` | White | Kart, sidebar, dropdown, pill |
| `--bg-muted` | `#F3F4F6` | — | Segmented control track, hafif ayraçlar |
| `--border` | `#EAEAEA` | Stroke | Kart/pill/dropdown kenarı, divider |
| `--border-strong` | `#D1D5DC` | — | Secondary (outline) buton kenarı |
| `--text-primary` | `#111827` | Black | Başlık, değer, ana metin |
| `--text-secondary` | `#4B5563` | Gray | Gövde, etiket, ikon |
| `--text-tertiary` | `#797979` | Gray2 | Açıklama, caption, placeholder, tarih |
| `--text-on-accent` | `var(--accent-contrast)` | — | |

### 3.3 Semantik

| Token | Hex | BG tonu | Figma style | Kullanım |
|---|---|---|---|---|
| `--success` | `#10B981` | `#F0FBF1` (Green2) | Green / Green2 | Olumlu delta, iyi durum |
| `--danger` | `#EF4444` | `#FEF4F4` (Red 2) | Red / Red 2 | Olumsuz delta, gerçek hata |
| `--warning` | `#FBBF24` | — (öneri: `#FFFBEB`) | Orange | Dikkat / veri eksik |
| `--info` | `var(--accent)` | `var(--accent-subtle)` | Blue | Bilgi |

> Delta badge: arka plan semantik BG tonu, rakam semantik renk, yüzde `--text-tertiary`. Renk metriğin polarity'sine göre seçilir (bkz. §1).

### 3.4 Data-viz paleti (metrik → renk, sabit eşleme)

| Metrik | Hex |
|---|---|
| Installs | `#10B981` (pie/bar: `#22C55E`) |
| Cost | `#629EFF` (Blue2) |
| Cost per Subscribe | `#14B8A6` |
| Revenue | `#0051ED` |
| Subscribe | `#A78BFA` |
| ARPU | `#FBBF24` |
| Retention | `#34D399` |
| pLTV | `#F9A8D4` |

- Line chart: 2px çizgi + aynı rengin %15 opaklıkta gradient alanı (`#22C55E@15`, `#3B82F6@15`, `#1D4ED8@15`, `#A78BFA@15`).
- KPI sparkline: 2px (büyük kart) / 1.5px (kompakt kart) çizgi, son noktada 5px (3–4px) dolu daire, altında aynı renkte fade gradient. Renk = delta yönünün semantik rengi.
- Legend noktası: 10×10 daire, metin `text-body-sm`.
- Bir metriğin rengi tüm grafiklerde aynı kalmalı (Line / Bar / Pie).
- Bu tablo metrik → renk eşlemesi. Kategorilere (app, format, dil gibi) renk veren palet ayrı: §3.7.

### 3.5 Workspace renkleri (Sidebar workspace switcher)

| Token | Renk |
|---|---|
| `--workspace-papcorns` | `#0051ED` |
| `--workspace-intelligence` | `#0D9488` (teal) |
| `--workspace-growth` | `#EA580C` (orange) |
| `--workspace-creative` | `#7C3AED` (purple) |

> ✅ **Karar:** Workspace renkleri **tema değildir** — sadece workspace'in kimlik rengi (switcher'daki ikon kutusu, aktif workspace chip'i). Kullanıcı hangi temayı (`blue / lilac / green` + light/dark) seçtiyse workspace değiştirdiğinde **aynı temayla devam eder**. Tema kullanıcı tercihi olarak saklanır.

### 3.6 Dark mode 🌙

- Mod ve tema bağımsızdır: `data-theme="blue|lilac|green"` (accent) × `data-mode="light|dark"` (nötr/semantik).
- Accent (`--accent`, `--accent-hover`, `--accent-active`) ve **§3.4 data-viz renkleri iki modda da aynı**. Series paletinin (§3.7) dark modda kendi tonları var.
- Koyu zeminde accent rengindeki **metin/link** `--accent-text: #6B97FF` olur (okunurluk). Accent dolgulu yüzeyler (aktif nav, primary buton) değişmez; üstlerindeki metin `--accent-contrast`.
- Logo ve marka görselleri değişmez.

```css
[data-mode="dark"] {
  --bg-page: #0E1015;    --bg-surface: #161920;  --bg-muted: #1F232C;
  --border: #2A2F3A;     --border-strong: #3A404C;
  --text-primary: #F3F4F6; --text-secondary: #B4BAC6; --text-tertiary: #8A909C;
  --accent-text: #6B97FF;            /* light: var(--accent) */
  --accent-subtle: #15254A;          /* seçili satır, takvim aralığı — blue tema */
  --accent-muted: #1C3366;           /* chip / badge bg — blue tema */
  --success: #34D399; --success-bg: #0F2A20;
  --danger:  #F87171; --danger-bg:  #2E1517;
  --warning: #FBBF24; --warning-bg: #2A2310;
  --shadow-xs: 0 1px 2px -1px rgba(0,0,0,.5), 0 1px 3px 0 rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04);
  --shadow-popover: 0 10px 28px 0 rgba(10,13,26,.48);
  --shadow-modal: 0 8px 32px 0 rgba(0,0,0,.36);
}
```

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#FAFAFA` | `#0E1015` |
| `--bg-surface` | `#FFFFFF` | `#161920` |
| `--bg-muted` | `#F3F4F6` | `#1F232C` |
| `--border` | `#EAEAEA` | `#2A2F3A` |
| `--border-strong` | `#D1D5DC` | `#3A404C` |
| `--text-primary` | `#111827` | `#F3F4F6` |
| `--text-secondary` | `#4B5563` | `#B4BAC6` |
| `--text-tertiary` | `#797979` | `#8A909C` |
| `--accent-text` | `#0051ED` | `#6B97FF` |
| `--accent-subtle` (row) | `#EFF6FF` | `#15254A` |
| `--accent-muted` | `#D1E0FC` | `#1C3366` |
| `--success` / bg | `#10B981` / `#F0FBF1` | `#34D399` / `#0F2A20` |
| `--danger` / bg | `#EF4444` / `#FEF4F4` | `#F87171` / `#2E1517` |

> Lilac ve Green temalarının dark `--accent-subtle / --accent-muted` değerleri henüz tasarlanmadı → geçici: accent'in %15 / %25 opaklıkta `--bg-surface` üzerine karışımı (`color-mix(in srgb, var(--accent) 15%, var(--bg-surface))`).

### 3.7 Series paleti (kategori → renk)

§3.4 metriğe renk verir; bu palet grafiklerde nominal kategorilere (app, format, dil gibi) renk verir. Token'lar `globals.css`'te `--series-*`, Tailwind'de `bg-series-own`, `bg-series-1` … `bg-series-7`, `bg-series-other`, `bg-series-muted`, `bg-series-neutral`.

| Token | Rol | Light | Dark |
|---|---|---|---|
| `--series-own` | Vurgulanan ana seri, her accent temada aynı | `#0051ED` | `#3987E5` |
| `--series-1` | Slot 1 (orange) | `#EB6834` | `#D95926` |
| `--series-2` | Slot 2 (aqua) | `#1BAF7A` | `#199E70` |
| `--series-3` | Slot 3 (yellow) | `#EDA100` | `#C98500` |
| `--series-4` | Slot 4 (magenta) | `#E87BA4` | `#D55181` |
| `--series-5` | Slot 5 (green) | `#008300` | `#008300` |
| `--series-6` | Slot 6 (violet) | `#4A3AA7` | `#9085E9` |
| `--series-7` | Slot 7 (red) | `#E34948` | `#E66767` |
| `--series-other` | Other | `#B8BFCC` | `#4C5360` |
| `--series-muted` | Unknown | `#D8DCE3` | `#353B47` |
| `--series-neutral` | Kategorisiz tek seri | `#7A8292` | `#687080` |

Kurallar:

1. Ana seri her temada sabit mavi: lilac ve green temada da `--accent` değil `--series-own` kullanılır (bu iki accent beyaz zeminde yeterli kontrast vermez).
2. Seriler slot 1'den başlayarak sırayla renk alır; sıra renk körlüğü kontrolünden geçmiş sıradır, yer değiştirilmez. Other gri kalır.
3. Stack'te ana seri altta, gri parçalar (Other, Unknown) en üstte. Segmentler arasında 2px surface boşluğu bırakılır.
4. Metin seri rengini giymez. Etiket, değer ve legend metni ink; renk yanındaki noktada.
5. Slot 2 ve slot 7 status renklerine (`--success`, `--danger`) çok yakındır. Bu paletin kullanıldığı grafikte yeşil ve kırmızı anlam taşımaz; durum her zaman yazıyla da belirtilir.
6. Light modda slot 2, 3 ve 4 zemine karşı 3:1 kontrastın altındadır: bu slotları kullanan grafikte görünür etiket ya da görünür bir tablo bulunmalıdır.

---

## 4. Boşluk (spacing)

**Base: 2px grid, ana adımlar 4'ün katı.**

```css
--space-0_5: 2px;   --space-1: 4px;   --space-1_5: 6px;  --space-2: 8px;
--space-2_5: 10px;  --space-3: 12px;  --space-4: 16px;   --space-5: 20px;
--space-6: 24px;    --space-8: 32px;
```

En sık kullanılan gap'ler: **8** (%33) › **6** (%15) › **4** (%10) › **2** › **12** › **16**.

### 4.1 Sayfa layout'u (1704px tasarım genişliği)

```
┌────────────┬──────────────────────────────────────────────┐
│ Sidebar    │ 32px üst boşluk                              │
│ 232px      │ Page header (title + desc, gap 8)            │
│ (64px      │ 16px                                         │
│ collapsed) │ Filter bar (pill'ler, h 34, gap 8)           │
│            │ 32px                                         │
│            │ KPI grid (row gap 16, col gap 16)            │
│            │ 32px                                         │
│            │ Chart / Table kartları (aralarında 32px)     │
└────────────┴──────────────────────────────────────────────┘
  Content: sol 32px (sidebar'dan), sağ 24px, max-width 1416px
```

| Ölçü | Değer |
|---|---|
| Sidebar genişliği | 232px (collapsed: 64px) |
| Content sol padding | 32px |
| Content sağ padding | 24px |
| Content genişliği (1704 artboard) | 1416px — kodda `max-width: 1416px` veya fluid |
| Header → filtreler | 16px |
| Filtreler → ilk blok | 32px |
| Bloklar arası | 32px |
| Kart iç padding | 16px |
| Grid gap (kartlar) | 16px |

### 4.2 Bileşen iç padding'leri (en sık)

| Bileşen | Padding (T/R/B/L) | Gap |
|---|---|---|
| Filter pill | 6 / 10 / 6 / 12 | 6 |
| Sidebar nav item | 10 / 12 / 10 / 12 | 8 |
| Sidebar navigation listesi | 16 / 10 / 16 / 10 | item arası 6 |
| Sidebar submenu | 4 / 0 / 2 / 0 | 2 |
| Sidebar header | 12 / 10 / 12 / 12 | 6 |
| Sidebar footer | 16 / 20 / 16 / 20 | 8 |
| Segmented control track | 2 / 2 / 2 / 2 | 2 |
| Segmented button | 4–6 / 10–12 | 6 |
| Secondary button | 6 / 10 | 6 |
| Primary button | 6 / 12 | — |
| Delta badge | 8 | 4 |
| Chart legend satırı | 10 / 20 | 16 |
| Dropdown liste satırı | yükseklik 40, yatay 16 | — |
| Date picker sağ panel | 16 | 12 |

---

## 5. Köşe yarıçapı (radius)

| Token | Değer | Kullanım |
|---|---|---|
| `--radius-xs` | 6px | Segmented button, app ikon kutusu (24×24) |
| `--radius-sm` | 8px | Pill, input, badge, segmented track, secondary/primary buton |
| `--radius-md` | 10px | Sidebar header butonları |
| `--radius-lg` | 12px | Sidebar nav item |
| `--radius-xl` | 16px | Kart, dropdown panel, popover, dropdown içi full-width Apply |
| `--radius-full` | 9999px | Legend noktası, avatar, toggle, workspace chip |

---

## 6. Kenarlık & gölge

| Token | Değer |
|---|---|
| `--border-width` | 1px (default) · 2px (focus / seçili) |
| Kart | `1px solid var(--border)` veya kenarsız beyaz kart (KPI ve grafik kartlarında kenar yok, bg `#FFF` on `#FAFAFA`) |
| Dropdown / popover | `1px solid var(--border)` + `--shadow-popover` |

```css
/* Segmented control — seçili buton */
--shadow-xs: 0 1px 2px -1px #E5E7EB, 0 1px 3px 0 #E5E7EB, 0 0 0 1px rgba(0,0,0,.05);
/* Küçük kontroller (toggle, mini butonlar) */
--shadow-sm: 0 1px 2px -1px rgba(0,0,0,.10), 0 1px 3px 0 rgba(0,0,0,.10);
/* Dropdown / popover / tooltip */
--shadow-popover: 0 10px 28px 0 rgba(10,13,26,.16);
--shadow-modal:   0 8px 32px 0 rgba(0,0,0,.12);
```

> Logo ("glass body") gölgeleri yalnızca marka görseli içindir, UI'da kullanılmaz.

---

## 7. İkonlar

- Stil: **line (stroke) ikon**, 24×24 kutu, stroke ≈ 1.5–1.8px, `currentColor`.
- Küçük boyutlar: 16 (search, platform), 12 (buton içi), 10 (delta oku).
- Platform ikonları: Apple (siyah) / Android (`#A4C639`) — 16px.
- İkonları Figma'dan **SVG** olarak export edin; stroke rengini `currentColor` yapın.

---

## 8. Bileşenler

> Her bileşen için: anatomi → ölçüler → durumlar → önerilen React API.

### 8.1 Sidebar

**Varyantlar:** Expanded · Workspace switcher açık · Başka workspace (kendi tile'ı ve adı) · Collapsed (64px, sadece ikon)

- Genişlik 232px, bg `--bg-surface`, sağ kenar `--border`.
- **Header (65px):** Logo + workspace adı + `⇕` (switcher) · sağda collapse butonu (28×28, r10).
- **Workspace switcher popover:** workspace listesi, her biri renkli ikon kutusu.
- **Nav item:** h44, r12, padding 10/12, ikon 24 + label, gap 8. Label: Bomstad Medium 12, `--text-primary`.
  - **Active:** bg `--accent`, metin/ikon `--accent-contrast`, label **Bomstad SemiBold 13**.
  - **Hover:** *(tanımsız — öneri: bg `--bg-muted`)*.
  - Alt menüsü olanlarda sağda chevron (`>`); açıldığında alt öğeler girintili, gap 2, padding 4/0/2/0.
- **Footer (65px):** Avatar 32 (r full, bg `--border`) + isim (`text-body-sm`) + rol (`text-micro`, `--text-tertiary`) · sağda tema butonu (24×24, r8, border).

```tsx
<Sidebar
  workspace={string}
  collapsed={boolean}
  items={NavItem[]}          // { id, label, icon, href, children? }
  activeId={string}
  user={{ name, role, avatarUrl }}
  onWorkspaceChange={fn}
/>
```

### 8.2 FilterPill

Sayfa üstündeki filtre tetikleyicileri (tarih, apps, channels, countries).

- h34, r8, bg `--bg-surface`, border `1px --border`, padding 6/10/6/12, gap 6.
- Anatomi: sol ikon (19px) · label (`text-body`, `--text-secondary`) · chevron (11px).
- **Seçim sayısı:** label yanında accent renkli sayı badge'i (ör. `Apps (2)`, `Channels (2)`).
- **Aktif (açık) durum:** border + metin `--accent`, hafif accent bg (bkz. Components'teki "Aug 9, 2026 – Sep 11, 2026" örneği).
- Toggle varyantı: "Apply discount" — ikon + label + switch (accent).

```tsx
<FilterPill icon={<CalendarIcon/>} label="Last 7 Days" count={2} open={bool} onClick={fn}/>
```

### 8.3 DropdownPanel

Ortak yapı:
- Panel: w286, r16, bg surface, border `--border`, `--shadow-popover`, padding 16.
- **Search:** h32, r8, bg `--bg-page`, ikon 16 + placeholder ("Search Apps…", `text-body`, `--text-tertiary`).
- **Satır:** h40, metin `text-body-sm`, seçili satır bg `--accent-subtle` (`#EFF6FF`) + metin `--accent` + sağda ✓.
- **Footer:** full-width primary "Apply" (h40, r16).

Tip bazında:
| Panel | Seçim | Satır içeriği | Ek |
|---|---|---|---|
| **All Apps** | Çoklu | 24×24 app ikonu (r6) + isim + platform ikonu (Apple / Android) | Üstte "All Apps" satırı (tümü) |
| **Channels** | Çoklu | Kanal adı (Organic, Paid Search, …) | "All Channels" satırı |
| **Add Metric** | Çoklu, gruplu | Renk noktası (data-viz rengi) + metrik adı | Grup başlıkları `text-overline` (ACQUISITION, REVENUE, RETENTION) · altta "1 of 8 selected" sayacı |

> Kural: App seçici tüm sayfalarda bu bileşen olmalı (arama + çoklu seçim + ikon).

```tsx
<DropdownPanel
  variant="apps" | "channels" | "metrics"
  options={Option[]}         // { id, label, icon?, platform?, color?, group? }
  value={string[]}
  multiple
  searchable
  onApply={(ids) => void}
/>
```

### 8.4 DateRangePicker

- Popover w664, r16, iki kolon:
  - **Sol (176px):** `PRESETS` başlığı + liste: Default · Last 7 Days · Last 30 Days · Last 60 Days · Last 90 Days · This Week · This Month · This Quarter · This Year · Custom.
  - **Sağ (486px, padding 16):**
    - Mod seçici (`Between` ▾) + iki tarih input'u ("and" ile).
    - `+ Add time` → From / To saat input'ları (`00:00:00` – `23:59:59`), `– Remove time` ile kapanır.
    - Çift ay takvimi (‹ August 2026 · September 2026 ›), gün başlıkları Su–Sa.
      - Aralık başı/sonu: dolu daire `--accent`, beyaz metin. Aradaki günler: `--accent-subtle` bant + `--accent` metin.
    - Footer: sol `Save as Preset` (link, accent) · sağ `Cancel` (ghost) + `Apply` (primary).
  - **Save as Preset açık:** Preset name input · Visibility radio (Only you / Everyone in this project) · "Set preset as my default" toggle · full-width `Create` · altta `↑ Collapse`.
- Tetikleyici: `FilterPill` (takvim ikonu).

> Input'larda tarih görüntüleme global karara göre `22 Sep 2026` olmalı.

```tsx
<DateRangePicker
  value={{ from: Date, to: Date, preset?: PresetId, withTime?: boolean }}
  presets={Preset[]}
  onApply={fn}
  onSavePreset={({ name, visibility, isDefault }) => void}
/>
```

### 8.5 SegmentedControl

- Track: h34, r8, bg `--bg-muted`, padding 2, gap 2.
- Button: h30, r6, padding 4/10 (veya 6/12), gap 6, ikon + label (`text-body`).
  - **Seçili:** bg `--bg-surface`, `--shadow-xs`, metin `--text-primary`.
  - **Pasif:** şeffaf, metin `--text-tertiary`.
- Kullanımlar:
  - Platform: `All Platforms · iOS · Android · Web`
  - Zaman: `Month · Week · Day`
  - Görünüm: `Combined · Per App`
  - Grafik tipi: `Line · Bar · Pie`
- Yan yana birden fazla segmented varsa aralarına 1×20px dikey ayraç (`--border`), 12px boşluk.

> Kural: Sabit 3–4 seçenekli filtreler dropdown yerine bu bileşenle yapılmalı.

### 8.6 KPI Card

İki boyut:
| | Büyük | Kompakt |
|---|---|---|
| Boyut | 342×125 (4'lü satır) | 223×124 (6'lı satır) |
| Değer | SF Pro Semibold 32 | SF Pro Semibold 32 |
| Sparkline | ~119×56, 2px | ~48–79×39–45, 1.5px |
| Tarih | `text-caption` 11 | `text-micro` 10 |

- bg surface, r16, padding 16, gölge/kenar yok.
- Anatomi: sol üst `label` (UPPERCASE, `text-kpi-label`) → 4px → `value` · sağ üst sparkline · sol alt **delta badge** · sağ alt tarih aralığı.
- **Delta badge:** r8, padding 8, gap 4: yön oku (10px) + mutlak fark (SF Pro Semibold 10–11, semantik renk) + `(±%)` (`--text-tertiary`). Arka plan semantik BG.
- Grid: `display:grid; gap:16px;` satır 1 → 4 kolon, satır 2 → 6 kolon.

```tsx
<KpiCard
  label="Total Spend" value={24400} format="currency-compact"
  delta={{ abs: -5600, pct: -0.187 }} polarity="neutral" | "higher-better" | "lower-better"
  sparkline={number[]} range={{ from, to }} size="lg" | "sm"
/>
```

### 8.7 Trend Chart Card

- Kart: bg surface, r16, w1416, padding 16.
- **Satır 1 – metrik chip'leri:** `+ Add Metric` (secondary buton, border `--border-strong`) · seçili metrikler (chip: renk noktası + ad + `×`, h30, r8, border) · `Delete All` (link, accent).
- **Satır 2 – başlık + kontroller:** trend ikonu 32 + "Trend Chart" (`text-section-title`) + kaynak badge'i (koyu `#111827` bg, beyaz metin, r6) · sağda 3 SegmentedControl (Month/Week/Day · Combined/Per App · Line/Bar/Pie).
- 1px divider (`--border`).
- **Legend satırı:** padding 10/20, gap 16, nokta 10 + `text-body-sm`.
- **Grafik:** Line (smooth curve + gradient alan + nokta marker'lar), Bar, Pie (donut, ortada toplam `59K` + "Total", sağda değer + yüzde listesi).
- Eksenler: y-ekseni etiketleri `text-caption`, x-ekseni ay adları (`Jun`, `Jul`…).
- **Tooltip:** beyaz kart, r12, `--shadow-popover`, başlık (ay) + satırlar (renk noktası + metrik + sağa yaslı değer).

### 8.8 Butonlar

| Tip | Stil | Ölçü |
|---|---|---|
| **Primary** | bg `--accent`, metin `--accent-contrast`, `text-body` | h32 (date picker "Apply") · h40 full-width (dropdown "Apply", r16) · r8 · padding 6/12 |
| **Secondary** | bg transparan, border `1px --border-strong`, metin `--text-secondary` | h30 · r8 · padding 6/10 · ikon 12 + label |
| **Ghost** | metin `--text-secondary`, bg yok | "Cancel" |
| **Link** | metin `--accent`, `text-body-sm` | "Delete All", "Save as Preset", "+ Add time" |
| **Icon button** | 24–28px kare, r8–10, border opsiyonel | Collapse, tema |

> Kural: Sayfa başına **tek primary** aksiyon; diğerleri secondary. Silme gibi tehlikeli aksiyonlar sakin renkte, hover'da `--danger`, tıklanınca onay.

### 8.9 Toggle (Switch)

- 35×19, r full, açık: bg `--accent` + beyaz knob; kapalı: *(tasarlanmadı — öneri bg `#EAEAEA`)*.
- Label solda (`text-body`).

### 8.10 Page Header

- Title (`text-page-title`) → 8px → description (`text-page-desc`, tek satır).
- Sağ tarafta sayfa aksiyonları (varsa).
- **Tüm sayfalarda aynı şablon.**

---

## 9. Format yardımcıları (kod tarafında tek yerden)

```ts
// date
formatDate(d)            // "17 Sep 2026"
formatDateRange(a, b)    // "17 Sep – 24 Sep 2026" | "28 Dec 2026 – 3 Jan 2027"
formatDateTime(d)        // "17 Sep 2026, 10:09"

// number (en-US)
formatNumber(1797)               // "1,797"
formatCompact(24400)             // "24.4K"    ← kartlarda
formatCurrency(0.58)             // "$0.58"
formatCurrencyCompact(24400)     // "$24.4K"
formatPercent(0.724)             // "72.4%"
formatDelta(-5600, -0.187)       // { abs: "-$5.6K", pct: "(-18.7%)" }

// semantic color
deltaTone(metricKey, delta)      // "success" | "danger" | "neutral"  — METRIC_POLARITY tablosundan
```

Metrik sözlüğü (tooltip + polarity + format) tek bir dosyada tutulmalı:
```ts
export const METRICS = {
  total_spend:   { label: "Total Spend",   short: "Spend", format: "currency", polarity: "neutral",       desc: "...", formula: "..." },
  total_revenue: { label: "Total Revenue", format: "currency", polarity: "higher-better", ... },
  d0_cancel:     { label: "D0 Cancellation Rate", format: "percent", polarity: "lower-better", ... },
  // ...
}
```

---

## 10. Önerilen token dosyası (CSS)

```css
:root {
  /* fonts */
  --font-sans: "Bomstad Display", "Inter", system-ui, sans-serif;
  --font-numeric: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
  --font-mono: "DM Mono", ui-monospace, monospace;

  /* neutral */
  --bg-page: #FAFAFA;   --bg-surface: #FFFFFF;  --bg-muted: #F3F4F6;
  --border: #EAEAEA;    --border-strong: #D1D5DC;
  --text-primary: #111827; --text-secondary: #4B5563; --text-tertiary: #797979;

  /* semantic */
  --success: #10B981; --success-bg: #F0FBF1;
  --danger:  #EF4444; --danger-bg:  #FEF4F4;
  --warning: #FBBF24; --warning-bg: #FFFBEB;

  /* data viz */
  --viz-installs: #10B981; --viz-cost: #629EFF; --viz-cps: #14B8A6; --viz-revenue: #0051ED;
  --viz-subscribe: #A78BFA; --viz-arpu: #FBBF24; --viz-retention: #34D399; --viz-pltv: #F9A8D4;

  /* radius */
  --radius-xs: 6px; --radius-sm: 8px; --radius-md: 10px; --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;

  /* spacing */
  --space-0_5: 2px; --space-1: 4px; --space-1_5: 6px; --space-2: 8px; --space-2_5: 10px;
  --space-3: 12px; --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px;

  /* shadow */
  --shadow-xs: 0 1px 2px -1px #E5E7EB, 0 1px 3px 0 #E5E7EB, 0 0 0 1px rgba(0,0,0,.05);
  --shadow-sm: 0 1px 2px -1px rgba(0,0,0,.10), 0 1px 3px 0 rgba(0,0,0,.10);
  --shadow-popover: 0 10px 28px 0 rgba(10,13,26,.16);
  --shadow-modal: 0 8px 32px 0 rgba(0,0,0,.12);

  /* layout */
  --sidebar-w: 232px; --sidebar-w-collapsed: 64px;
  --content-max-w: 1416px; --content-pad-l: 32px; --content-pad-r: 24px;
}
/* + [data-theme="blue|lilac|green"] blokları — §3.1 */
```

<details>
<summary>Tailwind config karşılığı</summary>

```js
// tailwind.config.js (extend)
colors: {
  accent: { DEFAULT: "var(--accent)", hover: "var(--accent-hover)", active: "var(--accent-active)",
            muted: "var(--accent-muted)", subtle: "var(--accent-subtle)", border: "var(--accent-border)",
            contrast: "var(--accent-contrast)" },
  page: "#FAFAFA", surface: "#FFFFFF", muted: "#F3F4F6",
  line: { DEFAULT: "#EAEAEA", strong: "#D1D5DC" },
  ink: { DEFAULT: "#111827", 2: "#4B5563", 3: "#797979" },
  success: { DEFAULT: "#10B981", bg: "#F0FBF1" },
  danger: { DEFAULT: "#EF4444", bg: "#FEF4F4" },
  warning: { DEFAULT: "#FBBF24", bg: "#FFFBEB" },
},
fontFamily: { sans: ["Bomstad Display","Inter","system-ui"], num: ["-apple-system","SF Pro Display","Inter"], mono: ["DM Mono","ui-monospace"] },
fontSize: { 10: ["10px","15px"], 11: ["11px","16.5px"], 12: ["12px","18px"], 13: ["13px","19.5px"], 14: ["14px","20px"], 28: ["28px","39px"], 32: ["32px","38px"] },
borderRadius: { xs: "6px", sm: "8px", md: "10px", lg: "12px", xl: "16px" },
boxShadow: { xs: "var(--shadow-xs)", sm: "var(--shadow-sm)", popover: "var(--shadow-popover)", modal: "var(--shadow-modal)" },
```
</details>
