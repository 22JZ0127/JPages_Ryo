import React, { useState, useRef, useEffect } from 'react'; 
import './scanBusinessCard.css'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

const ScanBusinessCardMobile = () => {
    const [image, setImage] = useState(null); 
    const [text, setText] = useState({
        name: '',
        companyName: '',
        email: ''
    });
    const [visitorType, setVisitorType] = useState(''); // 追加: 選択された訪問者タイプ
    const [isImageCaptured, setIsImageCaptured] = useState(false); 
    const [loading, setLoading] = useState(false); 

    const videoRef = useRef(null); 
    const canvasRef = useRef(null); 

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (videoRef.current && videoRef.current.srcObject) {
                    const tracks = videoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
    
                const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            await videoRef.current.play();
                        } catch (playError) {
                            console.error("ビデオ再生エラー: ", playError);
                        }
                    };
                }
            } catch (error) {
                console.error("カメラへのアクセスエラー: ", error);
            }
        };
    
        startCamera();
    
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);
    

    const handleCapture = async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!isImageCaptured) {
            if (canvas && video) {
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height); 
        
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        setImage(URL.createObjectURL(blob)); 
                        setLoading(true); 
                        await recognizeText(blob); 
                        setLoading(false);
                    }
                }, 'image/png'); 
                setIsImageCaptured(true); 
            }
        } else {
            setIsImageCaptured(false); 
            setImage(null); 
        }
    };

    const recognizeText = async (blob) => {
        const base64Image = await blobToBase64(blob);

        const requestBody = {
            requests: [
                {
                    image: { content: base64Image },
                    features: [{ type: 'TEXT_DETECTION', maxResults: 10 }],
                },
            ],
        };

        try {
            const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBIMyKU-0GPuNkVM23NjqhqUUuwgn-3OsE', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }

            const data = await response.json();
            const detectedText = data.responses[0].fullTextAnnotation.text;

            await handleAnalyzeAndFill(detectedText);
        } catch (error) {
            console.error('Vision APIエラー:', error);
        }
    };

    const handleAnalyzeAndFill = async (text) => {
        const entities = await analyzeWithGemini(text);
        fillFormWithEntities(entities); 
    };

    const genAI = new GoogleGenerativeAI('AIzaSyCR6hmKAfUoRmW3SIGarJuanTYNCXRUA9c');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const analyzeWithGemini = async (inputText) => {
        console.log(inputText);
    
        const prompt = `以下のテキストから名前、メールアドレス、会社名をそれぞれ抽出してください。形式はPERSON（名前）、MAIL（メールアドレス）、ORGANIZATION（会社名）で、それぞれの値を対応するプロパティに出力してください。

        - 名前は漢字を優先してください。
        - メールアドレスは「@」を含む形式で指定してください。
        - 会社名は最も妥当なもので、株式会社という文字列がある場合はそれを含むものを優先して選んでください。
        - 会社名に当てはまるものがなく、学校名だと思われるものと学科名だと思われるものがある場合は、学校名ではな●●科のような学科名をORGANIZATIONに出力してください。
        - 極力各要素を埋めるようにしてください。
        
        もしエンティティが見つからない場合は、各プロパティの値を空文字列にし、nullにはしないでください。
        
        最終応答は、"{"で始まり"}"で終わるJSONのみを出力し、JSON以外の文字は一切応答に含めないでください。出力は次のような形式にしてください:
        
        {
          "PERSON": "<名前>",
          "MAIL": "<メールアドレス>",
          "ORGANIZATION": "<会社名>"
        }
        
        テキスト: ${inputText}
`;

        try {
            const result = await model.generateContent(prompt);
            const textResponse = await result.response.text();
            console.log('Generated response:', textResponse);
            const entities = JSON.parse(textResponse);
            fillFormWithEntities(entities);
        } catch (error) {
            console.error('レスポンス解析エラー:', error);
        }
    };

    const fillFormWithEntities = (entities) => {
        if (!entities) return;

        const { PERSON = '', MAIL = '', ORGANIZATION = '' } = entities;

        setText({ 
            name: PERSON, 
            email: MAIL, 
            companyName: ORGANIZATION 
        });
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // (中略)

// (中略)

return (
    <div className='container'>
        {!isImageCaptured ? (
            <div className='camera'>
                <video ref={videoRef} className='video' />
                <p>名刺をスキャンしてください</p>
                <button className='capture-btn' onClick={handleCapture}>●</button>
            </div>
        ) : (
            <form action="POST" className='input-container'>
                {/* セレクトボックスを最上部に配置 */}
                <select 
                    value={visitorType} 
                    onChange={e => setVisitorType(e.target.value)}
                    className="select-box"
                >
                    <option value="">来場者区分を選択してください</option>
                    <option value="1">企業の方</option>
                    <option value="2">教員</option>
                    <option value="3">日本電子専門学校生</option>
                    <option value="4">卒業生</option>
                    <option value="5">その他</option>
                </select>

                <input 
                    type="text" 
                    value={text.name} 
                    onChange={e => setText({ ...text, name: e.target.value })} 
                    placeholder="氏名" 
                />
                {text.name === '' && <div className='warning'>手入力をお願いします</div>}
                
                <input 
                    type="email" 
                    value={text.email} 
                    onChange={e => setText({ ...text, email: e.target.value })} 
                    placeholder="e-mail" 
                />
                {text.email === '' && <div className='warning'>手入力をお願いします</div>}
                
                <input 
                    type="text" 
                    value={text.companyName} 
                    onChange={e => setText({ ...text, companyName: e.target.value })} 
                    placeholder="所属" 
                />
                {text.companyName === '' && <div className='warning'>手入力をお願いします</div>}
                
                {/* 手入力をお願いしますメッセージを所属の下に表示 */}
                {(visitorType === '2' || visitorType === '3') && (
                    <div>所属には学科名を入力してください。</div>
                )}

                <button className='confirm-btn' onClick={() => console.log('次の画面へ遷移')}>確認</button>
            </form>
        )}
        {loading && <div className='loading-message'>現在スキャン中です...</div>}
        <canvas ref={canvasRef} className='canvas' width="960" height="540" style={{ display: 'none' }}></canvas>
    </div>
);


};

export default ScanBusinessCardMobile;
