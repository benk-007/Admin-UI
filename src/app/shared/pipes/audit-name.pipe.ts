import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'auditName'
})
export class AuditNamePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    const parts = value.split('-');
    const name = parts.length > 1 ? parts.slice(-1)[0] : value;

    return this.capitalizeWords(name);
  }

  private capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

}
