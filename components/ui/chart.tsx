import * as React from "react"

export const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className="relative" ref={ref} {...props} />
  },
)
Chart.displayName = "Chart"

export const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className="relative" ref={ref} {...props} />
  },
)
ChartContainer.displayName = "ChartContainer"

export const ChartPie = React.forwardRef<
  SVGSVGElement,
  React.HTMLAttributes<SVGSVGElement> & {
    data: { name: string; value: number; color: string }[]
    cornerRadius?: number
    paddingAngle?: number
  }
>(({ className, data, cornerRadius = 0, paddingAngle = 0, ...props }, ref) => {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  let currentAngle = 0

  return (
    <svg viewBox="0 0 100 100" width="100" height="100" ref={ref} {...props}>
      {data.map((item, index) => {
        const sliceAngle = (item.value / total) * 360
        const midAngle = currentAngle + sliceAngle / 2
        const x = 50 + Math.cos((midAngle * Math.PI) / 180) * 40
        const y = 50 + Math.sin((midAngle * Math.PI) / 180) * 40
        const largeArcFlag = sliceAngle > 180 ? 1 : 0
        const x1 = 50 + Math.cos((currentAngle * Math.PI) / 180) * 50
        const y1 = 50 + Math.sin((currentAngle * Math.PI) / 180) * 50
        const x2 = 50 + Math.cos(((currentAngle + sliceAngle) * Math.PI) / 180) * 50
        const y2 = 50 + Math.sin(((currentAngle + sliceAngle) * Math.PI) / 180) * 50

        const d = `M ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} L 50 50 Z`

        currentAngle += sliceAngle

        return <path key={index} d={d} fill={item.color} stroke="white" strokeWidth={1} />
      })}
    </svg>
  )
})
ChartPie.displayName = "ChartPie"

export const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className="absolute z-10 bg-card border rounded-md shadow-md p-2 text-sm" ref={ref} {...props} />
  },
)
ChartTooltip.displayName = "ChartTooltip"

export const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className="flex items-center justify-center gap-2" ref={ref} {...props} />
  },
)
ChartLegend.displayName = "ChartLegend"

export const ChartLegendItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { color: string }
>(({ className, color, children, ...props }, ref) => {
  return (
    <div className="flex items-center gap-1" ref={ref} {...props}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{children}</span>
    </div>
  )
})
ChartLegendItem.displayName = "ChartLegendItem"
