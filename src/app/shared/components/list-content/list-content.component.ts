import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, debounceTime, distinctUntilChanged, pipe, skip, Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {filter, tap} from "rxjs/operators";
import moment from "moment";
import {PageChangedEvent} from "ngx-bootstrap/pagination";
import {UtilsService} from "../../services/utils.service";

@Component({
  selector: 'app-list-content',
  templateUrl: './list-content.component.html',
  styleUrl: './list-content.component.scss',
  imports: []
})
export class ListContentComponent implements OnInit, OnDestroy {

  advancedSearchFields: any = {};
  listContent!: any[];
  listParamValidator: any = {};
  currentParam = {};
  isInfiniteList: boolean = false;
  isListEmpty!: boolean;
  firstCallDone!: boolean;
  hasNext: boolean = false;
  hasPrevious: boolean = false;

  // List display variables
  totalElements!: number;
  numberOfElements!: number;
  currentNumberOfElements!: number;
  rotate = false;
  pageDisplayed = 1;
  page: number = 0;

  size = 20;
  sort = '';
  sortDirection = '';
  search!: string;

  // Search variables
  isSearchActive!: boolean;
  isAdvancedSearchDisplayed!: boolean;
  advancedSearchForm!: FormGroup;

  private readonly $basicSearchSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  basicSearch: string = '';

  // Other variables
  subscriptions: Subscription[] = [];
  httpSubscriptions: Subscription[] = [];

  constructor(public router: Router,
              public route: ActivatedRoute) {
  }

  /**
   * This method is fired when the component is initialized.
   * It initialize boolean state variable and call to subscribeToBasicSearch.
   */
  ngOnInit(): void {
    this.isInfiniteList = false;
    this.isAdvancedSearchDisplayed = false;
    this.isSearchActive = false;
    this.isListEmpty = true;
    this.firstCallDone = false;

    this.subscribeToBasicSearch();
  }


  /**
   * Subscribe to queryParamMap observable of the Angular Router.
   * At every change in the url's query params the method cleanListParam is called.
   * If the query params are valid the list content is retrieved and the list display variables are updated.
   * If the query params are not valid the url's query params are updated with the params cleaned.
   * This method should be called in the initialization of the children component.
   */
  subscribeToQueryParam(): void {
    this.route.queryParamMap.subscribe(param => {
      console.log('your query param map is:', param);
    })

    this.subscriptions.push(this.route.queryParamMap.subscribe((param: any) => {
        const [isParamsValid, paramsCleaned] = this.cleanListParam(param.params);
        console.log('your params cleaned are:', paramsCleaned, isParamsValid);
        if (isParamsValid) {
          this.updateParamListDisplay(paramsCleaned);
          this.retrieveListContent(paramsCleaned);
          this.currentParam = paramsCleaned;
        } else {
          this.updateQueryParam(paramsCleaned);
          this.retrieveListContent(paramsCleaned);
        }
      }
    ));
  }

