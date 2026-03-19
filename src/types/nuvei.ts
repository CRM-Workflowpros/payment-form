declare global {
    interface Window {
        SafeCharge: (config: NuveiConfig) => NuveiInstance;
    }
}

export type NuveiEnv = 'int' | 'prod';

export interface NuveiConfig {
    env: NuveiEnv;
    merchantId: string;
    merchantSiteId: string;
    sessionToken: string;
    userTokenId?: string;
}

export interface NuveiInstance {
    fields: (config?: NuveiFieldsConfig) => NuveiFields;
    createPayment: (params: NuveiCreatePaymentParams, callback: (res: NuveiPaymentResponse) => void) => void;
}

export interface NuveiFieldsConfig {
    fonts?: Array<{ cssUrl: string }>;
}

export interface NuveiFields {
    create: (type: 'card', options?: NuveiCardOptions) => NuveiCard;
}

export interface NuveiCard {
    attach: (el: HTMLElement) => void;
    on: (event: 'ready' | 'error' | 'change' | 'focus' | 'blur', cb: (data: NuveiCardEventData) => void) => void;
}

export interface NuveiCardEventData {
    complete?: boolean;
    error?: string;
}

export interface NuveiCardOptions {
    style?: NuveiCardStyle;
}

export interface NuveiCardStyle {
    base?: NuveiCSSProperties;
    invalid?: NuveiCSSProperties;
    empty?: NuveiCSSProperties;
    complete?: NuveiCSSProperties;
}

export interface NuveiCSSProperties {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    '::placeholder'?: { color?: string };
}

export interface NuveiCreatePaymentParams {
    sessionToken: string;
    merchantId: string;
    merchantSiteId: string;
    cardHolderName: string;
    paymentOption: NuveiCard;
    billingAddress: { email: string; country: string };
    userTokenId: string;
    currency?: string;
    amount?: string;
}

export enum NuveiPaymentResult {
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    PENDING = 'PENDING',
    ERROR = 'ERROR',
}

export interface NuveiPaymentResponse {
    result: NuveiPaymentResult;
    errCode: string;
    errorDescription: string;
    userPaymentOptionId?: string;
    transactionId?: string;
    authCode?: string;
    ccCardNumber?: string;
    last4Digits?: string;
    ccExpMonth?: string;
    ccExpYear?: string;
    cardBrand?: string;
    cancelled?: boolean;
}

export {};
