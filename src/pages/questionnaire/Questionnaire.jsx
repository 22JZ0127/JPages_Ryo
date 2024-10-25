import React, { useState, useEffect } from 'react';
import Ajax from '../../lib/Ajax';
import './questionnaire.css';

const Questionnaire = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [errorMessage, setErrorMessage] = useState(''); // エラーメッセージの状態を追加
    const token = "visitorToken"; // ローカルストレージからトークンを取得

    useEffect(() => {
        Ajax(null, null, 'questionnaire/1', 'GET', null)
            .then((data) => {
                if (data.status === 'success') {
                    console.log('data : ', data);
                    const sortedQuestions = data.questionnaire.sort((a, b) => a.order - b.order);
                    setQuestions(sortedQuestions);
                } else {
                    console.log('アンケート情報を取得できませんでした笑');
                }
            });
    }, []);

    const handleRatingClick = (questionId, rating) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: rating }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage(''); // エラーメッセージをリセット

        // エラーチェック
        const unansweredQuestions = questions.filter((question) => {
            return question.isstring === 1
                ? !selectedAnswers[question.id] // テキストの回答が未入力
                : selectedAnswers[question.id] === undefined; // 数値の回答が未選択
        });

        if (unansweredQuestions.length > 0) {
            setErrorMessage('すべての質問に回答してください。'); // エラーメッセージを設定
            return;
        }

        const answersArray = questions.map((question) => ({
            questionnaire_id: question.questionnaire_id,
            answer_id: null, // 後で設定
            answer: question.isstring === 1 
                ? selectedAnswers[question.id] // テキストの回答
                : selectedAnswers[question.id], // 数値の回答
        }));

        // まず /survey/answer に POST リクエストを送信 (リクエストボディはnull)
        Ajax(null, token, 'survey/answer', 'POST', null)
            .then((response) => {
                if (response.status === 'success') {
                    console.log("response", response);
                    const answerId = response.id;

                    // 各回答に対してテキストまたは数字で適切なPOSTリクエストを送信
                    answersArray.forEach((answer) => {
                        const url = answer.answer.isstring === 1 ? 'text' : 'number';

                        Ajax(null, token, `survey/answer/${url}`, 'POST', {
                            questionnaire_id: answer.questionnaire_id,
                            answer_id: answerId,
                            answer: answer.answer,
                        });
                    });
                } else {
                    console.log('回答送信に失敗しました');
                }
            });
    };

    return (
        <div className="questionnaire-container">
            <h1 className="title">アンケート</h1>
            {errorMessage && <div className="error-message">{errorMessage}</div>} {/* エラーメッセージの表示 */}
            <form className="questionnaire-form" onSubmit={handleSubmit}>
                {questions.map((question, index) => (
                    <div key={index} className="question-item">
                        <label className="question-label">{question.question}</label>
                        {question.isstring === 1 ? (
                            <textarea 
                                rows="3" 
                                className="answer-input" 
                                name={`answer-${question.id}`}
                                onChange={(e) => handleRatingClick(question.id, e.target.value)} // 入力を更新
                            />
                        ) : (
                            <div className="rating-container">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        type="button"
                                        key={num}
                                        className={`rating-button ${selectedAnswers[question.id] === num ? 'selected' : ''}`}
                                        onClick={() => handleRatingClick(question.id, num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <button type="submit" className="submit-button">送信</button>
            </form>
        </div>
    );
}

export default Questionnaire;
