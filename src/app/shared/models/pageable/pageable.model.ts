import {SortModel} from "./sort.model";

export class PageableModel {
  public sort: SortModel = new SortModel();
  public offset: number = 0;
  public pageNumber: number = 0;
  public pageSize: number = 20;
  public paged: boolean = true;
  public unpaged: boolean = false;
}
