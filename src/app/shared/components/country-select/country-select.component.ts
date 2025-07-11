import {Component, EventEmitter, forwardRef, OnDestroy, OnInit, Output} from '@angular/core';
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from "@ng-select/ng-select";
import {TranslatePipe} from "@ngx-translate/core";
import {FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CountryEnum} from "../../models/country.enum";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-country-select',
  imports: [
    NgSelectComponent,
    TranslatePipe,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    FormsModule
  ],
  templateUrl: './country-select.component.html',
  styleUrl: './country-select.component.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CountrySelectComponent),

    }
  ]
})
export class CountrySelectComponent implements OnInit, OnDestroy {
  countries: string[] = Object.keys(CountryEnum).filter((item) => {
    return isNaN(Number(item));
  });


  selectedCountries: string | null = null;

  @Output() updateCause: EventEmitter<string | null> = new EventEmitter<string | null>();
  countrySearchPage: number = 0;
  touched = false;

  disabled = false;

  private readonly subscriptions: Subscription[] = [];

  constructor() {
  }

  ngOnInit(): void {
    // this.subscribeToCountrySearch();
  }

  onChange = (order: any) => {
  };

  onTouched = () => {
  };


  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.selectedCountries = obj;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  valueChanged($event: any) {
    this.markAsTouched();
    if (!this.disabled) {
      if ($event) {
        this.selectedCountries = $event;
      } else {
        this.selectedCountries = null;
      }
      this.onChange(this.selectedCountries);
      this.updateCause.emit(this.selectedCountries);
    }

  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
