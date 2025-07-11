import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function emailValidator(allowedDns?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Return null if no value (to handle required validation separately)
    }

    // Regular email pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = emailPattern.test(value);

    if (!isValidEmail) {
      return {invalidEmail: true}; // Invalid email format
    }

    // If a DNS is provided, check if the email ends with it
    if (allowedDns && !value.endsWith(`@${allowedDns}`)) {
      return {invalidEmailDns: true}; // Invalid DNS
    }

    return null; // Valid email
  };
}
