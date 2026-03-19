import { useRef, useState } from 'react';

import { useNuveiCard } from 'hooks/useNuveiCard';
import { initOnboarding } from 'services/api';
import { NuveiSessionResponse } from 'types/tenant';
import { NuveiPaymentResponse } from 'types/nuvei';

import styles from './RegistrationForm.module.css';

interface RegistrationFormProps {
    onSuccess: (nuveiResponse: NuveiPaymentResponse) => void;
}

interface FormState {
    name: string;
    phone: string;
    email: string;
}

export const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
    const [form, setForm] = useState<FormState>({
        name: '',
        phone: '',
        email: '',
    });
    const [session, setSession] = useState<NuveiSessionResponse | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cardFieldRef = useRef<HTMLDivElement>(null);
    const { isCardReady, isInitializing, initError, createPayment } = useNuveiCard({ session, cardFieldRef });

    const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.email) return;

        setIsSessionLoading(true);
        setError(null);

        try {
            const s = await initOnboarding({ name: form.name, phone: form.phone, email: form.email });
            setSession(s);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        } finally {
            setIsSessionLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !isCardReady) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const nuveiResponse = await createPayment(form.name, form.email);

            // TODO: register tenant after payment
            // const result = await registerTenant({ ... });

            onSuccess(nuveiResponse);
        } catch (err) {
            const nuveiErr = err as { errorDescription?: string };
            setError(nuveiErr.errorDescription ?? (err instanceof Error ? err.message : 'Something went wrong'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormDisabled = isSubmitting || isSessionLoading;

    if (!session) {
        return (
            <form onSubmit={handleContinue} className={styles.form} noValidate>
                <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>Subscription details</legend>
                    <div className={styles.field}>
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            value={form.name}
                            onChange={setField('name')}
                            placeholder="John Smith"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={setField('phone')}
                            placeholder="+1 555 000 0000"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={setField('email')}
                            placeholder="john@acme.com"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>

                </fieldset>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.submitBtn} disabled={isFormDisabled}>
                    {isSessionLoading ? 'Loading...' : 'Continue to Payment'}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Payment</legend>

                {(isInitializing) && (
                    <div className={styles.cardLoader}>
                        <div className={styles.spinner} />
                        <span>Loading payment form...</span>
                    </div>
                )}

                {initError && <p className={styles.fieldError}>{initError}</p>}

                <div
                    ref={cardFieldRef}
                    className={styles.cardField}
                    style={{ display: isCardReady ? 'block' : 'none' }}
                />
            </fieldset>

            {error && <div className={styles.error}>{error}</div>}

            <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !isCardReady}
            >
                {isSubmitting ? 'Processing...' : 'Subscribe'}
            </button>
        </form>
    );
};
