const ContentTypeValues = {
  Button : "button", 
  Image: "img",
  Map: "map",
  Text: "text",
  Badge: "badge",
  Number: "number",
  Function: "function"

}  as const;

export type ContentType = typeof ContentTypeValues[keyof typeof ContentTypeValues];
export const ContentType = ContentTypeValues;


export interface TableProps {
  data: unknown[];
  cols: TableColumn[];
  totalCount?: number;
  excelExport?: boolean;
  checkBox?: boolean;
  onRowSelect?: (selectedRows: unknown[]) => void;
}

export interface TableColumn {
  uniqueId?: string;
  title?: React.ReactNode;
  key?: string;
  width?: string;
  type?: ContentType;
  htmlFunc?:
  | React.FC<unknown>
  | ((row: unknown, index: number) => React.ReactNode)
  | ((row: unknown) => React.ReactNode)
  excelFunc?: (row: unknown) => unknown;
  buttons?: buttonColProps[];
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

export interface buttonColProps {
  title?: string;
  className?: string;
  onClick?: ((row: unknown) => React.ReactNode);
  visible?: boolean;
  disable?: boolean;
}
export interface ButtonProps {
  data: unknown[];
  buttonList: buttonColProps[];
}

export interface actionColumn {
  visible: boolean;
  disable: boolean;
  onClick: () => void;

}