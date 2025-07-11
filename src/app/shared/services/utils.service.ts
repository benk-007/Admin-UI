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
}
