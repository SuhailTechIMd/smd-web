let input=document.getElementById('Input');
let GenButton=document.getElementById('GenButt');
let QRcode=document.getElementsByClassName('QRCode')[0];
let QRimg=QRcode.querySelector('img');
GenButton.addEventListener("click",() =>{
      let value=input.value;
      if(!value)return;
      GenButton.innerText="Generating QR Code.....";
      QRimg.src=`https://api.qrserver.com/v1/create-qr-code/?size=225x225&data=${value} `;
      QRimg.addEventListener("load",() =>{
        QRcode.classList.remove("d-none");
        GenButton.innerText="Generate QR Code";
      })
      

})
 