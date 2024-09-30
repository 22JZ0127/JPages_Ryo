import React, { useState, useRef, useEffect } from 'react'; // useState と useRef をインポート
import './scanBusinessCard.css'; 

const ScanBusinessCard = () => { // コンポーネント名は大文字で始めるべき
    const [image, setImage] = useState(null); // 画像を保持するためのstate
    const [text, setText] = useState({
        token: '',
        name: '',
        companyName: '',
        email: '',
        registrationNumber: ''
    });

    const videoRef = useRef(null); // videoRefを使用するためにuseRefを使用
    const canvasRef = useRef(null); // canvasRefの名前を修正

    useEffect(() => {
        const startCamera = async () => {
            // カメラの映像を取得する
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream; // <video>要素にストリームをセット
                videoRef.current.play(); // カメラを再生
            }
        };

        startCamera(); // カメラを開始
    }, []); // 初回マウント時に実行

    // シャッターボタンが押された時の処理
    const handleCapture = async () => {
        const canvas = canvasRef.current; // canvasRefを使用
        const video = videoRef.current;

        if (canvas && video) {
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height); // カメラ映像をcanvasに描画
            const dataURL = canvas.toDataURL('image/png'); // 'imaga/png'を'png'に修正
            setImage(dataURL); // プレビュー用に画像データを保存
            await recognizeText(canvas.toBlob()); // OCRを実行 (関数名を修正)
        }
    };

    // Google Cloud Vision API を呼び出してOCR処理を行う
    const recognizeText = async (blob) => { // 関数名を修正
        const formData = new FormData();
        formData.append('image', blob); // 画像をフォームデータに追加

        try {
            const response = await fetch('/api/ocr', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setText(prevState => ({ ...prevState, name: data.text })); // OCR結果をstateに設定
        } catch (error) {
            console.error('Error:', error); // エラーログを表示
        }
    };

    return (
        <div className='container'>
            <div className='business-card'>
                {image && <img src={image} alt='Captured Business Card' />} {/* キャプチャした画像を表示 */}
                <div className='dimensions'></div> {/* 'dimentions'を'dimensions'に修正 */}
                <video ref={videoRef} width="960" height="540" style={{ display: 'none' }}></video> {/* カメラ映像 */}
                <canvas ref={canvasRef} width="960" height="540" style={{ display: 'none' }}></canvas> {/* canvasは隠して使用 */}
            </div>
            <button onClick={handleCapture} style={{ marginTop: '20px', padding: '10px', fontSize: '16px' }}>
                ●
            </button>
            <div className='input-container'>
                <label>トークン</label> {/* 'lavel'を'label'に修正 */}
                <input 
                    type="text"
                    value={text.token}
                    onChange={e => setText({ ...text, token: e.target.value })}
                />
                <label>基本情報</label> {/* 'lavel'を'label'に修正 */}
                <input
                    type="text"
                    value={text.name}
                    onChange={e => setText({ ...text, name: e.target.value })}
                    placeholder="氏名"
                />
                <input
                    type="email"
                    value={text.email}
                    onChange={e => setText({ ...text, email: e.target.value })}
                    placeholder="e-mail"
                />
                <label>会社情報</label> {/* 'lavel'を'label'に修正 */}
                <input
                    type="text"
                    value={text.companyName}
                    onChange={e => setText({ ...text, companyName: e.target.value })}
                    placeholder="会社名"
                />
                <input
                    type="text"
                    value={text.registrationNumber}
                    onChange={e => setText({ ...text, registrationNumber: e.target.value })}
                    placeholder="法人番号"
                />
                <button onClick={() => console.log(text)}>変更</button>
            </div>
        </div>
    );
};

export default ScanBusinessCard; // コンポーネント名も修正
