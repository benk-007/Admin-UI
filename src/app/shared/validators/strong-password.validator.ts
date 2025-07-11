import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;

    if (!password) {
      return null; // If no value, validation should not fail.
    }

    const hasMinimumLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter = /[!?@#$%^&*'"`§()\-=+{};:,<.>|[\]]/.test(password);

    const isValid =
      hasMinimumLength && hasLowercase && hasUppercase && hasNumber && hasSpecialCharacter;

    return isValid
      ? null
      : {
        strongPassword: true,
      };
  };
}
