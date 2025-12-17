import { Table, Pagination, Form, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  pagination,
  onSort,
  striped = true,
  hover = true,
  bordered = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return ' ↕️';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive">
        <Table striped={striped} hover={hover} bordered={bordered}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width, cursor: column.sortable ? 'pointer' : 'default' }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {column.sortable && onSort && renderSortIcon(column.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Row className="align-items-center mt-3">
          <Col md={6}>
            {pagination.onPageSizeChange && (
              <div className="d-flex align-items-center">
                <span className="me-2">Show:</span>
                <Form.Select
                  size="sm"
                  style={{ width: 'auto' }}
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
                <span className="ms-2">entries</span>
              </div>
            )}
          </Col>
          <Col md={6}>
            <Pagination className="justify-content-end mb-0">
              <Pagination.First
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              />
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <Pagination.Item
                    key={pageNum}
                    active={pageNum === pagination.currentPage}
                    onClick={() => pagination.onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              })}

              <Pagination.Next
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
              <Pagination.Last
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default DataTable;
