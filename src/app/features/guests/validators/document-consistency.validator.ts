import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";

export function documentConsistencyValidator(allowedDns?: string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const idDocument = form.get('identityDocument') as FormGroup;
    const type = idDocument.get('type')?.value;
    const number = idDocument.get('documentNumber')?.value;
    const expiration = idDocument.get('expirationDate')?.value;
    const image = idDocument.get('documentImage');

    const anyDocumentFieldFilled = type || number || expiration;
    const documentIncomplete = (anyDocumentFieldFilled && (!type || !number || !expiration));

    // Rule 1: once user starts filling any document field, all must be filled
    if (documentIncomplete) {
      return {documentIncomplete: true};
    }

    // Rule 2: if image is uploaded, document fields must be fully filled
    if (image && (!type || !number || !expiration)) {
      return {documentRequiredWithImage: true};
    }

    return null;
  };
}
