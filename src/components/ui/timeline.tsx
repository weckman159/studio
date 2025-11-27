"use client";

import { cn } from "@/lib/utils";
import React from "react";

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<"ol">
>((props, ref) => (
  <ol
    ref={ref}
    {...props}
    className={cn("flex flex-col", props.className)}
  />
));
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>((props, ref) => (
  <li
    ref={ref}
    {...props}
    className={cn("relative flex flex-1 gap-4", props.className)}
  />
));
TimelineItem.displayName = "TimelineItem";

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>((props, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      "absolute left-[0.55rem] top-[0.55rem] h-full w-px -translate-x-1/2 bg-border",
      "group-last/item:h-[calc(0.55rem+1px)]",
      props.className
    )}
  />
));
TimelineConnector.displayName = "TimelineConnector";

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>((props, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      "flex items-center gap-4",
      props.className
    )}
  />
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ children, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      "z-10 flex size-5 items-center justify-center rounded-full bg-border text-xs text-foreground",
      props.className
    )}
  >
    {children}
  </div>
));
TimelineIcon.displayName = "TimelineIcon";

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h3">
>((props, ref) => (
  <h3
    ref={ref}
    {...props}
    className={cn("font-medium", props.className)}
  />
));
TimelineTitle.displayName = "TimelineTitle";

const TimelineTime = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>((props, ref) => (
  <p
    ref={ref}
    {...props}
    className={cn("hidden text-sm text-muted-foreground sm:block", props.className)}
  />
));
TimelineTime.displayName = "TimelineTime";

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>((props, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      "flex-1 pb-8 pl-[2.5rem]",
      "group-last/item:pb-0",
      props.className
    )}
  />
));
TimelineContent.displayName = "TimelineContent";

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>((props, ref) => (
  <p
    ref={ref}
    {...props}
    className={cn("text-sm text-muted-foreground", props.className)}
  />
));
TimelineDescription.displayName = "TimelineDescription";

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineTime,
  TimelineContent,
  TimelineDescription,
};
