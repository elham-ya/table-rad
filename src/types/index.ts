export interface TableProps {
    data: any[];
    cols: TableColumn[];
    totalCount?: number;
    excelExport?: boolean;
}

export interface TableColumn {
    uniqueId: string;
    title: string;
    key: string;
    width: string;
    type?: Function | string;
    htmlFunc?: (row: any) => any;
    excelFunc?: (row: any) => any;
}

export interface PaginationProps {
    
}