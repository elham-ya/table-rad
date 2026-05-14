export const ContentType = {
  Button: "button",
  Image: "img",
  Map: "map",
  Text: "text",
  Badge: "badge",
  Number: "number",
  Function: "function",
  Price: "price",
  Time: "time",
  DateTime: "datetime",
  Date: "date",
} as const;

export type ContentType = string;

type AppConfig = {
  "Access-Token": string;
  "Client-Id": string;
  url: string;
};

interface ExcelExportResponse<T = unknown> {
  aggregation: number;
  count: number;
  errorCode: number;
  hasError: boolean;
  message: string[];
  metaDate: unknown[];
  refId: string;
  referenceNumber: string;
  result: T[];
}

type translateProp = Record<string, string> | null;
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
  size?: number;
  onExcelExportRequest?: (offset: number, signal:AbortSignal) => Promise<ExcelExportResponse>;
  translates?: translateProp;
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
  actions?: ActionItem[];

  visible: boolean;
  excel: boolean;
  format?: string;
  value?: any;
  translate?: boolean;
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
export interface ActionItem {
  uniqueId?: string;
  title: string;
  icon?: string | React.ReactNode;
  href?: string;
  target?: '_blank' | '_self';
  onClick?: ((row: unknown) => React.ReactNode);
  className?: string;
  disable?: boolean;
}
export interface ButtonActionProps {
  row: any;
  actions: ActionItem[];
  strings?: translateProp
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

export interface DateTimeProps {
  value: string, 
  format?: string, // format:"YYYY/MM/DD HH:mm:ss",
  type?: string, // type: "date-date/time-time",
  strings?: translateProp
}
export interface TextProps {
  value: String | Number,
  strings?: translateProp,
  translate? : boolean
}

export type TagItem = {
  value: string;
  class: string;
  extraValue?: string;
};
export type TagProps =  {
  value?: TagItem | TagItem[];
  strings?: Record<string, string> | null;
  translate?: boolean;
};

export type NumberProps = {
  value: string | number
}

export type PriceProps = {
  value: string | number;
  strings?: translateProp
}
 

