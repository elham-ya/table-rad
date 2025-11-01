const cols = [
    {
        uniqueId:"clientId",
        title: "توضیحات",
        key: "clientId",
        width:"200",
        type:"text",
    },
    {
      uniqueId:"price",
      title: "strings.action",
      key: "updated.user_name",                                                                                                                                                                                                                                                                                                 
      width: "200",
      type: "TYPES.FUNCTION",
      htmlFunc: () => {
        return "1,000,000 rial";
      },
      excelFunc: () => {
        return 1000000;
      },
    },
    {
      uniqueId: "billNumber",
      title: ""
    }
];

{/* <Table
  isSizeSelectable
  options={options}
  data={prepareListForShowMap(list.result)}
  excelExport
  excelHeader={generateExcelHeader(cols, [strings.action, strings.editable])}
  keyField='id'
  cols={cols}
  totalCount={totalCount}
  size={this.state.size}
  sizes={PAGE_SIZES}
  onSizeChange={this.onSizeChange}
  page={Number(history.location.query.page) || 1}
  pageSelect={this.pageSelect}
  selectRow={selectRowProp}
  height={300}
  ActionComponent={actionComponent}
/> */}