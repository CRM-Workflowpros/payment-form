import { useState } from 'react';

import { RegistrationForm } from 'components/RegistrationForm';
import { NuveiPaymentResponse } from 'types/nuvei';

import styles from './App.module.css';

const App = () => {
    const [nuveiResponse, setNuveiResponse] = useState<NuveiPaymentResponse | null>(null);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {!nuveiResponse && (
                    <RegistrationForm onSuccess={setNuveiResponse} />
                )}

                {nuveiResponse && (
                    <div className={styles.success}>
                        <p>Payment successful. Transaction ID: {nuveiResponse.transactionId}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
