// Small UI icons exported from Figma, `currentColor`, drawn at
// their Figma size unless `size` is given. See docs/frontend/foundations.md#icons.

import type { IconProps } from "./nav-icons";

// Figma: icon-chevron-down
export function ChevronDownIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M1.83334 3.66669L5.5 7.33335L9.16667 3.66669" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-chevron-right
export function ChevronRightIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 14} height={size ?? 14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g opacity="0.6">
      <path d="M5.25004 10.5L8.75004 7.00002L5.25004 3.50002" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
    </svg>
  );
}

// Figma: icon-close
export function CloseIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 14} height={size ?? 14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M9.5 4.5L4.5 9.5" strokeWidth="1.04167" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M4.5 4.5L9.5 9.5" strokeWidth="1.04167" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-plus
export function PlusIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 12} height={size ?? 12} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M2.5 6H9.5" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6 2.5V9.5" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-moon
export function MoonIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M13.99 8.32397C13.9275 9.4814 13.5311 10.596 12.8487 11.5329C12.1663 12.4699 11.2271 13.1891 10.1447 13.6037C9.06224 14.0182 7.88288 14.1104 6.74918 13.869C5.61548 13.6276 4.57597 13.063 3.7563 12.2434C2.93664 11.4238 2.37192 10.3844 2.13041 9.25071C1.88889 8.11703 1.98093 6.93767 2.39538 5.85518C2.80984 4.77269 3.52897 3.83343 4.46585 3.15093C5.40273 2.46842 6.51724 2.07191 7.67466 2.0093C7.94466 1.99464 8.086 2.31597 7.94266 2.54464C7.46326 3.31167 7.25798 4.21855 7.36033 5.11727C7.46268 6.01599 7.86661 6.85349 8.50621 7.49309C9.14581 8.13269 9.98331 8.53662 10.882 8.63897C11.7808 8.74132 12.6876 8.53604 13.4547 8.05664C13.684 7.9133 14.0047 8.05397 13.99 8.32397Z" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-theme
export function PaletteIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath="url(#clip0_370_6270)">
      <path d="M9.00447 5.06919C9.40968 5.06919 9.73817 4.7407 9.73817 4.33549C9.73817 3.93028 9.40968 3.60179 9.00447 3.60179C8.59926 3.60179 8.27077 3.93028 8.27077 4.33549C8.27077 4.7407 8.59926 5.06919 9.00447 5.06919Z" fill="currentColor"/>
      <path d="M11.6726 7.73729C12.0778 7.73729 12.4063 7.4088 12.4063 7.00358C12.4063 6.59837 12.0778 6.26988 11.6726 6.26988C11.2673 6.26988 10.9389 6.59837 10.9389 7.00358C10.9389 7.4088 11.2673 7.73729 11.6726 7.73729Z" fill="currentColor"/>
      <path d="M5.66954 5.73628C6.07475 5.73628 6.40324 5.40779 6.40324 5.00258C6.40324 4.59736 6.07475 4.26887 5.66954 4.26887C5.26432 4.26887 4.93583 4.59736 4.93583 5.00258C4.93583 5.40779 5.26432 5.73628 5.66954 5.73628Z" fill="currentColor"/>
      <path d="M4.33561 9.07121C4.74083 9.07121 5.06932 8.74272 5.06932 8.33751C5.06932 7.93229 4.74083 7.6038 4.33561 7.6038C3.9304 7.6038 3.60191 7.93229 3.60191 8.33751C3.60191 8.74272 3.9304 9.07121 4.33561 9.07121Z" fill="currentColor"/>
      <path d="M8.00395 1.33405C4.33543 1.33405 1.33392 4.33556 1.33392 8.00407C1.33392 11.6726 4.33543 14.6741 8.00395 14.6741C8.62159 14.6741 9.10317 14.1765 9.10317 13.5482C9.10317 13.2567 8.98311 12.9912 8.81169 12.7978C8.61826 12.6051 8.51954 12.3629 8.51954 12.0474C8.51701 11.9006 8.54406 11.7548 8.59908 11.6187C8.6541 11.4826 8.73595 11.3589 8.83977 11.2551C8.94359 11.1513 9.06725 11.0694 9.20337 11.0144C9.33949 10.9594 9.4853 10.9324 9.6321 10.9349H10.9634C12.9985 10.9349 14.6686 9.26537 14.6686 7.22968C14.6506 4.01006 11.6464 1.33405 8.00395 1.33405Z" strokeWidth="2.00101" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_370_6270">
      <rect width="15.992" height="15.992" fill="white" transform="scale(1.0005)"/>
      </clipPath>
      </defs>
    </svg>
  );
}

