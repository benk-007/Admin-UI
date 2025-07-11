export interface PageFilterModel {
  page: number;
  size: number;
  sort: string;
  sortDirection: string;
  search: string;
  advancedSearchFormValue?: any;
}
