export interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    period: 'ONE_MONTH' | 'ONE_YEAR';
    nuveiPlanId: string;
}

export interface OnboardingInitPayload {
    name: string;
    phone: string;
    email: string;
}

export interface NuveiSessionResponse {
    sessionToken: string;
    orderId: string;
    merchantId: string;
    merchantSiteId: string;
    env: 'int' | 'prod';
    userTokenId: string;
}

export interface RegisterPayload {
    name: string;
    phone: string;
    email: string;
    password: string;
    planId: number;
    userPaymentOptionId: string;
    userTokenId: string;
    transactionId?: string;
    authCode?: string;
}

export interface RegisterResult {
    tenant: {
        id: number;
        name: string;
        subdomain: string;
    };
    subscription: {
        id: string;
        status: string;
        planName: string;
    };
}
