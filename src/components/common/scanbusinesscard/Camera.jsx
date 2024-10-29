function Camera({videoRef, handleCapture}) {
    return (
        <>
            <div className='camera'>
                <video ref={videoRef} className='video' />
                <p>名刺をスキャンしてください</p>
                <button className='capture-btn' onClick={handleCapture}>●</button>
            </div>
        </>
    )
}
export default Camera;