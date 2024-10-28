// function NumberInput(props) {
//     const {person = props.person}
//     return (
//         <>
            <div className="rating-container">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        type="button"
                        key={num}
                        className={`rating-button ${answers.find(answer => answer.question_id === question.id)?.answer === num ? 'selected' : ''}`}
                        onClick={() => handleAnswerChange(question.id, num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
//         </>
//     )
// }

// export default NumberInput;
