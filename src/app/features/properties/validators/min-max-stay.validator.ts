import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minMaxStayValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const minStay = group.get('minStay')?.value;
    const maxStay = group.get('maxStay')?.value;

    if (minStay != null && maxStay != null && maxStay < minStay) {
      return { maxLowerThanMin: true };
    }

    return null;
  };
}
