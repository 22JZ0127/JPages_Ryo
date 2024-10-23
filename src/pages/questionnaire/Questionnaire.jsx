import React, { useState } from 'react'; 
import footer from '../../components/common/footer/footer';
import Ajax from '../../lib/Ajax';

const Questionnaire = () => {
    Ajax(null, null, 'questionnaire/1', 'GET', null)
    .then((data) => {
        if (data.status === 'success') {
            console.log('data : ', data);
        } else {
            console.log('アンケート情報を取得できませんでした笑 ')
        }
    })
}

export default Questionnaire;