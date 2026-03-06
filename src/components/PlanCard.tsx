import { Plan } from 'types/tenant';

import styles from './PlanCard.module.css';

const PERIOD_LABEL: Record<Plan['period'], string> = {
    ONE_MONTH: 'month',
    ONE_YEAR: 'year',
};

interface PlanCardProps {
    plan: Plan;
    selected: boolean;
    onSelect: (plan: Plan) => void;
}

export const PlanCard = ({ plan, selected, onSelect }: PlanCardProps) => (
    <button
        type="button"
        className={`${styles.card} ${selected ? styles.selected : ''}`}
        onClick={() => onSelect(plan)}
    >
        <div className={styles.left}>
            <span className={styles.name}>{plan.name}</span>
            {plan.description && <span className={styles.desc}>{plan.description}</span>}
        </div>
        <div className={styles.price}>
            <span className={styles.amount}>${plan.price}</span>
            <span className={styles.period}>/ {PERIOD_LABEL[plan.period]}</span>
        </div>
        <div className={`${styles.radio} ${selected ? styles.radioSelected : ''}`} />
    </button>
);