// Figma: icon-collapse-sidebar
export function SidebarIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 15} height={size ?? 15} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M3.12508 1.87498H11.875C12.5654 1.87498 13.125 2.43462 13.125 3.12498V11.8749C13.125 12.5653 12.5654 13.1249 11.875 13.1249H3.12508C2.43473 13.1249 1.87509 12.5653 1.87509 11.8749V3.12498C1.87509 2.43462 2.43473 1.87498 3.12508 1.87498Z" strokeWidth="1.24999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M5.62503 1.87498V13.1249" strokeWidth="1.24999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.99989 9.37493L8.12491 7.49995L9.99989 5.62496" strokeWidth="1.24999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-switcher
export function SelectorIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 12} height={size ?? 12} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M3.50002 7.49999L6.00002 9.99999L8.50002 7.49999" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M3.50002 4.5L6.00002 2.00001L8.50002 4.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-arrow-down-right
export function ArrowDownRightIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 10} height={size ?? 10} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M2.91797 2.91699L7.08397 7.08299M2.91797 7.08299H7.08397V2.91699" strokeWidth="2" strokeLinecap="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-arrow-up-right
export function ArrowUpRightIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 10} height={size ?? 10} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M7.08397 7.08299V2.91699H2.91797M7.08397 2.91699L2.91797 7.08299" strokeWidth="2" strokeLinecap="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-trend-chart
export function TrendIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 32} height={size ?? 32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M21.334 9.33356H29.334V17.3336" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M29.3327 9.33356L17.9993 20.6669L11.3327 14.0002L2.66602 22.6669" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-calendar
export function CalendarIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 19} height={size ?? 19} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath="url(#clip0_370_4949)">
      <path d="M4.15625 2.96875H14.8438C16.1554 2.96875 17.2188 4.03207 17.2188 5.34375V14.8438C17.2188 16.1554 16.1554 17.2188 14.8438 17.2188H4.15625C2.84457 17.2188 1.78125 16.1554 1.78125 14.8438V5.34375C1.78125 4.03207 2.84457 2.96875 4.15625 2.96875Z" strokeWidth="1.78125" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M1.78125 7.71875H17.2188M5.9375 1.1875V4.75M13.0625 1.1875V4.75" strokeWidth="1.78125" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_370_4949">
      <rect width="19" height="19" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
}

// Figma: icon-apps
export function AppsIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath="url(#clip0_370_4923)">
      <path d="M2.475 1.125H6.525C7.27058 1.125 7.875 1.72942 7.875 2.475V6.525C7.875 7.27058 7.27058 7.875 6.525 7.875H2.475C1.72942 7.875 1.125 7.27058 1.125 6.525V2.475C1.125 1.72942 1.72942 1.125 2.475 1.125Z" strokeWidth="1.6875" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.475 1.125H15.525C16.2706 1.125 16.875 1.72942 16.875 2.475V6.525C16.875 7.27058 16.2706 7.875 15.525 7.875H11.475C10.7294 7.875 10.125 7.27058 10.125 6.525V2.475C10.125 1.72942 10.7294 1.125 11.475 1.125Z" strokeWidth="1.6875" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M2.475 10.125H6.525C7.27058 10.125 7.875 10.7294 7.875 11.475V15.525C7.875 16.2706 7.27058 16.875 6.525 16.875H2.475C1.72942 16.875 1.125 16.2706 1.125 15.525V11.475C1.125 10.7294 1.72942 10.125 2.475 10.125Z" strokeWidth="1.6875" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M11.475 10.125H15.525C16.2706 10.125 16.875 10.7294 16.875 11.475V15.525C16.875 16.2706 16.2706 16.875 15.525 16.875H11.475C10.7294 16.875 10.125 16.2706 10.125 15.525V11.475C10.125 10.7294 10.7294 10.125 11.475 10.125Z" strokeWidth="1.6875" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_370_4923">
      <rect width="18" height="18" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
}

