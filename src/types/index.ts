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

type AppConfig = {
  "Access-Token": string ;
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
  requestConfig: AppConfig
}

export interface TableColumn {
  uniqueId: string ;
  title: React.ReactNode;
  key?: string;
  width?: string;
  type?: ContentType;
  htmlFunc?:
  | React.FC<unknown>
  | ((row: unknown, index: number) => React.ReactNode)
  | ((row: unknown) => React.ReactNode)
  excelFunc?: (row: unknown) => unknown;
  buttons?: buttonColProps[];
  visible: boolean;
  excel: boolean
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
  totalCount: number;        // تعداد کل رکوردها
  pageNumber: number;        // صفحه فعلی (شروع از 1)
  size: number;              // تعداد آیتم در هر صفحه
  onPageChange: (page: number) => void;           // تغییر صفحه
  onSizeChange?: (size: number) => void;          // تغییر سایز (اختیاری)
  pageSizeOptions?: number[];                     // گزینه‌های سایز صفحه [10, 25, 50, 100]
  showSizeChanger?: boolean;                      // نمایش سلکتور سایز؟
  showTotal?: boolean;                            // نمایش "نمایش ۱–۱۰ از ۵۲" ؟
  className?: string;
}

export interface SettingModalProps {
  isOpen: boolean;
  toggle: () => void;
  columns:TableColumn[];
  handleSaveConfig: (data: TableColumn[]) => void
}

export interface SortableItemProps {
  id: string;
  key: string;
  row: any;
  onChangeTitle: (x: string,y:number) => void;
  onChangeWidth:(x: string,y:number) => void;
  onChangeVisibility:(x: boolean,y:number) => void;
  onChangeExcelExport:(x: boolean,y:number) => void;
}

interface GeneralSettings {
  cashDeskQrPrintType: string[];
  managementQrPrintType: string[];
  cashDeskInvoicePrintType: string;
  managementInvoicePrintType: string;
  
}

export interface SettingProps {
  generalSettings: GeneralSettings;
  tables: any[]
}

export interface ApiResponse {
  referenceNumber: number;
  hasError: boolean;
  errorCode: number;
  refId: string;
  message: any[];
  count: number;
  aggregations: number;
  result: Array<{
    setting: SettingProps;
    created: { at: number; user_name: string; ssoId: number };
    updated: { at: number; user_name: string; ssoId: number };
    post_unique: string;
  }>;
  metaData: any[];
}



