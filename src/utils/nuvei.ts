const NUVEI_SDK_URL = 'https://cdn.safecharge.com/safecharge_resources/v1/websdk/safecharge.js';

export const loadNuveiSDK = (onLoad: () => void, onError: () => void): void => {
    if (typeof window !== 'undefined' && typeof window.SafeCharge !== 'undefined') {
        onLoad();
        return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${NUVEI_SDK_URL}"]`);
    if (existing) {
        existing.addEventListener('load', onLoad);
        return;
    }

    const script = document.createElement('script');
    script.src = NUVEI_SDK_URL;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
};