  /**
   * Update the url's query params.
   * @param params : object of params to be updated in the url's query params.
   */
  updateQueryParam(params: object): void {
    console.log('your params in update query params are:', params);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: false
    });
    // this.page = params.page
  }

  /**
   * Refresh list content by calling retrieveListContent.
   * This method is specially useful in infinite list.
   */
  refreshListContent(): void {
    this.retrieveListContent(this.currentParam);
  }

  handleSuccessData(data: any): void {
    console.log('your data is:', data);
    this.listContent = data.content;
    this.totalElements = data.totalElements;
    this.numberOfElements = data.numberOfElements;
    this.currentNumberOfElements = data.pageable.offset + data.numberOfElements;
    this.isListEmpty = data.empty;
    this.hasNext = !data.last;
    this.hasPrevious = !data.first;
    if (data.totalPages !== 0 && this.pageDisplayed > data.totalPages) {
      this.updateQueryParam({page: data.totalPages})
    }
    this.firstCallDone = true;
  }

  /**
   * Clean params argument trough listParamValidator variable.
   * Iterate over every value in params object.
   * If the param is not included in listParamValidator the param is set to null and the variable isParamsValid is set to false.
   * If the param does not pass the test specified in listParamValidator the param is set to null and the variable isParamsValid is set to false.
   * Four tests can be specified in listParamValidator : regex, date range, boolean and array.
   * Return isParamsValid and paramsCleaned.
   * @param params : object of query params to be cleaned.
   */
  private cleanListParam(params: any): [boolean, object] {
    const paramsCleaned: any = {};
    let isParamsValid = true;

    Object.keys(params).forEach(param => {
      if (this.listParamValidator.hasOwnProperty(param)) {
        if (this.listParamValidator[param] instanceof RegExp) {
          if (this.listParamValidator[param].test(params[param])) {
            paramsCleaned[param] = params[param];
          } else {
            paramsCleaned[param] = null;
            isParamsValid = false;
          }
        } else if (typeof this.listParamValidator[param] === 'string' && this.listParamValidator[param] === 'rangeDate') {
          // Date range must be in the following format : YYYY-MM-DD,YYYY-MM-DD.
          if (!/^\d{4}(-\d{2}){2},\d{4}(-\d{2}){2}$/.test(params[param])) {
            paramsCleaned[param] = null;
            isParamsValid = false;
          } else if (params[param].split(',').some((date: any) => !moment(date, 'YYYY-MM-DD', true).isValid())) {
            paramsCleaned[param] = null;
            isParamsValid = false;
          } else {
            paramsCleaned[param] = params[param];

          }
        } else if (typeof this.listParamValidator[param] === 'string' && this.listParamValidator[param] === 'boolean') {
          // A boolean param can only be true. If the param is false it will be set to null and removed from the url's query param.
          if (params[param] === 'true') {
            paramsCleaned[param] = true;
          } else {
            paramsCleaned[param] = false;

          }
        } else if (Array.isArray(this.listParamValidator[param])) {
          if (this.listParamValidator[param].includes(params[param])) {
            paramsCleaned[param] = params[param];
          } else {
            paramsCleaned[param] = null;
            isParamsValid = false;
          }
        }
      } else {
        paramsCleaned[param] = null;
        isParamsValid = false;
      }
    });

    return [isParamsValid, paramsCleaned];
  }

  /**
   * Update list display variable with params argument.
   * If the params contain the search key, isSearchActive is set to true and isAdvancedSearchDisplayed is set to false.
   * If an advanced search form is initialized in the children component the method mapQueryParamToAdvancedSearchForm is called.
   * @param params : object of query params.
   */
  public updateParamListDisplay(params: any): void {
    if (params.size) {
      this.size = params.size;
    }

    if (params.page) {
      this.pageDisplayed = parseInt(params.page, 10);
    }

    if (params.sort) {
      console.log('params.sort value is:', params.sort);
      this.sort = params.sort.split(',')[0];
      this.sortDirection = params.sort.split(',')[1];
      console.log('this.sortDirection is:', this.sortDirection, 'and this.sort:', this.sort);
    }

    if (params.search) {
      this.isAdvancedSearchDisplayed = false;
      this.isSearchActive = true;
      this.basicSearch = params.search;
    } else if (this.advancedSearchForm) {
      this.mapQueryParamToAdvancedSearchForm(params);
    }
  }

  /**
   * Map every query param to the corresponding control in the advanced search form.
   * This method can be override for a more specific behavior.
   * @param params : object of query params.
   */
  public mapQueryParamToAdvancedSearchForm(params: any): void {
    Object.keys(params).forEach(paramKey => {
      if (this.advancedSearchForm.contains(paramKey)) {
        if (this.advancedSearchFields[paramKey]) {
          if (this.advancedSearchFields[paramKey].type === 'dateRange') {
            this.advancedSearchForm?.get(paramKey)?.setValue(params[paramKey].split(',').map((date: any) => new Date(date)));
          }

          if (this.advancedSearchFields[paramKey].type === 'boolean') {
            this.advancedSearchForm?.get(paramKey)?.setValue(params[paramKey] === 'true');
          }

          if (this.advancedSearchFields[paramKey].type === 'select') {
            if (typeof params[paramKey] === 'string') {
              this.advancedSearchForm?.get(paramKey)?.setValue(params[paramKey].split(','));
            }

            if (typeof params[paramKey] === 'object') {
              this.advancedSearchForm?.get(paramKey)?.setValue(params[paramKey]);
            }
          }

        } else {
          this.advancedSearchForm?.get(paramKey)?.setValue(params[paramKey]);
        }
        this.isAdvancedSearchDisplayed = true;
        this.isSearchActive = true;
      }
    });
  }

  /**
   * Map the advanced search form value to the query param.
   * This method can be override for a more specific behavior.
   * @param advancedSearchForm : advanced search form value.
   */
  mapAdvancedSearchFormToQueryParam(advancedSearchForm: any): any {
    Object.keys(this.advancedSearchFields).forEach(paramKey => {
      if (advancedSearchForm[paramKey] === null) {
        delete advancedSearchForm[paramKey];
      }

      if (this.advancedSearchFields[paramKey]) {
        if (this.advancedSearchFields[paramKey].type === 'dateRange' && advancedSearchForm[paramKey]) {
          advancedSearchForm[paramKey] = advancedSearchForm[paramKey].map((date: any) => moment(date).format('YYYY-MM-DD')).join();
        }
      }
    });

    return advancedSearchForm;
  }

  /**
   * The purpose of this method is to retrieve the list content with a http call.
   * This method must be override in the children component.
   * @param params : object of query params .
   */
  retrieveListContent(params: any): void {
    this.page = params.page ? params.page - 1 : 0;
    this.size = params.size ? params.size : this.size;
    // this.sortDirection = params.sortDirection ? params.sortDirection : 'desc';
    this.search = params.search ? params.search : null;
  }

  /**
   * Subscribe to the basic search observable.
   * The value is read with a delay of 300ms. A null or an unchanged value is ignored.
   */
  private subscribeToBasicSearch(): void {
    this.subscriptions.push(
      this.$basicSearchSubject.pipe(
        pipe(
          skip(1),
          debounceTime(300),
        ),
        distinctUntilChanged(),
        filter(value => value !== null),
        tap(value => {
          if (value) {
            this.basicSearch = value;
          }
        })
      ).subscribe(value => {
        this.basicSearchCompany(value);
      })
    );
  }

  /**
   * Handle basic search.
   * If the search value length is superior or equal to 3 the search is active and the url's query params are updated.
   * If the search value length is inferior to 3 the search active is set to false and the search query param is removed.
   * @param value : search value.
   */
  basicSearchCompany(value: string): void {
    console.log('Basic search value:', value);  // Log the value here too

    if (value && value.length >= 1) {
      this.isSearchActive = true;
      this.updateQueryParam({page: 1, search: value});
    } else if (this.isSearchActive) {
      // No need to check `(!value || value.length === 0)` again since we're in the `else` block.
      this.isSearchActive = false;
      this.updateQueryParam({page: 1, search: ''});
    }
  }

  /**
   * This method is triggered on every key up on the basic search input field.
   * The value is trim and feed the basic search observable.
   * @param event : event on search input value
   */
  triggerBasicSearch(event: any): void {
    let value = (event.target as HTMLInputElement)?.value;
    if (value) {
      value = value.trim();
    }
    console.log('Triggering basic search with value:', value);  // Add this log
    this.$basicSearchSubject.next(value);
  }

  /**
   * Toggle the state between the advanced and basic search.
   * When the advanced search is hidden the advanced search form is reset and the query params updated.
   * When the advanced search is displayed the basic search is triggered with an empty string.
   */
  toggleAdvancedSearch(): void {
    this.isAdvancedSearchDisplayed = !this.isAdvancedSearchDisplayed;

    if (!this.isAdvancedSearchDisplayed) {
      this.basicSearch = ''
      this.advancedSearchForm.reset();
      if (this.isSearchActive) {
        this.isSearchActive = false;
        this.updateQueryParam({page: 1, ...this.advancedSearchForm.value});
      }
    } else {
      this.triggerBasicSearch('');
    }
  }

  /**
   * Submit method of the advanced search form.
   * Update the url's query params with the advanced search form value.
   * If the list is an infinite list the content is reset at every submit.
   */
  advancedSearchFormSubmit(): void {
    if (this.advancedSearchForm.dirty) {
      this.isSearchActive = true;
      if (this.isInfiniteList) {
        this.pageDisplayed = 0;
        this.updateQueryParam({...this.mapAdvancedSearchFormToQueryParam(this.advancedSearchForm.value)});
      } else {
        this.updateQueryParam({page: 1, ...this.mapAdvancedSearchFormToQueryParam(this.advancedSearchForm.value)});
      }
    }
    this.advancedSearchForm.markAsPristine();
  }

  /**
   * Test if the advanced search form value is empty
   */
  isAdvancedSearchFormEmpty(): boolean {
    let isEmpty: boolean = true;
    for (const value of Object.values(this.advancedSearchForm.value)) {
      if (value !== null) {
        isEmpty = false;
        break;
      }
    }
    return isEmpty;
  }

  /**
   * Update the url's query params with the size variable.
   * This method is fired each time the size select value is changed.
   */
  changeSize($event: any): void {
    console.log('your event is:', $event);
    this.updateQueryParam({page: 1, size: $event});
  }

  /**
   * Update the url's page query param with the given value.
   * @param $event : object with the value of the page and the number of items per page.
   */
  changePage($event: PageChangedEvent): void {
    console.log('your event is:', $event);
    this.killHttpSubscriptions();
    this.updateQueryParam({page: $event.page});
  }

  previous() {
    this.updateQueryParam({page: this.pageDisplayed - 1})
  }

  next() {
    this.updateQueryParam({page: this.pageDisplayed + 1})
  }

  /**
   * Update the url's query param with the given sort value.
   * If the given value is equal to the sort variable the sortDirection is switched between 'asc' and 'desc'.
   * @param value : sort value.
   */
  sortColumn(value: string): void {
    this.killHttpSubscriptions();
    if (this.sort !== value) {
      this.sort = value;
      this.sortDirection = 'asc';
    } else {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    }
    console.log('Sort direction from sort column method is:', this.sortDirection);
    this.updateQueryParam({page: 1, sort: this.sort + ',' + this.sortDirection});
  }

  killHttpSubscriptions(): void {
    this.httpSubscriptions.forEach(value => {
      value.unsubscribe();
    })
  }

  getNameInitials(value: string) {
    return UtilsService.getNameInitials(value);
  }

  /**
   * This method is fired when the component is destroyed.
   * It will clean all the subscriptions made in the component.
   */
  ngOnDestroy(): void {
    console.log('Unsubscribing all subscriptions');
    this.subscriptions.forEach(value => {
      value.unsubscribe()
    });
    this.killHttpSubscriptions();
  }

}
