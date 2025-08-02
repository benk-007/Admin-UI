import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, debounceTime, distinctUntilChanged, Subscription} from 'rxjs';
import {PageFilterModel} from '../../models/page-filter.model';
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from '@ng-select/ng-select';
import {PartyItemGetModel} from '../../../features/crm/models/party/party-item-get.model';
import {CrmApiService} from '../../../features/crm/services/crm-api.service';

@Component({
  selector: 'app-party-select',
  imports: [
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
    FormsModule
  ],
  templateUrl: './party-select.component.html',
  styleUrl: './party-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PartySelectComponent),
    }
  ]
})
export class PartySelectComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() disable = false;
  @Input() initialParty: PartyItemGetModel | null = null;

  @Output() updatedParty = new EventEmitter<PartyItemGetModel | null>();

  partySearchList: PartyItemGetModel[] = [];
  selectedParty: PartyItemGetModel | null = null;

  $partySearch = new BehaviorSubject<string>('');

  private partySearchPage = 0;
  private isLastPage = false;

  touched = false;
  disabled = false;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly crmApiService: CrmApiService) {
  }

  ngOnInit(): void {
    this.subscribeToPartySearch();
    // Auto-select party if provided
    if (this.initialParty) {
      this.selectedParty = this.initialParty;
      this.writeValue(this.initialParty);
    }
  }

  private subscribeToPartySearch() {
    this.subscriptions.push(this.$partySearch.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.partySearchPage = 0;
      this.isLastPage = false;
      this.retrievePartySearchList();
    }))
  }

  private retrievePartySearchList() {
    const searchValue = this.$partySearch.getValue()?.trim();

    let pageFilter: PageFilterModel = {
      page: this.partySearchPage,
      size: 20,
      sort: 'name',
      sortDirection: 'asc',
      search: searchValue,
    };

    this.subscriptions.push(
      this.crmApiService.getPartiesByPage(pageFilter).subscribe({
        next: (res) => {
          console.log('Parties retrieved successfully. API response is:', res);
          if (this.partySearchPage === 0) {
            this.partySearchList = res.content;
          } else {
            this.partySearchList = this.partySearchList.concat(res.content);
          }
          this.isLastPage = res.last;
        },
        error: (err) => {
          console.error('An error occurred when retrieving party list. API error response:', err);
        }
      })
    )
  }

  searchParties($event: { term: string; items: any[] }): void {
    this.partySearchPage = 0;
    this.isLastPage = false;
    this.$partySearch.next($event.term);
  }

  onScrollToEnd(): void {
    if (!this.isLastPage) {
      this.partySearchPage++;
      this.retrievePartySearchList();
    }
  }

  valueChanged($event: any): void {
    console.log('value changed in party select: ', $event)
    this.markAsTouched();
    if (!this.disabled) {
      if ($event) {
        this.selectedParty = $event;
      } else {
        this.selectedParty = null;
      }
      this.onChange(this.selectedParty);
      this.updatedParty.emit(this.selectedParty);
    }
  }


  writeValue(obj: any): void {
    this.selectedParty = obj;
  }

  onChange = (_: any) => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched = () => {};

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

  compareParties(item1: PartyItemGetModel, item2: any): boolean {
    if (!item1 || !item2) {
      return false;
    }
    const item1Identifier = item1.id;
    if (item2.id !== undefined) {
      return item1Identifier === item2.id;
    }
    if (item2.uuid !== undefined) {
      return item1Identifier === item2.uuid;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
