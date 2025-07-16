import { SafeUrl } from '@angular/platform-browser';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';

export interface ImageGetModel {
  id: string;
  cover: boolean;
  uuid: string;
  audit: AuditGetModel;
  imageUrl?: SafeUrl;
}
