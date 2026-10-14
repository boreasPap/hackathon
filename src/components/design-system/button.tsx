import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

// Design system buttons (docs/frontend/components/button.md, design doc §8.8).
// Hover / focus are interim values. A disabled primary is designed (grey
// fill, grey text); the other variants keep the interim 40% opacity.

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center font-bomstad whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-body text-accent-contrast hover:bg-accent-hover active:bg-accent-active disabled:bg-line disabled:text-ink-3 disabled:opacity-100",
        secondary:
          "gap-1.5 border border-line-strong text-body-sm text-ink-2 hover:bg-muted [&_svg:not([class*='size-'])]:size-3",
        ghost: "text-body text-ink-2 hover:bg-muted hover:text-ink",
        link: "text-body-sm text-accent-text hover:underline underline-offset-2",
      },
      size: {
        md: "",
        lg: "",
      },
      block: {
        true: "w-full",
      },
    },
    compoundVariants: [
      { variant: ["primary", "ghost"], size: "md", className: "h-8 rounded-sm px-3" },
      { variant: "primary", size: "lg", className: "h-10 rounded-xl px-3" },
      { variant: "ghost", size: "lg", className: "h-10 rounded-sm px-3" },
      { variant: "secondary", className: "h-7.5 rounded-sm px-2.5" },
      { variant: "link", className: "h-auto rounded-xs p-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

const iconButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center text-ink-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        md: "size-7 rounded-md [&_svg:not([class*='size-'])]:size-4",
      },
      bordered: {
        true: "border border-line",
      },
      tone: {
        neutral: "hover:bg-muted hover:text-ink",
        // Destructive actions stay calm until hovered; the caller confirms.
        danger: "text-ink-3 hover:bg-danger-bg hover:text-danger",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "neutral",
    },
  },
);

export type IconButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants> & {
    asChild?: boolean;
    "aria-label": string;
  };

export function IconButton({
  className,
  size,
  bordered,
  tone,
  asChild = false,
  type,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="icon-button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(iconButtonVariants({ size, bordered, tone }), className)}
      {...props}
    />
  );
}
