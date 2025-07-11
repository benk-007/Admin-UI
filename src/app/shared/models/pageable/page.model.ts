import {SortModel} from "./sort.model";
import {PageableModel} from "./pageable.model";

export class PageModel<T> {
  public content: T[] = [];
  public pageable: PageableModel = new PageableModel();
  public last: boolean = true;
  public totalPages: number = 0;
  public totalElements: number = 0;
  public first: boolean = false;
  public size: number = 20;
  public number: number = 0;
  public numberOfElements: number = 0;
  public empty: boolean = true;
  public sort: SortModel = new SortModel;
}
