import React, { useState, useRef, useEffect } from 'react'; 
import './scanBusinessCard.css'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

const ScanBusinessCard = () => {
    const [image, setImage] = useState(null); 
    const [text, setText] = useState({
        token: '',
        name: '',
        companyName: '',
        email: '',
        registrationNumber: ''
    });
    const [isImageCaptured, setIsImageCaptured] = useState(false); 

    const videoRef = useRef(null); 
    const canvasRef = useRef(null); 

    useEffect(() => {
        const startCamera = async () => {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
                        await recognizeText(blob); 
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
                    image: {
                        content: base64Image,
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION',
                            maxResults: 10,
                        },
                    ],
                },
            ],
        };
    
        try {
            const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBIMyKU-0GPuNkVM23NjqhqUUuwgn-3OsE', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (!response.ok) {
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }
    
            const data = await response.json();
            console.log(data);
            const text = data.responses[0].fullTextAnnotation.text;
    
            // 抽出したテキストをGoogle Gemini APIで分析
            await handleAnalyzeAndFill(text);
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

    const analyzeWithGemini = async (inputtext) => {

        console.log(inputtext);

        const prompt =  `以下のテキストからPERSON(名前)、MAIL(メールアドレス)、ORGANIZATION(会社名)を抽出しJavaScriptで"""""そのまま""""""jsonに変換できるレスポンスを出力してください。最初に形式を説明するような文字は入れないでください。:\n${inputtext}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log(response);

        const text = response.text();
        console.log('text', text);
    };
    
    
    
    

    const fillFormWithEntities = (entities) => {
        let name = '';
        let companyName = '';
        let email = '';

        // entitiesオブジェクトから必要なデータを抽出
        if (entities) {
            name = entities.find(entity => entity.type === 'PERSON')?.name || '';
            companyName = entities.find(entity => entity.type === 'ORGANIZATION')?.name || '';
            email = entities.find(entity => entity.type === 'MAIL')?.name || '';
        }

        setText(prevState => ({
            ...prevState,
            name,
            companyName,
            email,
        }));
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    return (
        <div className='container'>
            <div className='business-card'>
                <video ref={videoRef} width="960" height="540" style={{ display: isImageCaptured ? 'none' : 'block' }}></video>
                <canvas ref={canvasRef} width="960" height="540" style={{ display: 'none' }}></canvas>
                {image && <img src={image} alt='Captured Business Card' />}
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
                        value={text.name || ''}
                        onChange={e => setText({ ...text, name: e.target.value })}
                        placeholder="氏名"
                    />
                    <input
                        type="email"
                        value={text.email || ''}
                        onChange={e => setText({ ...text, email: e.target.value })}
                        placeholder="e-mail"
                    />
                </div>

                <div className='companyInfo-container'>
                    <label>会社情報</label>
                    <input
                        type="text"
                        value={text.companyName || ''}
                        onChange={e => setText({ ...text, companyName: e.target.value })}
                        placeholder="会社名"
                    />
                    <input
                        type="text"
                        value={text.registrationNumber || ''}
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

export default ScanBusinessCard;
