import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password') || control.get('newPassword');
    const confirmPassword = control.get('confirmPassword') || control.get('confirmNewPassword');

    if(!confirmPassword?.value){
      return null;
    }
    // Check if both controls exist and their values are identical
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return {passwordsMismatch: true};
    }
    return null;
  };
}
