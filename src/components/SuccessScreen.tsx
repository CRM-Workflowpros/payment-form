import { NuveiPaymentResponse } from 'types/nuvei';
import { RegisterResult } from 'types/tenant';

import styles from './SuccessScreen.module.css';

interface SuccessScreenProps {
    result: RegisterResult;
    nuveiResponse: NuveiPaymentResponse;
}

export const SuccessScreen = ({ result, nuveiResponse }: SuccessScreenProps) => (
    <div className={styles.wrapper}>
        <div className={styles.icon}>✓</div>
        <h2 className={styles.title}>Account created!</h2>
        <p className={styles.subtitle}>
            Subscription <strong>{result.subscription.planName}</strong> is active.
        </p>

        <div className={styles.details}>
            <div className={styles.row}>
                <span>Company</span>
                <span>{result.tenant.name}</span>
            </div>
            <div className={styles.row}>
                <span>Subdomain</span>
                <span>{result.tenant.subdomain}</span>
            </div>
            <div className={styles.row}>
                <span>Subscription ID</span>
                <span>{result.subscription.id}</span>
            </div>
            <div className={styles.row}>
                <span>Transaction ID</span>
                <span>{nuveiResponse.transactionId}</span>
            </div>
            <div className={styles.row}>
                <span>Card</span>
                <span>{nuveiResponse.cardBrand} **** {nuveiResponse.last4Digits}</span>
            </div>
        </div>
    </div>
);
