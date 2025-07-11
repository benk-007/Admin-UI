import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fromDate = group.get('fromDate')?.value;
    const untilDate = group.get('untilDate')?.value;

    if (!fromDate || !untilDate) {
      return null;
    }

    const from = new Date(fromDate);
    const until = new Date(untilDate);

    if (from > until) {
      return { invalidDateRange: true };
    }

    return null;
  };
}
