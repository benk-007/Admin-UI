import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function pricingConsistencyValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const group = form as FormGroup;

    const rentalBaseRate = group.get('rentalBaseRate') as FormGroup;

    if (!rentalBaseRate) {
      return null;
    }

    const nightly = rentalBaseRate.get('nightly')?.value;
    const weekly = rentalBaseRate.get('weekly')?.value;
    const monthly = rentalBaseRate.get('monthly')?.value;

    const errors: any = {};

    if (nightly != null && weekly != null && weekly <= nightly) {
      errors.weeklyLowerThanNightly = true;
    }

    if (weekly != null) {
      if (monthly != null && monthly <= weekly) {
        errors.monthlyLowerThanWeekly = true;
      }
    } else {
      if (nightly != null && monthly != null && monthly <= nightly) {
        errors.monthlyLowerThanNightly = true;
      }
    }

    return Object.keys(errors).length ? errors : null;
  };
}
