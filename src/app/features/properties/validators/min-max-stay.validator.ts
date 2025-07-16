import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function minMaxStayValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const group = form as FormGroup;
    const rentalBaseRate = group.get('rentalBaseRate') as FormGroup;

    if (!rentalBaseRate) {
      return null;
    }

    const minValue = rentalBaseRate.get('minStay')?.value;
    const maxValue = rentalBaseRate.get('maxStay')?.value;

    if (minValue == null || maxValue == null) {
      return null;
    }

    if (maxValue < minValue) {
      return { maxLowerThanMin: true };
    }

    return null;
  };
}
