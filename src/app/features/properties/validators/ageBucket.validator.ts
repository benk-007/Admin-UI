import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ageRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('fromAge')?.value;
    const to = group.get('toAge')?.value;

    if (from != null && to != null && to < from) {
      return { invalidAgeRange: true };
    }

    return null;
  };
}
