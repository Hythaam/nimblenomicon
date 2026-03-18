export interface DocSearchRecord {
  id: string;
  title: string;
  url: string;
  breadcrumbs: string;
  body: string;
  headings: string;
}

export function buildDocsIndex(records: DocSearchRecord[]) {
  return records;
}