// Figma: icon-search
export function SearchIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 19} height={size ?? 19} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M14.25 8.3125C14.25 11.5917 11.5917 14.25 8.3125 14.25C5.03331 14.25 2.375 11.5917 2.375 8.3125C2.375 5.03331 5.03331 2.375 8.3125 2.375C11.5917 2.375 14.25 5.03331 14.25 8.3125Z" strokeWidth="1.78125" strokeLinecap="round" stroke="currentColor"/>
      <path d="M13.0625 13.0625L17.2188 17.2188" strokeWidth="1.78125" strokeLinecap="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-countries
export function CountriesIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" strokeWidth="1.16667" stroke="currentColor"/>
      <path d="M5.61815 6C6.02618 4.61984 6.85605 3.37273 8 2C9.14394 3.37273 9.97382 4.61984 10.3819 6M5.61815 6C5.4317 6.63066 5.33333 7.2891 5.33333 8C5.33333 8.7109 5.4317 9.36934 5.61815 10M5.61815 6H2.33333M5.61815 6H10.3819M5.61815 10C6.02618 11.3802 6.85605 12.6273 8 14C9.14394 12.6273 9.97382 11.3802 10.3819 10M5.61815 10H2.33333M5.61815 10H10.3819M10.3819 6C10.5683 6.63066 10.6667 7.2891 10.6667 8C10.6667 8.7109 10.5683 9.36934 10.3819 10M10.3819 6H13.6667M10.3819 10H13.6667" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-platforms
export function PlatformsIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 20} height={size ?? 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M7.60718 4.23734C8.06034 2.53676 9.80818 1.52801 11.5079 1.98498L15.3509 3.02131C15.3509 3.02131 15.3508 3.02131 15.3509 3.02131C17.0366 3.47584 18.0464 5.22438 17.5969 6.91207L15.775 13.7537C15.3227 15.4501 13.5779 16.4567 11.8829 16.0004L8.03309 14.9625C8.03312 14.9625 8.03307 14.9625 8.03309 14.9625C6.34671 14.5081 5.33657 12.7588 5.7869 11.0717L7.60718 4.23734ZM8.81502 4.5592C8.81502 4.55922 8.81502 4.55917 8.81502 4.5592L6.99479 11.3934C6.72216 12.4142 7.33678 13.4803 8.35835 13.7556L12.2079 14.7933C13.2355 15.07 14.2929 14.4597 14.5671 13.432C14.5672 13.4319 14.5671 13.4321 14.5671 13.432L16.389 6.59041C16.6612 5.56839 16.0461 4.50341 15.0254 4.22821L11.1834 3.19211C11.1835 3.19214 11.1834 3.19209 11.1834 3.19211C10.1509 2.91468 9.09002 3.5275 8.81502 4.5592Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M2.29492 7.86897C2.29492 6.11244 3.71853 4.6875 5.47559 4.6875H7.96801C8.31319 4.6875 8.593 4.96732 8.593 5.3125C8.593 5.65767 8.31319 5.9375 7.96801 5.9375H5.47559C4.40941 5.9375 3.54492 6.80228 3.54492 7.86897V14.9457C3.54492 16.0122 4.40915 16.8763 5.47559 16.8763L10.4887 16.8764C10.9827 16.8764 11.3832 16.4759 11.3832 15.9819V15.3876C11.3832 15.0424 11.6631 14.7626 12.0082 14.7626C12.3534 14.7626 12.6332 15.0424 12.6332 15.3876V15.9819C12.6332 17.1663 11.6732 18.1264 10.4887 18.1264L5.47559 18.1263C3.71879 18.1263 2.29492 16.7025 2.29492 14.9457V7.86897Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}

