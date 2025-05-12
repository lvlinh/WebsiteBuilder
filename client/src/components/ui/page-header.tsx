import { cn } from "@/lib/utils"

export function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "flex flex-col items-start gap-2 pb-6",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export function PageHeaderHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight md:text-4xl",
        className
      )}
      {...props}
    />
  )
}

export function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-lg",
        className
      )}
      {...props}
    />
  )
}

export function PageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-4",
        className
      )}
      {...props}
    />
  )
}