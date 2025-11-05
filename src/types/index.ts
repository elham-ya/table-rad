export interface TableProps {
  data: unknown[];
  cols: TableColumn[];
  totalCount?: number;
  excelExport?: boolean;
  checkBox?: boolean;
  onRowSelect?: (selectedRows: unknown[]) => void;
}

export interface TableColumn {
  uniqueId: string;
  title: React.ReactNode;
  key: string;
  width: string;
  type?:
    | React.FC<unknown>
    | string
    | ((row: unknown) => React.ReactNode)
    | ((row: unknown, index: number) => React.ReactNode);
  htmlFunc?: (row: unknown) => unknown;
  excelFunc?: (row: unknown) => unknown;
}

export interface PaginationProps {
  total?: number;
}

export interface CheckboxProps<T = unknown> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  uniqueId?: string;
  value?: string;
  indeterminate?: boolean;
  className?: string;
  onSelect?: (
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => T[];
}

export type CheckboxChangeEvent = React.ChangeEvent<HTMLInputElement>;
