import React, { useState, useRef, useEffect } from 'react'; // useState と useRef をインポート
import './scanBusinessCard.css'; 

const ScanBusinessCard = () => {
    const [image, setImage] = useState(null); // 画像を保持するためのstate
    const [text, setText] = useState({
        token: '',
        name: '',
        companyName: '',
        email: '',
        registrationNumber: ''
    });
    const [isImageCaptured, setIsImageCaptured] = useState(false); // 画像がキャプチャされたかどうかを管理

    const videoRef = useRef(null); // videoRefを使用するためにuseRefを使用
    const canvasRef = useRef(null); // canvasRefの名前を修正

    useEffect(() => {
        let stream;
    
        const startCamera = async () => {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    // すでにストリームがある場合は停止
                    if (videoRef.current.srcObject) {
                        const tracks = videoRef.current.srcObject.getTracks();
                        tracks.forEach(track => track.stop());
                    }
                    videoRef.current.srcObject = newStream; // 新しいストリームを設定
                    await videoRef.current.play(); // play()を呼び出す
                }
            } catch (error) {
                console.error("カメラへのアクセスエラー: ", error);
            }
        };
        
        
        
    
        startCamera();
    
        return () => {
            // クリーンアップ: コンポーネントがアンマウントされたときにストリームを停止
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // シャッターボタンが押された時の処理
    const handleCapture = async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!isImageCaptured) {
            // 画像がまだキャプチャされていない場合
            if (canvas && video) {
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height); // ビデオのフレームをキャンバスに描画
        
                // toBlob メソッドを使って画像をBlobに変換し、コールバックで処理
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        setImage(URL.createObjectURL(blob)); // プレビュー用にBlobから画像URLを生成
                        await recognizeText(blob); // BlobデータをOCRに送信
                    }
                }, 'image/png'); // 画像フォーマットを指定
                setIsImageCaptured(true); // 画像がキャプチャされたとマーク
            }
        } else {
            // 画像がすでにキャプチャされている場合
            setIsImageCaptured(false); // 状態をリセット
            setImage(null); // キャプチャした画像をクリア
        }
    };

    // Google Cloud Vision API を呼び出してOCR処理を行う
    const recognizeText = async (blob) => {
        const base64Image = await blobToBase64(blob); // BlobをBase64に変換
    
        const requestBody = {
            requests: [
                {
                    image: {
                        content: base64Image // Base64エンコードされた画像を設定
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION', // 必要に応じてタイプを変更
                            maxResults: 10,
                        },
                    ],
                },
            ],
        };
    
        try {
            const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBIMyKU-0GPuNkVM23NjqhqUUuwgn-3OsE', {
                method: 'POST',
                body: JSON.stringify(requestBody), // JSON.stringifyでリクエストボディを文字列に変換
                headers: {
                    'Content-Type': 'application/json', // JSONのコンテンツタイプを設定
                },
            });
    
            if (!response.ok) {
                throw new Error(`HTTPエラー! ステータス: ${response.status}`); // エラーハンドリング
            }
    
            const data = await response.json(); // APIレスポンスをJSONに変換
            console.log(data); // レスポンスデータをコンソールに出力
    
            // Google Vision API の結果を処理する
            if (data && data.responses) {
                const textAnnotations = data.responses[0].textAnnotations;
                if (textAnnotations && textAnnotations.length > 0) {
                    setText(prevState => ({
                        ...prevState,
                        name: textAnnotations[0].description // 例: 名前をOCR結果から取得
                    }));
                }
            }
        } catch (error) {
            console.error('Google Vision API のリクエストに失敗しました: ', error); // エラーログを表示
        }
    };
    
    

    // BlobをBase64に変換するヘルパー関数
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // Base64部分のみを返す
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob); // BlobをDataURLに変換
        });
    };

    return (
        <div className='container'>
            <div className='business-card'>
                <video ref={videoRef} width="960" height="540" style={{ display: isImageCaptured ? 'none' : 'block' }}></video> {/* カメラ映像を表示 */}
                <canvas ref={canvasRef} width="960" height="540" style={{ display: 'none' }}></canvas> {/* canvasは隠して使用 */}
                {image && <img src={image} alt='Captured Business Card' />} {/* キャプチャした画像を表示 */}
                <button className='shutterbutton' onClick={handleCapture} style={{ marginTop: '20px', padding: '10px', fontSize: '16px' }}>
                ●
                </button>
            </div>
            <div className='input-container'>
                <div className='token-container'>
                    <label>トークン</label>
                    <select name="selectToken" id="selectToken"></select>
                </div>

                <div className='information-container'>
                    <label className='basic-info'>基本情報</label>
                    <input
                        type="text"
                        value={text.name || ''} // 空文字列をデフォルト値として設定
                        onChange={e => setText({ ...text, name: e.target.value })}
                        placeholder="氏名"
                    />
                    <input
                        type="email"
                        value={text.email || ''} // 空文字列をデフォルト値として設定
                        onChange={e => setText({ ...text, email: e.target.value })}
                        placeholder="e-mail"
                    />
                </div>

                <div className='companyInfo-container'>
                    <label>会社情報</label>
                    <input
                        type="text"
                        value={text.companyName || ''} // 空文字列をデフォルト値として設定
                        onChange={e => setText({ ...text, companyName: e.target.value })}
                        placeholder="会社名"
                    />
                    <input
                        type="text"
                        value={text.registrationNumber || ''} // 空文字列をデフォルト値として設定
                        onChange={e => setText({ ...text, registrationNumber: e.target.value })}
                        placeholder="法人番号"
                    />
                </div>
                <div className='button-container'>
                    <button className='change-button' onClick={() => console.log(text)}>変更</button>
                </div>
                
            </div>
        </div>
    );
};

export default ScanBusinessCard; // コンポーネント名も修正
