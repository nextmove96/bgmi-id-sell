const fetchData = async () => {
    try {
        // Show loader
        document.getElementById('loader').style.display = 'block';
        const response = await fetch('https://script.google.com/macros/s/AKfycbxpcEVcvzgMzguTSh-ZSUoUGFBjunw2HqcLqI3yhhnmzuCFAF8S9dR746HD1BOLlTMN9g/exec', {
            method: 'POST'
        });
        const data = await response.json();
        const container = document.getElementById('data-container');
        container.innerHTML = '';
        
        data.forEach((row, index) => {
            const newCard = `
                <div class="card" onclick="showDetails(${index})">
                    <img src="${row.imageUrl}" alt="Image" class="img-bot"/>
                    <div>
                        <h3 class="clickable">${row.accountTitle}</h3>
                    </div>
                </div>
            `;
            container.innerHTML += newCard;
            localStorage.setItem('data-' + index, JSON.stringify(row))
            container.classList.add('activeDetails');
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        // Hide loader
        document.getElementById('loader').style.display = 'none';
        // Add activeDetails class to data-container after hiding loader
        document.getElementById('data-container').classList.add('activeDetails');
    }
};

document.addEventListener('DOMContentLoaded', fetchData);

const showDetails = (index) => {
    const data = JSON.parse(localStorage.getItem('data-' + index));
    document.getElementById('details-content').innerHTML = `
        <img src="${data.imageUrl}" alt="${data.accountTitle}"/>
        <p><strong>Account Title:</strong> ${data.accountTitle}</p>
        <p><strong>Account Description:</strong> ${data.accountDes}</p>
        <p><strong>Price:</strong> ${data.price}</p>
    `;
    document.getElementById('modal').style.display = 'flex';
    localStorage.setItem('selectedItem', JSON.stringify(data));
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
};

const showPaymentForm = () => {
    closeModal();
    const data = JSON.parse(localStorage.getItem('selectedItem'));
    document.getElementById('accountTitle').textContent = data.accountTitle;
    document.getElementById('accountImage').src = data.imageUrl;

    const qrCodeUrl = `upi://pay?pa=createprincemahto-2@okaxis&pn=YourName&am=${data.price}&cu=INR`;
    new QRCode(document.getElementById("qrcode"), {
        text: qrCodeUrl,
        width: 240,
        height: 240,
    });

    document.getElementById('payment-modal').style.display = 'flex';
};

const closePaymentForm = () => {
    document.getElementById('payment-modal').style.display = 'none';
};

document.getElementById('screenshot').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('purchaseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const screenshot = document.getElementById('screenshot').files[0];

    if (!screenshot) return alert("Please upload a screenshot");

    const formData = new FormData();
    formData.append('image', screenshot);
    formData.append('key', '913b9e18d266f5fba255fd9a20ccb6a9');

    try {
        const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });
        const imgbbData = await imgbbResponse.json();
        
        const data = JSON.parse(localStorage.getItem('selectedItem'));
        const sheetData = {
            timestamp: new Date().toISOString(),
            name: name,
            email: email,
            accountTitle: data.accountTitle,
            accountImage: data.imageUrl,
            screenshotUrl: imgbbData.data.url
        };

        await fetch('https://script.google.com/macros/s/AKfycbzxlyVGU5POAyjF2iORyiGp4EuAEaSOl51e0cghsxKtxNtpQYnSu7-wCIyPhSdS9cRiaA/exec', {
            method: 'POST',
            body: JSON.stringify(sheetData)
        });

        alert('Purchase submitted successfully!');
        closePaymentForm();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', fetchData); 
