import ScanBUsinessCardFormSelect from "../../base/selectclass/SelectClass";

function ScanBusinessCardForm({handleSubmit, visitorType, setVisitorType, setErrorMessage, errorMessage, text, setText, loading, }) {
    return (
        <>
            <form onSubmit={handleSubmit} className='input-container'>
                <ScanBUsinessCardFormSelect
                    visitorType={visitorType}
                    setVisitorType={setVisitorType}
                    setErrorMessage={setErrorMessage}
                />

                {/* エラーメッセージの表示 */}
                {errorMessage && <div className='error-message' style={{ color: 'red' }}>{errorMessage}</div>}

                <input 
                    type="text" 
                    value={text.name} 
                    onChange={e => setText({ ...text, name: e.target.value })} 
                    placeholder="氏名" 
                />
                {!loading && text.name === '' && <div className='warning'>手入力をお願いします</div>}
                
                <input 
                    type="email" 
                    value={text.email} 
                    onChange={e => setText({ ...text, email: e.target.value })} 
                    placeholder="e-mail" 
                />
                {!loading && text.email === '' && <div className='warning'>手入力をお願いします</div>}
                
                <input 
                    type="text" 
                    value={text.companyName} 
                    onChange={e => setText({ ...text, companyName: e.target.value })} 
                    placeholder="所属" 
                />
                {!loading && text.companyName === '' && <div className='warning'>手入力をお願いします</div>}
                
                {(visitorType === '2' || visitorType === '3') && (
                    <div>所属には学科名を入力してください。<br />例：高度情報処理科</div>
                )}

                <button type="submit" className='confirm-btn'>確認</button>
            </form>
        </>
    )
}
export default ScanBusinessCardForm;