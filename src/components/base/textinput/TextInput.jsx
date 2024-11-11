import styles from "./textInput.module.css"

function TextInput({question, handleAnswerChange}) {
    return (
        <>
            <textarea
                rows="3"
                className={styles["answer-input"]}
                name={`answer-${question.id}`}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
        </>
    )
    
}

export default TextInput;