export type AjaxDirection = 'prev' | 'next';

export interface ContainerIds {
  pagedContent?: string;
  loadMorePrev?: string;
  loadMoreNext?: string;
  pagination?: string;
  mainContent?: string;
  form?: string;
  formMessage?: string;
  formErrorMessage?: string;
}

export interface AjaxPayload {
  titleTag: string;
  title: string;
  path: string;
  route: string;
  mainContentHtml: string;
  theme: string;
  cssVars: Array<AjaxPayloadCssVars>;
  switchUrl: string;
  currentLang: string;
  redirectUrl: string;
}

export interface AjaxPayloadForm {
  containerIds: ContainerIds;
  contactFormEmailSent: boolean;
  successMessage: string;
  errorMessage: string;
}

export interface AjaxPayloadCssVars {
  name: string;
  color: string;
}

export interface AjaxJsonData {
  pagedContentHtml?: string;
  mainContentHtml?: string;
  loadMorePrevHtml?: string;
  loadMoreNextHtml?: string;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  paginationHtml?: string;
}
