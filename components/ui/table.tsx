import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type TableAlign = 'left' | 'center' | 'right';

export interface TableHeaderItem {
  label: React.ReactNode;
  align?: TableAlign;
  className?: string;
  width?: string | number;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: React.ReactNode;
  align?: TableAlign;
  className?: string;
  headerClassName?: string;
  cell?: (item: T, rowIndex: number) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>>
  extends React.TableHTMLAttributes<HTMLTableElement> {
  headers?: (React.ReactNode | TableHeaderItem)[];
  rows?: React.ReactNode[][];
  columns?: TableColumn<T>[];
  data?: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: React.ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  containerClassName?: string;
}

const alignStyles: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Table = React.forwardRef<HTMLTableElement, TableProps<Record<string, unknown>>>(
  (
    {
      headers,
      rows,
      columns,
      data,
      keyExtractor,
      emptyMessage = 'No hay datos disponibles',
      striped = false,
      hoverable = true,
      bordered = false,
      containerClassName,
      className,
      children,
      ...props
    },
    ref
  ) => {
    if (children) {
      return (
        <div className={cn('w-full overflow-x-auto', containerClassName)}>
          <table
            ref={ref}
            className={cn('w-full text-left border-collapse text-sm text-gray-700', className)}
            {...props}
          >
            {children}
          </table>
        </div>
      );
    }

    const hasColumns = columns && columns.length > 0;
    const hasHeaders = headers && headers.length > 0;
    const hasTypedData = hasColumns && Array.isArray(data);
    const hasDirectRows = Array.isArray(rows);

    const totalColumns = hasColumns ? columns.length : hasHeaders ? headers.length : 0;
    const isEmpty = hasTypedData ? data.length === 0 : hasDirectRows ? rows.length === 0 : true;

    return (
      <div className={cn('w-full overflow-x-auto', containerClassName)}>
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse text-sm text-gray-700',
            bordered && 'border border-gray-200',
            className
          )}
          {...props}
        >
          {(hasHeaders || hasColumns) && (
            <thead>
              <tr className="border-b border-gray-200/90 text-xs sm:text-sm font-semibold text-gray-600">
                {hasColumns
                  ? columns.map((col, index) => (
                      <th
                        key={col.key || index}
                        scope="col"
                        className={cn(
                          'py-3.5 px-4 font-semibold text-gray-600 tracking-tight',
                          alignStyles[col.align || 'left'],
                          bordered && 'border-r border-gray-200 last:border-r-0',
                          col.headerClassName
                        )}
                      >
                        {col.header}
                      </th>
                    ))
                  : headers?.map((header, index) => {
                      const isItem =
                        typeof header === 'object' && header !== null && 'label' in header;
                      const label = isItem ? (header as TableHeaderItem).label : header;
                      const align = isItem
                        ? (header as TableHeaderItem).align || 'left'
                        : 'left';
                      const customClass = isItem
                        ? (header as TableHeaderItem).className
                        : undefined;
                      const width = isItem ? (header as TableHeaderItem).width : undefined;

                      return (
                        <th
                          key={index}
                          scope="col"
                          style={width ? { width } : undefined}
                          className={cn(
                            'py-3.5 px-4 font-semibold text-gray-600 tracking-tight',
                            alignStyles[align],
                            bordered && 'border-r border-gray-200 last:border-r-0',
                            customClass
                          )}
                        >
                          {label}
                        </th>
                      );
                    })}
              </tr>
            </thead>
          )}

          <tbody className="divide-y divide-gray-100">
            {isEmpty ? (
              <tr>
                <td
                  colSpan={totalColumns || 1}
                  className="py-8 px-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : hasTypedData ? (
              data.map((item, rowIndex) => {
                const itemRecord = item as Record<string, unknown>;
                const rowKey = keyExtractor
                  ? keyExtractor(item, rowIndex)
                  : typeof itemRecord?.id === 'string' || typeof itemRecord?.id === 'number'
                  ? itemRecord.id
                  : rowIndex;

                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      'transition-colors duration-100',
                      striped && rowIndex % 2 === 1 && 'bg-gray-50/60',
                      hoverable && 'hover:bg-gray-50/80'
                    )}
                  >
                    {columns.map((col, colIndex) => {
                      const fallbackContent =
                        typeof itemRecord?.[col.key] === 'string' ||
                        typeof itemRecord?.[col.key] === 'number'
                          ? String(itemRecord[col.key])
                          : null;

                      return (
                        <td
                          key={col.key || colIndex}
                          className={cn(
                            'py-3.5 px-4 text-sm align-middle',
                            alignStyles[col.align || 'left'],
                            bordered && 'border-r border-gray-200 last:border-r-0',
                            col.className
                          )}
                        >
                          {col.cell ? col.cell(item, rowIndex) : fallbackContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : hasDirectRows ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'transition-colors duration-100',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50/60',
                    hoverable && 'hover:bg-gray-50/80'
                  )}
                >
                  {row.map((cell, colIndex) => {
                    const headerConfig = headers?.[colIndex];
                    const align =
                      typeof headerConfig === 'object' &&
                      headerConfig !== null &&
                      'align' in headerConfig
                        ? (headerConfig as TableHeaderItem).align || 'left'
                        : 'left';

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          'py-3.5 px-4 text-sm align-middle',
                          alignStyles[align],
                          bordered && 'border-r border-gray-200 last:border-r-0'
                        )}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('border-b border-gray-200/90 text-sm font-semibold text-gray-600', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-gray-100', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition-colors hover:bg-gray-50/80', className)} {...props} />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('py-3.5 px-4 text-left font-semibold text-gray-600 tracking-tight', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('py-3.5 px-4 text-sm align-middle', className)} {...props} />
));
TableCell.displayName = 'TableCell';
