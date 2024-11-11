import styles from "./numberInput.module.css";

function NumberInput({ answers, question, handleAnswerChange }) {
    return (
        <>
            <div className={styles["rating-container"]}>
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        type="button"
                        key={num}
                        className={`${styles["rating-button"]} ${
                            answers.find((answer) => answer.question_id === question.id)?.answer === num 
                                ? styles["selected"] 
                                : ""
                        }`}
                        onClick={() => handleAnswerChange(question.id, num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </>
    );
}

export default NumberInput;
