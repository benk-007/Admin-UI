import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

export function noChildAgeOverlapValidator(control: AbstractControl): ValidationErrors | null {
  const formArray = control as any;

  const childRanges: { from: number, to: number, index: number }[] = [];

  for (let i = 0; i < formArray.controls.length; i++) {
    const group = formArray.at(i) as FormGroup;
    const guestType = group.get('guestType')?.value;

    if (guestType === 'CHILD') {
      const fromAge = group.get('ageBucket.fromAge')?.value;
      const toAge = group.get('ageBucket.toAge')?.value;

      if (fromAge != null && toAge != null) {
        childRanges.push({ from: fromAge, to: toAge, index: i });
      }
    }
  }

  // Check for overlaps
  for (let i = 0; i < childRanges.length; i++) {
    for (let j = i + 1; j < childRanges.length; j++) {
      const a = childRanges[i];
      const b = childRanges[j];

      const overlap = Math.max(a.from, b.from) <= Math.min(a.to, b.to);
      if (overlap) {
        return { childAgeOverlap: true };
      }
    }
  }

  return null;
}
