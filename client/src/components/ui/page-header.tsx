import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

function PageHeader({ 
  title, 
  description, 
  breadcrumbs,
  actions,
  children
}: PageHeaderProps) {
  return (
    <div className="space-y-2">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
              )}
              <Link 
                href={crumb.href}
                className={`hover:text-primary transition-colors ${
                  index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          {title && <PageHeaderHeading>{title}</PageHeaderHeading>}
          {description && <PageHeaderDescription>{description}</PageHeaderDescription>}
          {children}
        </div>
        
        {actions && (
          <PageActions>
            {actions}
          </PageActions>
        )}
      </div>
    </div>
  );
}

function PageHeaderHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("text-3xl font-bold tracking-tight", className)}
      {...props}
    />
  )
}

function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-muted-foreground mt-1", className)}
      {...props}
    />
  )
}

function PageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center space-x-3", className)}
      {...props}
    />
  )
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription, PageActions }