// Figma: icon-discount
export function DiscountIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 19} height={size ?? 19} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M2.375 2.375H7.71875L16.625 11.2812L11.2812 16.625L2.375 7.71875V2.375Z" strokeWidth="1.6625" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M5.34375 6.53125C5.99959 6.53125 6.53125 5.99959 6.53125 5.34375C6.53125 4.68791 5.99959 4.15625 5.34375 4.15625C4.68791 4.15625 4.15625 4.68791 4.15625 5.34375C4.15625 5.99959 4.68791 6.53125 5.34375 6.53125Z" fill="currentColor"/>
      <path d="M11.875 7.125L7.125 11.875" strokeWidth="1.54375" strokeLinecap="round" stroke="currentColor"/>
    </svg>
  );
}

// Not in the Figma icon set: the two arrows of the "Compare to" pill
// (ComparePicker), drawn at the filter icons' 19px in their stroke.
export function CompareIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 19} height={size ?? 19} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M3.5625 6.33333H15.4375M12.6667 3.5625L15.4375 6.33333L12.6667 9.10417" strokeWidth="1.54375" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M15.4375 12.6667H3.5625M6.33333 9.89583L3.5625 12.6667L6.33333 15.4375" strokeWidth="1.54375" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-all-platforms
export function AllPlatformsIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M1.83333 1.375H4.125C4.37813 1.375 4.58333 1.5802 4.58333 1.83333V4.125C4.58333 4.37813 4.37813 4.58333 4.125 4.58333H1.83333C1.5802 4.58333 1.375 4.37813 1.375 4.125V1.83333C1.375 1.5802 1.5802 1.375 1.83333 1.375Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.87502 1.375H9.16669C9.41982 1.375 9.62502 1.5802 9.62502 1.83333V4.125C9.62502 4.37813 9.41982 4.58333 9.16669 4.58333H6.87502C6.62189 4.58333 6.41669 4.37813 6.41669 4.125V1.83333C6.41669 1.5802 6.62189 1.375 6.87502 1.375Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.87502 6.41669H9.16669C9.41982 6.41669 9.62502 6.62189 9.62502 6.87502V9.16669C9.62502 9.41982 9.41982 9.62502 9.16669 9.62502H6.87502C6.62189 9.62502 6.41669 9.41982 6.41669 9.16669V6.87502C6.41669 6.62189 6.62189 6.41669 6.87502 6.41669Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M1.83333 6.41669H4.125C4.37813 6.41669 4.58333 6.62189 4.58333 6.87502V9.16669C4.58333 9.41982 4.37813 9.62502 4.125 9.62502H1.83333C1.5802 9.62502 1.375 9.41982 1.375 9.16669V6.87502C1.375 6.62189 1.5802 6.41669 1.83333 6.41669Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-web-funnel
export function WebFunnelIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M5.73451 1.66669C4.67221 1.66669 3.78331 2.04503 3.16161 2.71182C2.54232 3.37603 2.21259 4.29983 2.21259 5.35076V5.82815H14.8786V5.35076C14.8786 4.30029 14.5508 3.37644 13.9323 2.71201C13.3113 2.04489 12.4224 1.66669 11.3574 1.66669H5.73451ZM4.73863 3.86721C4.46249 3.86721 4.23863 4.09107 4.23863 4.36721C4.23863 4.64335 4.46249 4.86721 4.73863 4.86721H4.7756C5.05174 4.86721 5.2756 4.64335 5.2756 4.36721C5.2756 4.09107 5.05174 3.86721 4.7756 3.86721H4.73863ZM6.39563 3.86721C6.11949 3.86721 5.89563 4.09107 5.89563 4.36721C5.89563 4.64335 6.11949 4.86721 6.39563 4.86721H6.43261C6.70875 4.86721 6.93262 4.64335 6.93262 4.36721C6.93262 4.09107 6.70875 3.86721 6.43261 3.86721H6.39563ZM8.05329 3.86721C7.77715 3.86721 7.55329 4.09107 7.55329 4.36721C7.55329 4.64335 7.77715 4.86721 8.05329 4.86721H8.09022C8.36642 4.86721 8.59022 4.64335 8.59022 4.36721C8.59022 4.09107 8.36642 3.86721 8.09022 3.86721H8.05329Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
      <path d="M2.21259 10.6486V6.82812H14.8786V10.6486C14.8786 11.6991 14.5508 12.6229 13.9322 13.2874C13.3111 13.9545 12.422 14.3327 11.3567 14.3327H5.73451C4.66951 14.3327 3.78043 13.9545 3.15927 13.2874C2.54061 12.623 2.21259 11.6991 2.21259 10.6486ZM5.62372 8.49339C5.34757 8.49339 5.12372 8.71726 5.12372 8.99339C5.12372 9.26959 5.34757 9.49339 5.62372 9.49339H8.10415C8.38029 9.49339 8.60415 9.26959 8.60415 8.99339C8.60415 8.71726 8.38029 8.49339 8.10415 8.49339H5.62372ZM5.62372 10.7903C5.34757 10.7903 5.12372 11.0141 5.12372 11.2903C5.12372 11.5665 5.34757 11.7903 5.62372 11.7903H10.1714C10.4476 11.7903 10.6714 11.5665 10.6714 11.2903C10.6714 11.0141 10.4476 10.7903 10.1714 10.7903H5.62372Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}

