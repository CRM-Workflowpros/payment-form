import { useCallback, useEffect, useRef, useState } from 'react';

import { NUVEI_CARD_STYLE, NUVEI_FONTS_URL } from 'constants/nuvei';
import { NuveiSessionResponse } from 'types/tenant';
import { NuveiCard, NuveiInstance, NuveiPaymentResponse, NuveiPaymentResult } from 'types/nuvei';
import { loadNuveiSDK } from 'utils/nuvei';

interface UseNuveiCardProps {
    session: NuveiSessionResponse | null;
    cardFieldRef: React.RefObject<HTMLDivElement | null>;
}

interface UseNuveiCardReturn {
    isCardReady: boolean;
    isInitializing: boolean;
    initError: string | null;
    createPayment: (cardHolderName: string, email: string) => Promise<NuveiPaymentResponse>;
}

export const useNuveiCard = ({ session, cardFieldRef }: UseNuveiCardProps): UseNuveiCardReturn => {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [isCardReady, setIsCardReady] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const nuveiInstanceRef = useRef<NuveiInstance | null>(null);
    const cardRef = useRef<NuveiCard | null>(null);

    useEffect(() => {
        loadNuveiSDK(
            () => setIsSDKLoaded(true),
            () => setInitError('Failed to load Nuvei SDK')
        );
    }, []);

    useEffect(() => {
        if (!isSDKLoaded || !session || !cardFieldRef.current) return;

        setIsInitializing(true);
        setIsCardReady(false);
        setInitError(null);
        cardFieldRef.current.innerHTML = '';

        try {
            const sfc = window.SafeCharge({
                env: session.env,
                merchantId: session.merchantId,
                merchantSiteId: session.merchantSiteId,
                ...(session.userTokenId ? { userTokenId: session.userTokenId } : {}),
            });

            nuveiInstanceRef.current = sfc;

            const scFields = sfc.fields({ fonts: [{ cssUrl: NUVEI_FONTS_URL }] });
            const card = scFields.create('card', { style: NUVEI_CARD_STYLE });
            card.attach(cardFieldRef.current);

            card.on('ready', () => {
                setIsCardReady(true);
                setIsInitializing(false);
            });

            card.on('error', data => {
                setInitError(data.error ?? 'Card field error');
                setIsInitializing(false);
            });

            cardRef.current = card;
        } catch (err) {
            setInitError(err instanceof Error ? err.message : 'Failed to initialize card form');
            setIsInitializing(false);
        }
    }, [isSDKLoaded, session, cardFieldRef]);

    const createPayment = useCallback(
        (cardHolderName: string, email: string): Promise<NuveiPaymentResponse> => {
            if (!nuveiInstanceRef.current || !cardRef.current || !session) {
                return Promise.reject(new Error('Payment form not ready'));
            }

            return new Promise((resolve, reject) => {
                nuveiInstanceRef.current!.createPayment(
                    {
                        sessionToken: session.sessionToken,
                        merchantId: session.merchantId,
                        merchantSiteId: session.merchantSiteId,
                        cardHolderName,
                        paymentOption: cardRef.current!,
                        billingAddress: { email, country: 'CA' },
                        ...(session.userTokenId ? { userTokenId: session.userTokenId } : {}),
                    },
                    response => {
                        const ok = response.result === NuveiPaymentResult.APPROVED || response.result === NuveiPaymentResult.PENDING;
                        ok ? resolve(response) : reject(response);
                    }
                );
            });
        },
        [session]
    );

    return { isCardReady, isInitializing, initError, createPayment };
};
