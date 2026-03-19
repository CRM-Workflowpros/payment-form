import { API_BASE_URL } from 'constants/env';
import { NuveiSessionResponse, OnboardingInitPayload, Plan, RegisterPayload, RegisterResult } from 'types/tenant';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}

interface OnboardingInitResponse {
    meta: { success: boolean };
    response: NuveiSessionResponse;
}

export const getPlans = (): Promise<Plan[]> =>
    request<Plan[]>('/plans');

export const initOnboarding = (payload: OnboardingInitPayload): Promise<NuveiSessionResponse> =>
    request<OnboardingInitResponse>('/subscription/onboarding/init', {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(res => res.response);

export const registerTenant = (payload: RegisterPayload): Promise<RegisterResult> =>
    request<RegisterResult>('/tenants/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