// Figma: icon-combined
export function CombinedViewIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath="url(#clip0_370_19542)">
      <path d="M5.88014 0.999168C5.76071 0.944694 5.63098 0.916504 5.49972 0.916504C5.36846 0.916504 5.23873 0.944694 5.1193 0.999168L1.19139 2.78667C1.11005 2.82253 1.04091 2.88127 0.99236 2.95573C0.943815 3.03019 0.917969 3.11716 0.917969 3.20604C0.917969 3.29493 0.943815 3.3819 0.99236 3.45636C1.04091 3.53082 1.11005 3.58956 1.19139 3.62542L5.12389 5.4175C5.24331 5.47197 5.37304 5.50016 5.5043 5.50016C5.63556 5.50016 5.76529 5.47197 5.88472 5.4175L9.81722 3.63C9.89855 3.59414 9.9677 3.5354 10.0162 3.46094C10.0648 3.38648 10.0906 3.29951 10.0906 3.21063C10.0906 3.12174 10.0648 3.03477 10.0162 2.96031C9.9677 2.88585 9.89855 2.82711 9.81722 2.79125L5.88014 0.999168Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M0.916016 5.5C0.9158 5.58766 0.940728 5.67355 0.987846 5.74748C1.03496 5.8214 1.10229 5.88026 1.18185 5.91708L5.12352 7.70917C5.24232 7.76296 5.37123 7.79079 5.50164 7.79079C5.63205 7.79079 5.76097 7.76296 5.87977 7.70917L9.81227 5.92167C9.8934 5.8852 9.96216 5.82592 10.0102 5.75104C10.0582 5.67617 10.0834 5.58894 10.0827 5.5" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M0.916016 7.79169C0.9158 7.87935 0.940728 7.96524 0.987846 8.03916C1.03496 8.11309 1.10229 8.17195 1.18185 8.20877L5.12352 10.0009C5.24232 10.0546 5.37123 10.0825 5.50164 10.0825C5.63205 10.0825 5.76097 10.0546 5.87977 10.0009L9.81227 8.21335C9.8934 8.17689 9.96216 8.1176 10.0102 8.04273C10.0582 7.96786 10.0834 7.88063 10.0827 7.79169" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_370_19542">
      <rect width="11" height="11" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
}

