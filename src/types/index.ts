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
    type?: React.FC<unknown> | string | ((row: unknown) => React.ReactNode);
    htmlFunc?: (row: unknown) => unknown;
    excelFunc?: (row: unknown) => unknown;
}

export interface PaginationProps {
    total?: number;
}

export interface CheckboxProps<T = unknown> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default state for uncontrolled checkbox */
  defaultChecked?: boolean;
  /** Called when the checked state changes */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disable the checkbox */
  disabled?: boolean;
  /** HTML id (important for accessibility) */
  id?: string;
  /** Optional value */
  value?: string;
  /** Optional indeterminate state */
  indeterminate?: boolean;
  /** Optional custom class */
  className?: string;
  /** Called when checkbox value changes */
  onSelect?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => T[];
}

export type CheckboxChangeEvent = React.ChangeEvent<HTMLInputElement>;
