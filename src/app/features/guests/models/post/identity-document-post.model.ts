export interface IdentityDocumentPostModel {
  type: string;
  value: string;
  expirationDate: string;
  partyId?: string;
}
