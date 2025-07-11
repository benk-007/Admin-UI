import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() {
  }

  static getNameInitials(name: string): string {
    if (name) {
      // Split the name into words, removing any extra spaces
      const words = name.trim().split(" ").filter(word => word.trim() !== "");

      // Handle names with different word counts
      if (words.length === 1) {
        // Single word name: Use the first two letters
        return words[0].slice(0, 2).toUpperCase();
      } else if (words.length === 2) {
        // Two words: Use the initials of both words
        return (
          words[0].charAt(0).toUpperCase() +
          words[1].charAt(0).toUpperCase()
        );
      } else {
        // Three or more words: Use the initials of the first two and the last word
        return (
          words[0].charAt(0).toUpperCase() +
          words[1].charAt(0).toUpperCase() +
          words[words.length - 1].charAt(0).toUpperCase()
        );
      }
    } else {
      return 'N/A';
    }
  }

  static getAvatarColor(input: string): string {
    const classes = [
      'primary',
      'success',
      'info',
      'warning',
      'secondary',
      'dark',
      'danger',
    ];

    if (!input || input.length === 0) {
      return 'secondary'; // default fallback
    }

    const firstChar = input.charAt(0).toLowerCase();

    if (firstChar >= 'a' && firstChar <= 'z') {
      const index = (firstChar.charCodeAt(0) - 'a'.charCodeAt(0)) % classes.length;
      return classes[index];
    }

    if (firstChar >= '0' && firstChar <= '9') {
      const index = parseInt(firstChar, 10) % classes.length;
      return classes[index];
    }

    return 'secondary'; // fallback for symbols or unknown characters
  }
}
