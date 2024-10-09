import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './receptionQR.css'; // 外部CSSファイルをインポート

const QRCodeGenerator = () => {
  const [visitorNumber, setVisitorNumber] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const apiUrl = 'https://example.com/api/visitors'; // 仮のAPI URL

  // 最新の来場者番号を取得する関数 (visitorNumberを更新)
  const fetchVisitorNumber = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const newVisitorNumber = data.visitorNumber + 1; // 最新の来場者番号 + 1
      setVisitorNumber(newVisitorNumber);
      setQrCodeUrl(`https://example.com/visitor/${newVisitorNumber}`); // QRコードURLを生成
    } catch (error) {
      console.error('来場者番号の取得エラー:', error);
    }
  };

  // 初回ロード時に来場者番号を取得
  useEffect(() => {
    fetchVisitorNumber();
  }, []);

  // QRコードスキャン後にPOSTし、再度来場者番号を取得して新しいQRコードを生成
  const handleScan = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitorNumber }), // visitorNumberをPOST
      });
      
      const data = await response.json();
      console.log('QRコードスキャン後にPOSTされたデータ:', data);

      // 整合性を保つため、最新の来場者番号を再取得
      await fetchVisitorNumber();
    } catch (error) {
      console.error('QRコードスキャン後のPOSTエラー:', error);
    }
  };

  return (
    <div className="qr-code-container">
      <p className="qr-instruction">スマートフォンで読み込んでください</p>
      <QRCode value={qrCodeUrl ? qrCodeUrl : 'https://example.com'} size={256} className="qr-code" />
      <p className="visitor-message">
        あなたは{visitorNumber ? visitorNumber.toString().padStart(4, '0') : '----'}番目の来場者です
      </p>
    </div>
  );
};

export default QRCodeGenerator;
