import styles from "./camera.module.css"

function Camera({videoRef, handleCapture}) {
    return (
        <>
            <div className={styles["camera"]}>
                <video ref={videoRef} className={styles["video"]} />
                <p>名刺をスキャンしてください</p>
                <button className={styles["capture-btn"]} onClick={handleCapture}>●</button>
            </div>
        </>
    )
}
export default Camera;