import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon } from "lucide-react"

export interface SearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, onSearch, ...props }, ref) => {
    const [value, setValue] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSearch?.(value)
    }

    return (
      <form onSubmit={handleSubmit} className="relative w-full">
        <Input
          {...props}
          type="search"
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "pl-3 pr-12",
            className
          )}
        />
        <Button 
          type="submit"
          variant="ghost" 
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>
    )
  }
)
Search.displayName = "Search"

export { Search }
