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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground font-medium">
          Mostrando <span className="font-bold text-foreground">{totalCount === 0 ? 0 : startItem}-{endItem}</span> de <span className="font-bold text-foreground">{totalCount}</span>
        </p>

        {totalCount > 5 && (
          <div className="flex items-center gap-2 animate-in zoom-in-95 duration-300">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filas:</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => onLimitChange(parseInt(val))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-muted/30 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 animate-in slide-in-from-right-4 duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            page === 'ellipsis' ? (
              <div key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "ghost"}
                className={`h-9 w-9 font-bold transition-all duration-300 ${currentPage === page
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                    : "bg-muted/10 hover:bg-primary/10 hover:text-primary"
                  } cursor-pointer`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>

  )
}
