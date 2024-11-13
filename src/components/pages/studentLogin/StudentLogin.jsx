import React, { useState } from 'react';
import Ajax from '../../../lib/Ajax';
import './studentLogin.css';
import LoginInput from '../../base/logininput/LoginInput';
import SubmitButton from '../../base/submitbutton/SubmitButton';

const StudentLogin = () => {
  // 入力値をstateで管理
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // フォームの変更を管理
  const handleNumberChange = (e) => {
    setNumber(e.target.value);
    if (errorMessage) setErrorMessage(''); // 入力があったらエラーを消す
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errorMessage) setErrorMessage(''); // 入力があったらエラーを消す
  };

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 必須項目の確認
    if (!number || !name) {
      setErrorMessage('学籍番号と名前を入力してください');
      return;
    }

    const req = {
      number: number,
      name: name,
    };

    try {
      // Ajax.jsの関数を呼び出す
      const response = await Ajax(null, null, 'studentlogin', 'POST', req);

      // レスポンスの確認（例: 成功・失敗に応じてエラーメッセージ表示）
      console.log(response);
      if (response.status === 'success') {
        console.log("ログイン成功。画面遷移。")
        // ログイン後のリダイレクトや別の処理をここに追加
      } else if (response.status === 'failure'){
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage('通信エラーが発生しました');
    }
  };

  return (
    <div className="login-form-container">
        <h2 className="title">ログイン</h2>
        <form onSubmit={handleSubmit}>
            <LoginInput
                id="number"
                label="学籍番号"
                value={number}
                onChange={handleNumberChange}
            />
            <LoginInput
                id="name"
                label="名前"
                value={name}
                onChange={handleNameChange}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <SubmitButton visualType="login" />
        </form>
    </div>
  );
};

export default StudentLogin;
