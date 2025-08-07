import {IdentityDocumentPostModel} from "./identity-document-post.model";
import {AddressModel} from '../../../../shared/models/address.model';
import {ContactModel} from '../../../../shared/models/contact.model';

export interface PartyItemPostModel {
  name?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  type: 'GUEST' | 'COMPANY';
  address?: AddressModel;
  contact?: ContactModel;
  identityDocument?: IdentityDocumentPostModel;
  segmentId?: string;
}
