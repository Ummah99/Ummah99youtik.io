document.addEventListener('DOMContentLoaded', function() {
    const videoUrlInput = document.getElementById('videoUrl');
    const mp4Btn = document.getElementById('mp4Btn');
    const mp3Btn = document.getElementById('mp3Btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultDiv = document.getElementById('result');
    const thumbnailDiv = document.getElementById('thumbnail');
    const videoDetailsDiv = document.getElementById('videoDetails');
    const downloadLink = document.getElementById('downloadLink');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    let selectedFormat = 'mp4';
    
    // Format-Auswahl
    mp4Btn.addEventListener('click', function() {
        mp4Btn.classList.add('active');
        mp3Btn.classList.remove('active');
        selectedFormat = 'mp4';
    });
    
    mp3Btn.addEventListener('click', function() {
        mp3Btn.classList.add('active');
        mp4Btn.classList.remove('active');
        selectedFormat = 'mp3';
    });
    
    // Download-Button
    downloadBtn.addEventListener('click', function() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('Bitte gib eine URL ein.');
            return;
        }
        
        // UI zurücksetzen
        hideAllSections();
        showLoading();
        
        // API-Anfrage senden
        processVideoUrl(url, selectedFormat);
    });
    
    // Funktion zur Verarbeitung der Video-URL
    function processVideoUrl(url, format) {
        // Prüfen, ob es sich um YouTube oder TikTok handelt
        let apiUrl = 'https://api.downloaderapi.xyz/api/convert';
        let platform = '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = 'youtube';
        } else if (url.includes('tiktok.com')) {
            platform = 'tiktok';
        } else {
            showError('Nur YouTube und TikTok URLs werden unterstützt.');
            return;
        }
        
        // Anfrage an die API senden
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                format: format,
                platform: platform
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Erfolgreiche Antwort verarbeiten
            displayResult(data, format);
        })
        .catch(error => {
            showError('Fehler beim Verarbeiten des Videos: ' + error.message);
        });
    }
    
    // Ergebnis anzeigen
    function displayResult(data, format) {
        hideLoading();
        
        // Thumbnail anzeigen
        if (data.thumbnail) {
            thumbnailDiv.innerHTML = `<img src="${data.thumbnail}" alt="Video Thumbnail">`;
        }
        
        // Video-Details anzeigen
        videoDetailsDiv.innerHTML = `
            <h3>${data.title || 'Video'}</h3>
            <p>${data.duration ? 'Dauer: ' + formatDuration(data.duration) : ''}</p>
        `;
        
        // Download-Link setzen
        downloadLink.href = data.downloadUrl;
        downloadLink.download = `video.${format}`;
        downloadLink.textContent = `${format.toUpperCase()} herunterladen`;
        
        // Ergebnis anzeigen
        resultDiv.classList.remove('hidden');
    }
    
    // Hilfsfunktionen
    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    function showLoading() {
        loadingDiv.classList.remove('hidden');
    }
    
    function hideLoading() {
        loadingDiv.classList.add('hidden');
    }
    
    function showError(message) {
        hideLoading();
        errorDiv.querySelector('p').textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    function hideAllSections() {
        resultDiv.classList.add('hidden');
        loadingDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
    }
}); 