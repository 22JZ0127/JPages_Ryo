import SubmitButton from "../../base/submitbutton/SubmitButton";

function QuestionnaireForm({handleSubmit, questions, TextInput, handleAnswerChange, NumberInput, answers}) {
    return (
        <>
            <form className="questionnaire-form" onSubmit={handleSubmit}>
                {questions.map((question, index) => (
                    <div key={index} className="question-item">
                        <label className="question-label">{question.question}</label>
                        {question.isstring === 1 ? (
                            <TextInput
                                question={question}
                                handleAnswerChange={handleAnswerChange}
                            />
                        ) : (
                            <NumberInput
                                answers={answers}
                                question={question}
                                handleAnswerChange={handleAnswerChange}
                            />
                            
                        )}
                    </div>
                ))}
                <SubmitButton/>
            </form>
        </>
    )
}
export default QuestionnaireForm;