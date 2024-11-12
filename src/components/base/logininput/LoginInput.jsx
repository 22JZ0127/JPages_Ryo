import React from 'react';
import styles from './loginInput.module.css';

function LoginInput({ id, label, value, onChange, placeholder }) {
    return (
        <div>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <input
                type="text"
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={styles["input-field"]}
            />
        </div>
    );
}

export default LoginInput;
