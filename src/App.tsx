import { useEffect, useState } from 'react';

import { RegistrationForm } from 'components/RegistrationForm';
import { SuccessScreen } from 'components/SuccessScreen';
import { getPlans } from 'services/api';
import { NuveiPaymentResponse } from 'types/nuvei';
import { Plan, RegisterResult } from 'types/tenant';

import styles from './App.module.css';

interface SuccessState {
    result: RegisterResult;
    nuveiResponse: NuveiPaymentResponse;
}

const App = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SuccessState | null>(null);

    useEffect(() => {
        getPlans()
            .then(setPlans)
            .catch(err => setLoadError(err instanceof Error ? err.message : 'Failed to load plans'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {!success && (
                    <div className={styles.header}>
                        <h1 className={styles.title}>Get started</h1>
                        <p className={styles.subtitle}>Create your account and start your subscription today.</p>
                    </div>
                )}

                {isLoading && (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <span>Loading...</span>
                    </div>
                )}

                {loadError && (
                    <div className={styles.error}>{loadError}</div>
                )}

                {!isLoading && !loadError && !success && (
                    <RegistrationForm
                        plans={plans}
                        onSuccess={(result, nuveiResponse) => setSuccess({ result, nuveiResponse })}
                    />
                )}

                {success && (
                    <SuccessScreen result={success.result} nuveiResponse={success.nuveiResponse} />
                )}
            </div>
        </div>
    );
};

export default App;
