function ScanBUsinessCardFormSelect({visitorType, setVisitorType, setErrorMessage }) {
    return (
        <>
            <select 
                value={visitorType} 
                onChange={e => {
                    setVisitorType(e.target.value);
                    // エラーメッセージをリセット
                    if (e.target.value !== '0') {
                        setErrorMessage('');
                    }
                }}
                className="select-box"
            >
                <option value="0">来場者区分を選択してください</option>
                <option value="1">企業の方</option>
                <option value="2">教員</option>
                <option value="3">日本電子専門学校生</option>
                <option value="4">卒業生</option>
                <option value="5">その他</option>
            </select>
        </>
    )
}
export default ScanBUsinessCardFormSelect;