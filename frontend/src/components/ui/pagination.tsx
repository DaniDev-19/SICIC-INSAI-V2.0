import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { PaginationData } from "@/types/pagination";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const { currentPage, totalPages, totalCount, limit } = pagination;
  const isSinglePage = totalPages <= 1;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full flex flex-row flex-wrap items-center justify-center gap-3 px-1 sm:px-2 py-2 animate-in fade-in duration-300 sm:justify-between">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap">
          Mostrando{" "}
          <span className="font-bold text-foreground">
            {totalCount === 0 ? 0 : startItem}-{endItem}
          </span>{" "}
          de <span className="font-bold text-foreground">{totalCount}</span>
        </p>

        {totalCount > 5 && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground tracking-wide">Filas:</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => onLimitChange(parseInt(val, 10))}
            >
              <SelectTrigger className="h-8 sm:h-9 w-16 sm:w-20 text-xs sm:text-sm bg-muted/30 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!isSinglePage && (
        <nav className="flex items-center gap-1 shrink-0 mx-auto sm:mx-0" aria-label="Paginación">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <div key={`ellipsis-${index}`} className="flex h-8 w-6 sm:h-9 sm:w-8 items-center justify-center">
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "ghost"}
                aria-current={currentPage === page ? "page" : undefined}
                className={`h-8 w-8 sm:h-9 sm:w-9 font-bold text-xs sm:text-sm transition-all duration-300 ${currentPage === page
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : "bg-muted/10 hover:bg-primary/10 hover:text-primary"
                  } cursor-pointer`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  )
}
