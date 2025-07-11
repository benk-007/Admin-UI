import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class TranslationService {


  static readonly LANG = 'lang_key';

  constructor(private readonly translateService: TranslateService) {
  }

  setLanguage(lang: any) {
    this.translateService.use(lang)
    localStorage.setItem(TranslationService.LANG, lang);
  }

  getLanguage() {
    return this.translateService.currentLang;
  }

  getBrowserLang(){
    return this.translateService.getBrowserLang();
  }
}
