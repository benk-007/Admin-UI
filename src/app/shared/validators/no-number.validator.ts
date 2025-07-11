import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const hasNumber = /\d/.test(value);
    return hasNumber ? { noNumbers: true } : null;
  };
}
