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
    const [isImageCaptured, setIsImageCaptured] = useState(false); 
    const [loading, setLoading] = useState(false); // Loading state

    const videoRef = useRef(null); 
    const canvasRef = useRef(null); 

    useEffect(() => {
        const startCamera = async () => {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    if (videoRef.current.srcObject) {
                        const tracks = videoRef.current.srcObject.getTracks();
                        tracks.forEach(track => track.stop());
                    }
                    videoRef.current.srcObject = newStream; 
                    await videoRef.current.play(); 
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
                        setLoading(true); // Start loading
                        await recognizeText(blob); 
                        setLoading(false); // End loading
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
        
        もしエンティティが見つからない場合は、各プロパティの値を空文字列にしてください。
        
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
            
            // テキストとしてレスポンスを取得
            const textResponse = await result.response.text();  // テキストデータを取得
            console.log('Generated response:', textResponse);
    
            // JSONパースしてオブジェクトを取得
            const entities = JSON.parse(textResponse);  // テキストをJSONに変換
    
            // フォームにエンティティを反映
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

    return (
        <div className='container'>
            {!isImageCaptured ? (
                <div className='camera'>
                    <video ref={videoRef} className='video' />
                    <button className='capture-btn' onClick={handleCapture}>●</button>
                </div>
            ) : (
                <div className='input-container'>
                    <input 
                        type="text" 
                        value={text.name} 
                        onChange={e => setText({ ...text, name: e.target.value })} 
                        placeholder="氏名" 
                    />
                    {text.name === '' && <div className='warning'>手入力をお願いします</div>} {/* 手入力促すメッセージ */}
                    
                    <input 
                        type="email" 
                        value={text.email} 
                        onChange={e => setText({ ...text, email: e.target.value })} 
                        placeholder="e-mail" 
                    />
                    {text.email === '' && <div className='warning'>手入力をお願いします</div>} {/* 手入力促すメッセージ */}
                    
                    <input 
                        type="text" 
                        value={text.companyName} 
                        onChange={e => setText({ ...text, companyName: e.target.value })} 
                        placeholder="会社名" 
                    />
                    {text.companyName === '' && <div className='warning'>手入力をお願いします</div>} {/* 手入力促すメッセージ */}
                    
                    <button className='confirm-btn' onClick={() => console.log('次の画面へ遷移')}>確認</button>
                </div>
            )}
            {loading && <div className='loading-message'>現在スキャン中です...</div>} {/* ローディングメッセージ */}
            <canvas ref={canvasRef} className='canvas' width="960" height="540" style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default ScanBusinessCardMobile;
