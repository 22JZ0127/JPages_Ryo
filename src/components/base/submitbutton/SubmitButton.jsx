import styles from './submitButton.module.css'

function SubmitButton() {
    return (
        <>
            <button type="submit" className={styles["submit-button"]}>送信</button>
        </>
    )
}
export default SubmitButton;