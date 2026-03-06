import { useEffect, useRef, useState } from 'react';

import { PlanCard } from 'components/PlanCard';
import { useNuveiCard } from 'hooks/useNuveiCard';
import { getNuveiSession, registerTenant } from 'services/api';
import { NuveiSessionResponse, Plan, RegisterResult } from 'types/tenant';
import { NuveiPaymentResponse } from 'types/nuvei';

import styles from './RegistrationForm.module.css';

interface RegistrationFormProps {
    plans: Plan[];
    onSuccess: (result: RegisterResult, nuveiResponse: NuveiPaymentResponse) => void;
}

interface FormState {
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export const RegistrationForm = ({ plans, onSuccess }: RegistrationFormProps) => {
    const [form, setForm] = useState<FormState>({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(plans[0] ?? null);
    const [session, setSession] = useState<NuveiSessionResponse | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cardFieldRef = useRef<HTMLDivElement>(null);
    const { isCardReady, isInitializing, initError, createPayment } = useNuveiCard({ session, cardFieldRef });

    // Generate a stable userTokenId for this registration attempt
    const userTokenIdRef = useRef<string>(crypto.randomUUID());

    useEffect(() => {
        if (!selectedPlan) return;

        setSession(null);
        setIsSessionLoading(true);
        setError(null);

        getNuveiSession(selectedPlan.id, selectedPlan.price, userTokenIdRef.current)
            .then(setSession)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to initialize payment'))
            .finally(() => setIsSessionLoading(false));
    }, [selectedPlan]);

    const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan || !session || !isCardReady) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const cardHolderName = `${form.firstName} ${form.lastName}`.trim();
            const nuveiResponse = await createPayment(cardHolderName, form.email);

            const result = await registerTenant({
                companyName: form.companyName,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                planId: selectedPlan.id,
                userPaymentOptionId: nuveiResponse.userPaymentOptionId!,
                userTokenId: userTokenIdRef.current,
                ...(nuveiResponse.transactionId ? { transactionId: nuveiResponse.transactionId } : {}),
                ...(nuveiResponse.authCode ? { authCode: nuveiResponse.authCode } : {}),
            });

            onSuccess(result, nuveiResponse);
        } catch (err) {
            const nuveiErr = err as { errorDescription?: string };
            setError(nuveiErr.errorDescription ?? (err instanceof Error ? err.message : 'Something went wrong'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormDisabled = isSubmitting || !isCardReady;

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Company & Admin */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Company details</legend>
                <div className={styles.field}>
                    <label htmlFor="companyName">Company name</label>
                    <input
                        id="companyName"
                        value={form.companyName}
                        onChange={setField('companyName')}
                        placeholder="Acme Inc."
                        required
                        disabled={isFormDisabled}
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label htmlFor="firstName">First name</label>
                        <input
                            id="firstName"
                            value={form.firstName}
                            onChange={setField('firstName')}
                            placeholder="John"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="lastName">Last name</label>
                        <input
                            id="lastName"
                            value={form.lastName}
                            onChange={setField('lastName')}
                            placeholder="Smith"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>
                </div>
                <div className={styles.field}>
                    <label htmlFor="email">Work email</label>
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
                <div className={styles.field}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={setField('password')}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        disabled={isFormDisabled}
                    />
                </div>
            </fieldset>

            {/* Plan selection */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Choose a plan</legend>
                <div className={styles.plans}>
                    {plans.map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            selected={selectedPlan?.id === plan.id}
                            onSelect={setSelectedPlan}
                        />
                    ))}
                </div>
            </fieldset>

            {/* Card */}
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Payment</legend>

                {(isSessionLoading || isInitializing) && (
                    <div className={styles.cardLoader}>
                        <div className={styles.spinner} />
                        <span>Loading payment form...</span>
                    </div>
                )}

                {(initError || (!isSessionLoading && !session && error)) && (
                    <p className={styles.fieldError}>{initError ?? error}</p>
                )}

                <div
                    ref={cardFieldRef}
                    className={styles.cardField}
                    style={{ display: isCardReady ? 'block' : 'none' }}
                />

                {isCardReady && (
                    <p className={styles.cardHint}>
                        Your card will be charged ${selectedPlan?.price}/{selectedPlan?.period === 'ONE_MONTH' ? 'month' : 'year'}
                    </p>
                )}
            </fieldset>

            {error && !initError && (
                <div className={styles.error}>{error}</div>
            )}

            <button
                type="submit"
                className={styles.submitBtn}
                disabled={isFormDisabled}
            >
                {isSubmitting ? 'Creating account...' : 'Create account & Subscribe'}
            </button>
        </form>
    );
};
