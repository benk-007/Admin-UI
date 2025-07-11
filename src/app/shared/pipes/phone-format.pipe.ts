import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat'
})
export class PhoneFormatPipe implements PipeTransform {

  transform( tel: string | number, usFormat: boolean = true ): string {

    if ( !tel ) {
      return '';
    }

    // If the number has anything other than digits (numbers) OR a plus sign at first position after trimming white space - return it as is because user has formatted it himself
    if ( /^\+?\d+$/.test( tel?.toString()?.trim() ) === false ) {
      return String( tel );
    }

    // Capture index of plus sign
    const hasPlus = tel.toString().indexOf('+');

    // Remove plus sign
    const value = tel.toString().trim().replace(/^\+/, '');

    let country: string | number;
    let city   : string;
    let number : string;

    switch ( value?.length ) {
      case 10: // +1PPP####### -> C (PPP) ###-####
        country = 1;
        city    = value.slice(0, 3);
        number  = value.slice(3);
        break;

      case 11: // +CPPP####### -> CCC (PP) ###-####
        country = value[0];
        city    = value.slice(1, 4);
        number  = value.slice(4);
        break;

      case 12: // +CCCPP####### -> CCC (PP) ###-####
        country = value.slice(0, 3);
        city    = value.slice(3, 5);
        number  = value.slice(5);
        break;

      case 13: // +CCCPP####### -> CCC (PP) ###-#####
        country = value.slice(0, 3);
        city    = value.slice(3, 5);
        number  = value.slice(5);
        break;

      default:
        return String( tel );
    }

    if ( country === 1 ) { country = ''; }

    number = number.slice(0, 3) + '-' + number.slice(3);

    if ( hasPlus !== -1 ) {
      // Has plus sign other than at first position - move it at position one
      return ('+' + country + ' (' + city + ') ' + number).trim();
    }

    return (country + ' (' + city + ') ' + number).trim();
  }

}
