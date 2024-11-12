import React, { useState } from 'react';
import Ajax from '../../../lib/Ajax';
import styles from './studentLogin.css';
import LoginInput from '../../base/logininput/LoginInput';
import SubmitButton from '../../base/submitbutton/SubmitButton';

const StudentLogin = () => {
  // 入力値をstateで管理
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // フォームの変更を管理
  const handleNumberChange = (e) => setNumber(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);

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
      if (response.success) {
        alert('ログイン成功');
        // ログイン後のリダイレクトや別の処理をここに追加
      } else {
        setErrorMessage('ログインに失敗しました');
      }
    } catch (error) {
      setErrorMessage('通信エラーが発生しました');
    }
  };

  return (
    <div className={styles["login-form-container"]}>
        <h2 className={styles["title"]}>ログイン</h2>
        <form onSubmit={handleSubmit}>
            <LoginInput
                id="number"
                label="学籍番号"
                value={number}
                onChange={handleNumberChange}
                placeholder="例: 22jz0127"
            />
            <LoginInput
                id="name"
                label="名前"
                value={name}
                onChange={handleNameChange}
                placeholder="例: 鈴木涼"
            />
            {errorMessage && <p className={styles["error-message"]}>{errorMessage}</p>}
            <SubmitButton visualType="login" />
        </form>
    </div>
);
};

export default StudentLogin;
