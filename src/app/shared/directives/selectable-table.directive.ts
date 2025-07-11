import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';

@Directive({
  selector: '[appSelectableTable]',
  standalone: true
})
export class SelectableTableDirective implements AfterViewInit {

  checkedValues: any[] = [];
  @Input() insertAfterFirstCol: boolean = false;
  @Output() selectionChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  private observer: MutationObserver;

  constructor(private el: ElementRef) {
    // Initialize the MutationObserver to watch for changes in the table body
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          this.addRowCheckboxes(); // Add checkboxes to newly added rows
        }
      });
    });
  }

  ngAfterViewInit() {
    // Modify table structure
    this.addMasterCheckbox();
    this.addRowCheckboxes();

    // Observe the table body for changes
    const tbody = this.el.nativeElement.querySelector('tbody');
    if (tbody) {
      this.observer.observe(tbody, {childList: true});
    }
  }

  ngOnDestroy() {
    // Disconnect the observer when the directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private addMasterCheckbox() {
    const thead = this.el.nativeElement.querySelector('thead');
    const rowHeader = thead.querySelector('tr');


    const masterCheckbox = document.createElement('input');
    masterCheckbox.setAttribute('id', 'masterCheckbox');
    masterCheckbox.setAttribute('type', 'checkbox');
    masterCheckbox.classList.add('form-check-input'); // Add cFormCheckInput here
    masterCheckbox.addEventListener('change', (event) => {
      // @ts-ignore
      this.toggleRowCheckboxes(event.target.checked);
      this.updateCheckedValues();
    });
    const th = document.createElement('th');
    th.setAttribute('scope', 'col')
    th.setAttribute('class', 'text-center')

    th.appendChild(masterCheckbox);
    if (this.insertAfterFirstCol && rowHeader.children.length > 1) {
      rowHeader.insertBefore(th, rowHeader.children[1]);
    } else {
      rowHeader.insertBefore(th, rowHeader.firstChild);
    }
  }

  private addRowCheckboxes() {
    const tbody = this.el.nativeElement.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row: HTMLTableRowElement, index: number) => {
      if (!row.querySelector('input[type="checkbox"]')) {
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('value', '' + index);
        checkbox.classList.add('form-check-input');
        checkbox.addEventListener('change', (event) => {
          const target = event.target as HTMLInputElement;

          if (target.checked) {
            this.handleRowSelection(index, row);
          } else {
            this.handleRowDeselection(index, row);
          }

          this.updateCheckedValues();
        });
        const td = document.createElement('td');
        td.setAttribute('class', 'text-center')
        td.appendChild(checkbox);
        if (this.insertAfterFirstCol && row.children.length > 1) {
          row.insertBefore(td, row.children[1]);
        } else {
          row.insertBefore(td, row.firstChild);
        }
      }
    });
  }

  private handleRowSelection(index: number, row: HTMLTableRowElement): void {
    // Vérifier si c'est une MultiUnit en cherchant le badge "MULTI"
    const multiUnitBadge = row.querySelector('.vertical-badge') as HTMLElement;

    if (multiUnitBadge && multiUnitBadge.textContent?.trim() === 'MULTI') {
      console.log('MultiUnit selected, selecting SubUnits...'); // Debug
      this.selectSubUnitsOfMultiUnit(index);
    }
  }

  private handleRowDeselection(index: number, row: HTMLTableRowElement): void {
    // Vérifier si c'est une MultiUnit en cherchant le badge "MULTI"
    const multiUnitBadge = row.querySelector('.vertical-badge') as HTMLElement;

    if (multiUnitBadge && multiUnitBadge.textContent?.trim() === 'MULTI') {
      console.log('MultiUnit deselected, deselecting SubUnits...'); // Debug
      this.deselectSubUnitsOfMultiUnit(index);
    }
  }

  private selectSubUnitsOfMultiUnit(multiUnitIndex: number): void {
    const rows = this.el.nativeElement.querySelectorAll('tbody tr');
    console.log('Total rows:', rows.length); // Debug

    for (let currentIndex = multiUnitIndex + 1; currentIndex < rows.length; currentIndex++) {
      const row = rows[currentIndex];
      const subUnitBadge = row.querySelector('.vertical-badge') as HTMLElement;

      console.log('Checking row', currentIndex, 'badge text:', subUnitBadge?.textContent?.trim()); // Debug

      if (subUnitBadge && subUnitBadge.textContent?.trim() === 'SUB') {
        const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          console.log('Selecting SubUnit at index:', currentIndex); // Debug
          checkbox.checked = true;
        }
      } else {
        // Si ce n'est pas une SubUnit, arrêter la boucle
        break;
      }
    }
  }

  private deselectSubUnitsOfMultiUnit(multiUnitIndex: number): void {
    const rows = this.el.nativeElement.querySelectorAll('tbody tr');

    for (let currentIndex = multiUnitIndex + 1; currentIndex < rows.length; currentIndex++) {
      const row = rows[currentIndex];
      const subUnitBadge = row.querySelector('.vertical-badge') as HTMLElement;

      if (subUnitBadge && subUnitBadge.textContent?.trim() === 'SUB') {
        const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
        }
      } else {
        break;
      }
    }
  }

  private toggleRowCheckboxes(checked: boolean) {
    const checkboxes = this.el.nativeElement.querySelectorAll('tbody input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = checked;
    });
  }

  private updateCheckedValues() {
    this.checkedValues = [];
    const checkboxes = this.el.nativeElement.querySelectorAll('tbody input[type="checkbox"]:checked');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      this.checkedValues.push(checkbox.value);
    });
    this.selectionChange.emit(this.checkedValues); // Emit selection change event
  }
}
