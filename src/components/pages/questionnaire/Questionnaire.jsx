import React, { useState, useEffect } from 'react';
// import NumberInput from '../../components/questionnaire/NumberInput';
import Ajax from '../../../lib/Ajax';
import './questionnaire.css';
import NumberInput from '../../base/numberinput/NumberInput';
import TextInput from '../../base/textinput/TextInput'
import QuestionnaireForm from '../../common/questionnaireform/QuestionnaireForm';

const Questionnaire = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]); // 回答を配列で管理
    const [errorMessage, setErrorMessage] = useState('');
    const token = "visitorToken1"; // ローカルストレージからトークンを取得

    useEffect(() => {
        Ajax(null, null, 'questionnaire/1', 'GET')
            .then((data) => {
                if (data.status === 'success') {
                    console.log('data : ', data);
                    const sortedQuestions = data.questionnaire.sort((a, b) => a.order - b.order);
                    setQuestions(sortedQuestions);

                    // 初期回答の配列を質問データに基づいて作成
                    const initialAnswers = sortedQuestions.map((question) => ({
                        questionnaire_id: question.questionnaire_id,
                        question_id: question.id,
                        answer: question.isstring === 1 ? '' : null // テキスト/評価のプレースホルダー
                    }));
                    setAnswers(initialAnswers);
                } else {
                    console.log('アンケート情報を取得できませんでした');
                }
            });
    }, []);

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
                answer.question_id === questionId ? { ...answer, answer: value } : answer
            )
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        // すべての質問に回答しているか確認
        const unansweredQuestions = answers.filter((answer) => answer.answer === '' || answer.answer === null);
        if (unansweredQuestions.length > 0) {
            setErrorMessage('すべての質問に回答してください。');
            return;
        }

        try {
            // 最初に/survey/answerにPOSTし、answer_idを取得
            const response = await Ajax(null, token, 'survey/answer', 'POST', null);
            if (response.status === 'success') {
                console.log("response", response);
                const answerId = response.id;

                // 各回答をそれぞれのエンドポイントに送信
                for (const answer of answers) {
                    const endpoint = questions.find(q => q.id === answer.question_id).isstring === 1
                        ? 'survey/answer/text'
                        : 'survey/answer/number';

                    const postData = {
                        question_id: answer.question_id,
                        answer_id: answerId,
                        answer: answer.answer,
                    };

                    const res = await Ajax(null, token, endpoint, 'POST', postData);
                    if (res.status !== 'success') {
                        console.error(`質問ID ${answer.question_id} の回答送信に失敗しました:`, res);
                    }
                }
                console.log("すべての回答が送信されました");
            } else {
                console.log('回答送信に失敗しました');
            }
        } catch (error) {
            console.error('初期回答の送信エラー:', error);
        }
    };

    return (
        <>
            <div className="questionnaire-container">
                <h1 className="title">アンケート</h1>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
            <QuestionnaireForm
                handleSubmit={handleSubmit}
                questions={questions}
                TextInput={TextInput}
                handleAnswerChange={handleAnswerChange}
                NumberInput={NumberInput}
                answers={answers}
            />
        </>
    );
};

export default Questionnaire;