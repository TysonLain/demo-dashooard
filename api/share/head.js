export const pageLabels = [
    {
      text: "標題*",
      type: "text",
      value: "title",
      valid: ["required"],
    },
    {
      text: "英文標題*",
      type: "text",
      value: "titleEn",
      valid: ["required"],
    },
    {
      text: " url*",
      type: "text",
      value: "url",
      valid: ["required"],
    },
    {
      text: "Header排序",
      type: "number",
      value: "headerSort",
    },
    {
      text: "Footer排序",
      type: "number",
      value: "footerSort",
    },
    {
      text: "分類",
      type: "select",
      value: "type",
      itemsValue: "value",
      itemsText: "text",
      items: [
        { text: "全部", value: "A" },
        { text: "首頁", value: "H" },
        { text: "頁尾", value: "F" },
      ],
    },
  ];



  export default {
    pageLabels
}