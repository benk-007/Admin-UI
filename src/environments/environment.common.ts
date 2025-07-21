export const UAA_SERVICE = 'authMgtApi/';
export const UNIT_SERVICE = 'unitMgtApi/';
export const GUEST_SERVICE = 'guestMgtApi/';
export const MEDIA_SERVICE = 'mediaMgtApi/';
export const PRICING_SERVICE = 'rateMgtApi/'
export const CRM_SERVICE = 'guestMgtApi/';

export const commonProperties = {
  /*===========UAA Service===========*/
  // authentication resource
  login: UAA_SERVICE + 'login',
  forgotPassword: UAA_SERVICE + 'forgot-password',
  refreshToken: UAA_SERVICE + 'refresh-token',
  resetPassword: UAA_SERVICE + 'reset-password',
  changePassword: UAA_SERVICE + 'change-password',
  validateAccount: UAA_SERVICE + 'validate-account',
  // user resource
  userList: UAA_SERVICE + 'users',
  userById: UAA_SERVICE + 'users/:userId',

  /*===========UNIT Service===========*/
  // Unit resource
  unitList: UNIT_SERVICE + 'units',
  unitById: UNIT_SERVICE + 'units/:unitId',
  unitInfosById: UNIT_SERVICE + 'units/:unitId/infos',
  unitDetailsById: UNIT_SERVICE + 'units/:unitId/details',
  unitInstructionsById: UNIT_SERVICE + 'units/:unitId/inst',
  unitRoomsById: UNIT_SERVICE + 'units/:unitId/rooms',
  unitRoomById: UNIT_SERVICE + 'units/:unitId/rooms/:roomId',
  //unit subUnits resource
  unitSubUnits: UNIT_SERVICE + 'units/:unitId/sub-units',
  unitDetach: UNIT_SERVICE + 'units/:unitId/detach',
  // Image resource
  unitImages: UNIT_SERVICE + 'images',
  unitImageById: UNIT_SERVICE + 'images/:imageId',

  /*===========Rates===========*/
  // Default resource
  unitBaseRateById: PRICING_SERVICE + 'default-rates',
  // Rate plans
  RatePlan: PRICING_SERVICE + 'rate-plans',
  // Rate plans
  RateTable: PRICING_SERVICE + 'rate-tables',


  /*===========Guest Service===========*/
  // Guest resource
  guestList: GUEST_SERVICE + 'guests',
  guestById: GUEST_SERVICE + 'guests/:guestId',

  // Document resource
  identityDocuments: GUEST_SERVICE + 'identity-documents',
  identityDocumentById: GUEST_SERVICE + 'identity-documents/:identityDocumentId',
  identityDocumentImageById: GUEST_SERVICE + 'identity-documents/:identityDocumentId/image',

  // Document image resource
  idDocumentImages: GUEST_SERVICE + 'images',
  idDocumentImageById: GUEST_SERVICE + 'images/:imageId',

  /*===========MEDIA Service===========*/
  mediaById: MEDIA_SERVICE + 'medias/:mediaId',

  /*===========CRM Service===========*/
  segmentList: CRM_SERVICE + 'segments',
  segmentById: CRM_SERVICE + 'segments/:segmentId'

}
