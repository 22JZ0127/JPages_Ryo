import styles from './submitButton.module.css'

function SubmitButton({ visualType }) {
    const buttonText = visualType === 'submit' ? '送信' : visualType === 'login' ? 'ログイン' : '送信';

    return (
        <>
            <button type="submit" className={styles["submit-button"]}>
                {buttonText}
            </button>
        </>
    );
}

export default SubmitButton;