// Figma: icon-per-app
export function PerAppViewIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M1.83333 1.375H4.125C4.37813 1.375 4.58333 1.5802 4.58333 1.83333V4.125C4.58333 4.37813 4.37813 4.58333 4.125 4.58333H1.83333C1.5802 4.58333 1.375 4.37813 1.375 4.125V1.83333C1.375 1.5802 1.5802 1.375 1.83333 1.375Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.87435 1.375H9.16602C9.41915 1.375 9.62435 1.5802 9.62435 1.83333V4.125C9.62435 4.37813 9.41915 4.58333 9.16602 4.58333H6.87435C6.62122 4.58333 6.41602 4.37813 6.41602 4.125V1.83333C6.41602 1.5802 6.62122 1.375 6.87435 1.375Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M6.87435 6.41669H9.16602C9.41915 6.41669 9.62435 6.62189 9.62435 6.87502V9.16669C9.62435 9.41982 9.41915 9.62502 9.16602 9.62502H6.87435C6.62122 9.62502 6.41602 9.41982 6.41602 9.16669V6.87502C6.41602 6.62189 6.62122 6.41669 6.87435 6.41669Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M1.83333 6.41669H4.125C4.37813 6.41669 4.58333 6.62189 4.58333 6.87502V9.16669C4.58333 9.41982 4.37813 9.62502 4.125 9.62502H1.83333C1.5802 9.62502 1.375 9.41982 1.375 9.16669V6.87502C1.375 6.62189 1.5802 6.41669 1.83333 6.41669Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-line
export function LineViewIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath="url(#clip0_370_19560)">
      <path d="M7.33398 3.20831H10.084V5.95831" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M10.0827 3.20831L6.18685 7.10415L3.89518 4.81248L0.916016 7.79165" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_370_19560">
      <rect width="11" height="11" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
}

// Figma: icon-bar
export function BarViewIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M2.29102 9.625V6.875" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M5.5 9.625V1.375" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M8.70898 9.625V4.125" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
    </svg>
  );
}

// Figma: icon-pie
export function PieViewIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 11} height={size ?? 11} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath="url(#clip0_370_19573)">
      <path d="M9.62546 5.50002C9.87846 5.50002 10.0861 5.29423 10.0609 5.04261C9.95521 3.99035 9.48891 3.00701 8.74102 2.2593C7.99314 1.51158 7.0097 1.0455 5.95742 0.940066C5.70533 0.914858 5.5 1.12248 5.5 1.37548V5.04215C5.5 5.16371 5.54829 5.28029 5.63424 5.36624C5.7202 5.45219 5.83678 5.50048 5.95833 5.50048L9.62546 5.50002Z" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      <path d="M9.72078 7.28289C9.4292 7.97245 8.97314 8.58007 8.39248 9.05265C7.81181 9.52524 7.12422 9.84838 6.38982 9.99383C5.65541 10.1393 4.89656 10.1026 4.1796 9.88705C3.46264 9.67147 2.8094 9.28355 2.277 8.75719C1.7446 8.23083 1.34924 7.58207 1.12549 6.86762C0.901743 6.15317 0.856416 5.39478 0.993474 4.65877C1.13053 3.92275 1.4458 3.23151 1.91172 2.64549C2.37764 2.05946 2.98002 1.5965 3.6662 1.29706" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_370_19573">
      <rect width="11" height="11" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  );
}

