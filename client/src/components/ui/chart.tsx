import * as React from "react"

import { cn } from "@/lib/utils"

// Chart Container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, any>
    children: React.ComponentProps<"div">["children"]
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-chart=""
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/40 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id="chart" config={config} />
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

// Chart Style
const ChartStyle = ({ id, config }: { id: string; config?: Record<string, any> }) => {
  const colorConfig = config || {}

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(colorConfig)
          .map(
            ([key, value]: [string, any]) => `
          [data-chart="${id}"] .color-${key} { color: ${value?.color || value}; }
          [data-chart="${id}"] .bg-${key} { background-color: ${value?.color || value}; }
        `
          )
          .join("\n"),
      }}
    />
  )
}

// Chart Tooltip
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

// Chart Tooltip Content
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ className, children, hideLabel, hideIndicator, indicator = "dot", nameKey, labelKey, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-1.5 rounded-lg border bg-background p-2.5 text-xs shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart Legend
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    />
  )
})
ChartLegend.displayName = "ChartLegend"

// Chart Legend Content
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    nameKey?: string
  }
>(({ className, nameKey, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
