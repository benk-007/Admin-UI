import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, debounceTime, distinctUntilChanged, Subscription} from 'rxjs';
import {PageFilterModel} from '../../models/page-filter.model';
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from '@ng-select/ng-select';
import {SegmentItemGetModel} from '../../../features/settings/models/segment/segment-item-get.model';
import {CrmApiService} from '../../../features/crm/services/crm-api.service';

@Component({
  selector: 'app-segment-select',
  imports: [
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
    FormsModule
  ],
  templateUrl: './segment-select.component.html',
  styleUrl: './segment-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SegmentSelectComponent),
    }
  ]
})
export class SegmentSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() withParent: undefined | boolean = undefined;
  @Input() multiple = false;
  @Input() disable = false;
  @Input() allowMultiUnit = false;  // Nouveau paramètre pour permettre les MULTI_UNIT si nécessaire
  @Output() updatedUnits = new EventEmitter<SegmentItemGetModel[] | null>();

  segmentSearchList: SegmentItemGetModel[] = [];
  selectedSegments: SegmentItemGetModel[] | null = null;

  $segmentSearch = new BehaviorSubject<string>('');
  private segmentSearchPage = 0;
  private isLastPage = false;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly crmApiService: CrmApiService) {
  }

  ngOnInit(): void {
    this.subscribeToSegmentSearch();
  }

  private subscribeToSegmentSearch() {
    this.subscriptions.push(this.$segmentSearch.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.segmentSearchPage = 0;
      this.isLastPage = false;
      this.retrieveUnitSearchList();
    }))
  }

  private retrieveUnitSearchList() {
    const searchValue = this.$segmentSearch.getValue()?.trim();

    let pageFilter: PageFilterModel = {
      page: this.segmentSearchPage,
      size: 20,
      sort: 'name',
      sortDirection: 'asc',
      search: searchValue,
    };
    if (this.withParent != undefined) {
      let advancedSearchFiler = {
        withParent: this.withParent
      }
      pageFilter = {...pageFilter, advancedSearchFormValue: advancedSearchFiler}
    }

    this.subscriptions.push(
      this.crmApiService.getSegmentsByPage(pageFilter).subscribe({
        next: (res) => {
          console.log('Segments retrieved successfully. API response is:', res);
          if (this.segmentSearchPage === 0) {
            this.segmentSearchList = res.content;
          } else {
            this.segmentSearchList = this.segmentSearchList.concat(res.content);
          }
          this.isLastPage = res.last;
        },
        error: (err) => {
          console.error('An error occurred when retrieving segment list. API error response:', err);
        }
      })
    )
  }

  // Called when user types in search box
  searchUnits($event: { term: string; items: any[] }): void {
    this.segmentSearchPage = 0;    // Reset to first page for new search term
    this.isLastPage = false;     // Reset last page flag
    this.$segmentSearch.next($event.term);
  }

  // Called when user scrolls to the end of dropdown list
  onScrollToEnd(): void {
    if (!this.isLastPage) {
      this.segmentSearchPage++;
      this.retrieveUnitSearchList();
    }
  }

  valueChanged($event: any): void {
    console.log('value changed in segment select: ', $event)
    this.markAsTouched();
    if (!this.disabled) {
      if ($event) {
        this.selectedSegments = $event;
      } else {
        this.selectedSegments = null;
      }
      this.onChange(this.selectedSegments);
      this.updatedUnits.emit(this.selectedSegments);
    }
  }

  writeValue(obj: any): void {
    this.selectedSegments = obj;
  }

  onChange = (_: any) => {
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched = () => {
  };

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  removeItem(itemToRemove: SegmentItemGetModel): void {
    if (this.selectedSegments) {
      this.selectedSegments = this.selectedSegments.filter(
        item => item.id !== itemToRemove.id
      );
      this.onChange(this.selectedSegments);
      this.updatedUnits.emit(this.selectedSegments);
    }
  }

  onRemoveMouseDown(event: MouseEvent, item: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.removeItem(item);
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