// Figma: logo-organic
export function OrganicIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 17} height={size ?? 17} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M14.8388 2.66098C14.8312 2.53101 14.7761 2.40835 14.6841 2.3163C14.592 2.22424 14.4694 2.16919 14.3394 2.1616C9.28389 1.86476 5.23444 3.3868 3.50787 6.24226C2.9094 7.21904 2.61448 8.35155 2.66053 9.49617C2.69838 10.5534 3.00651 11.6212 3.57627 12.6737L2.28069 13.9686C2.181 14.0683 2.125 14.2035 2.125 14.3445C2.125 14.4855 2.181 14.6207 2.28069 14.7204C2.38037 14.82 2.51557 14.876 2.65655 14.876C2.79752 14.876 2.93272 14.82 3.0324 14.7204L4.32733 13.4248C5.3792 13.9939 6.44768 14.302 7.5042 14.3398C7.57813 14.3425 7.65184 14.3438 7.72533 14.3438C8.79563 14.3467 9.84565 14.0519 10.7581 13.4925C13.6136 11.7659 15.1363 7.71715 14.8388 2.66098ZM10.2103 12.5841C8.69951 13.4991 6.91119 13.5137 5.11623 12.6352L11.0018 6.75027C11.0512 6.70091 11.0903 6.64232 11.117 6.57783C11.1438 6.51334 11.1575 6.44422 11.1575 6.37441C11.1575 6.30461 11.1438 6.23549 11.117 6.171C11.0903 6.10651 11.0512 6.04791 11.0018 5.99855C10.9525 5.9492 10.8939 5.91004 10.8294 5.88333C10.7649 5.85662 10.6958 5.84287 10.626 5.84287C10.5562 5.84287 10.487 5.85662 10.4225 5.88333C10.3581 5.91004 10.2995 5.9492 10.2501 5.99855L4.36518 11.8868C3.48928 10.0938 3.5019 8.30086 4.41631 6.79277C5.88322 4.37094 9.37022 3.0448 13.8002 3.20285C13.9589 7.62949 12.6321 11.1171 10.2103 12.5841Z" fill="currentColor"/>
    </svg>
  );
}

// Figma: logo-non-organic
export function NonOrganicIcon({ size, ...props }: IconProps) {
  return (
    <svg width={size ?? 17} height={size ?? 17} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M8.5 1.59375C7.13408 1.59375 5.79882 1.99879 4.6631 2.75766C3.52737 3.51653 2.64218 4.59514 2.11946 5.85709C1.59674 7.11904 1.45998 8.50766 1.72645 9.84734C1.99293 11.187 2.65069 12.4176 3.61655 13.3835C4.5824 14.3493 5.81298 15.0071 7.15266 15.2735C8.49234 15.54 9.88096 15.4033 11.1429 14.8805C12.4049 14.3578 13.4835 13.4726 14.2423 12.3369C15.0012 11.2012 15.4063 9.86593 15.4063 8.5C15.4043 6.66894 14.6761 4.91343 13.3813 3.61868C12.0866 2.32393 10.3311 1.59568 8.5 1.59375ZM14.3438 8.5C14.3451 9.86633 13.8653 11.1895 12.9884 12.2373L4.76266 4.01094C5.61598 3.30104 6.65383 2.84886 7.75478 2.7073C8.85572 2.56575 9.9742 2.74068 10.9794 3.21162C11.9845 3.68257 12.8347 4.43005 13.4305 5.36659C14.0264 6.30313 14.3431 7.39 14.3438 8.5ZM2.65625 8.5C2.65489 7.13367 3.13474 5.8105 4.0116 4.76266L12.2373 12.9891C11.384 13.699 10.3462 14.1511 9.24523 14.2927C8.14429 14.4343 7.0258 14.2593 6.02066 13.7884C5.01551 13.3174 4.16528 12.57 3.56946 11.6334C2.97365 10.6969 2.65689 9.61 2.65625 8.5Z" fill="currentColor"/>
    </svg>
  );
}
