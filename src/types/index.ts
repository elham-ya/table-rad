export const ContentType = {
  Button: "button",
  Image: "img",
  Map: "map",
  Text: "text",
  Badge: "badge",
  Number: "number",
  Function: "function",
  Price: "price"
} as const;

export type ContentType = string;

type AppConfig = {
  "Access-Token": string;
  "Client-Id": string;
  url: string;
};

export interface TableProps {
  id: string;
  data: unknown[];
  cols: TableColumn[];
  totalCount?: number;
  excelExport?: boolean;
  checkBox?: boolean;
  onRowSelect?: (selectedRows: unknown[]) => void;
  onPageChange?:(pageNumber: number) => void;
  onSizeChange?:(pageNumber: number) => void;
  requestConfig: AppConfig;
  pageSizeOptions?: number[];
  onExcelExportClick?: () => void;
  allDataForExport?: unknown[];
  exportProgress?: number;
  isExporting?: boolean; 
  exportMessage?: 'success' | 'error' | 'cancelled' | null;
  size?: number;
  onCancelExport?: () => void;
}

export interface TableColumn {
  uniqueId: string;
  defaultTitle?: string;
  title: React.ReactNode;
  key?: string;
  width?: string;
  type?: ContentType;

  htmlFunc?:
  | React.FC<any>
  | ((row: any, index: number) => React.ReactNode)
  | ((row: any) => React.ReactNode)
  | React.ReactNode;


  excelFunc?: (row: unknown) => unknown;
  buttons?: buttonColProps[];
  visible: boolean;
  excel: boolean;
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
export interface TablePaginationProps {
  totalCount: number;       
  pageNumber: number;        
  size: number;              
  onPageChange: (page: number) => void; 
  onSizeChange?: (size: number) => void;  
  pageSizeOptions?: number[];  
  showSizeChanger?: boolean; 
  showTotal?: boolean;  
  className?: string;
}
export interface SettingModalProps {
  tableName: string;
  isOpen: boolean;
  toggle: () => void;
  columns:TableColumn[];
  requestConfig: AppConfig;
  apiConfigData: any;
  onGetData: (data:any) => void
}
export interface rowProps {
  uniqueId: string;
  title: React.ReactNode;
  defaultTitle?: string;
  key?: string;
  width?: string;
  excel: boolean; 
  type?: ContentType;
  visible : boolean;
}
export interface SortableItemProps {
  id: string;
  key?: string;
  row: rowProps;
  onChangeTitle: (x: string, y:string) => void;
  onChangeWidth: (x: string, y:string) => void;
  onChangeVisibility: (x: boolean, y:string) => void;
  onChangeExcelExport: (x: boolean, y:string) => void;
  config: any;
  tableId: string
}
interface GeneralSettings {
  cashDeskQrPrintType: string[];
  managementQrPrintType: string[];
  cashDeskInvoicePrintType: string;
  managementInvoicePrintType: string;
}

type ColumnProps = Record<string, any>; 

type TableConfig = {
  columns?: ColumnProps[];
  [key: string]: any;
};

type Tables = Record<string, TableConfig>;
export interface SettingProps {
  generalSettings: GeneralSettings;
  tables: Tables
}
export interface ApiResponse {
  aggregations: number;
  hasError: boolean;
  errorCode: number;
  refId: string;
  message: unknown[];
  count: number;
  metaData: unknown[];
  referenceNumber: number;
  result: Array<{
    setting: SettingProps;
    created: { at: number; user_name: string; ssoId: number };
    updated: { at: number; user_name: string; ssoId: number };
    post_unique: string;
  }>;
}
export interface TableSchema {
  columns: (ColumnProps | null)[];
}

export type FinalColumnProps =Record<string, TableSchema>;
 

