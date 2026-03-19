import { useState } from 'react';

import { RegistrationForm } from 'components/RegistrationForm';
import { setApiBaseUrl } from 'services/api';
import { NuveiPaymentResponse } from 'types/nuvei';

import styles from './App.module.css';

const ENVIRONMENTS = [1, 2, 3, 4, 5].map(n => ({
    label: `Dev${n}`,
    url: `https://api.dev${n}.workflowpros.co/api`,
}));

const App = () => {
    const [nuveiResponse, setNuveiResponse] = useState<NuveiPaymentResponse | null>(null);
    const [envUrl, setEnvUrl] = useState(ENVIRONMENTS[3].url); // dev4 default

    const handleEnvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const url = e.target.value;
        setEnvUrl(url);
        setApiBaseUrl(url);
    };

    return (
        <div className={styles.page}>
            <div className={styles.envSelector}>
                <label htmlFor="env">API:</label>
                <select id="env" value={envUrl} onChange={handleEnvChange}>
                    {ENVIRONMENTS.map(env => (
                        <option key={env.url} value={env.url}>{env.label}</option>
                    ))}
                </select>
            </div>

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
