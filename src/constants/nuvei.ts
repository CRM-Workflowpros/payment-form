import type { NuveiCardStyle } from 'types/nuvei';

export const NUVEI_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap';

export const NUVEI_CARD_STYLE: NuveiCardStyle = {
    base: {
        color: '#111827',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
    complete: { color: '#111827' },
};
