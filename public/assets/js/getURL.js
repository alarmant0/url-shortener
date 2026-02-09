function getTinyURL() {
    const ph1 = document.getElementById('ph1');
    const url = ph1.value.trim();
    if (!isValid(url)) {
    	alert("Not valid url");
    	return;
    } 
    const params = {
        full_url: url
    };

    fetch('/api/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
    	const result = document.getElementById("result");
    	const full_url = data.url;
    	result.textContent = full_url;
    	result.classList.add("show");
    })
    .catch(error => {
        console.error('Error creating TinyURL:', error);
    });
}

function isValid(url) {
	const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;
	return urlRegex.test(url);
}