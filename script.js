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
        const videoUrl = videoUrlInput.value.trim();
        
        if (!videoUrl) {
            alert('Bitte gib eine Video-URL ein');
            return;
        }
        
        if (!isValidUrl(videoUrl)) {
            alert('Bitte gib eine gültige TikTok oder YouTube URL ein');
            return;
        }
        
        // UI zurücksetzen
        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        
        // Kostenlose API-Anfrage senden
        processVideoUrl(videoUrl, selectedFormat);
    });
    
    // URL-Validierung
    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return (
                parsedUrl.hostname.includes('tiktok.com') || 
                parsedUrl.hostname.includes('youtube.com') || 
                parsedUrl.hostname.includes('youtu.be')
            );
        } catch (e) {
            return false;
        }
    }
    
    // Video-URL verarbeiten
    function processVideoUrl(videoUrl, format) {
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            processYouTubeVideo(videoUrl, format);
        } else if (videoUrl.includes('tiktok.com')) {
            processTikTokVideo(videoUrl, format);
        } else {
            showError();
            loadingDiv.classList.add('hidden');
        }
    }
    
    // YouTube Video verarbeiten
    function processYouTubeVideo(videoUrl, format) {
        // YouTube Video ID extrahieren
        let videoId = '';
        
        if (videoUrl.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(videoUrl).search);
            videoId = urlParams.get('v');
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        }
        
        if (!videoId) {
            showError();
            loadingDiv.classList.add('hidden');
            return;
        }
        
        // Kostenloser YouTube Downloader Service
        const downloadBaseUrl = 'https://yt-download.org/api/button';
        let downloadUrl = '';
        
        if (format === 'mp4') {
            downloadUrl = `${downloadBaseUrl}/mp4/${videoId}`;
        } else {
            downloadUrl = `${downloadBaseUrl}/mp3/${videoId}`;
        }
        
        // Video-Informationen über die YouTube oEmbed API abrufen
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            .then(response => {
                if (!response.ok) throw new Error('Fehler beim Abrufen der Video-Informationen');
                return response.json();
            })
            .then(data => {
                // Ergebnisse anzeigen
                thumbnailDiv.innerHTML = `<img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="Video Thumbnail">`;
                videoDetailsDiv.innerHTML = `
                    <h3>${data.title || 'YouTube Video'}</h3>
                    <p>Kanal: ${data.author_name || 'Unbekannt'}</p>
                `;
                
                // Download-Link setzen
                downloadLink.href = downloadUrl;
                downloadLink.target = "_blank";
                downloadLink.download = `youtube_${videoId}.${format}`;
                
                loadingDiv.classList.add('hidden');
                resultDiv.classList.remove('hidden');
            })
            .catch(err => {
                console.error(err);
                loadingDiv.classList.add('hidden');
                showError();
            });
    }
    
    // TikTok Video verarbeiten
    function processTikTokVideo(videoUrl, format) {
        // Kostenloser TikTok Downloader Service
        const ssstikUrl = 'https://ssstik.io/de';
        
        // Da wir keine direkte API haben, leiten wir den Benutzer zum Service weiter
        thumbnailDiv.innerHTML = `<div class="placeholder-thumbnail">TikTok Video</div>`;
        videoDetailsDiv.innerHTML = `
            <h3>TikTok Video herunterladen</h3>
            <p>Für TikTok-Videos nutzen wir einen externen Service.</p>
            <p>Klicke auf den Button unten, um zum Download-Service zu gelangen.</p>
        `;
        
        // Download-Link setzen
        downloadLink.href = ssstikUrl;
        downloadLink.target = "_blank";
        downloadLink.textContent = "Zum TikTok Downloader";
        
        loadingDiv.classList.add('hidden');
        resultDiv.classList.remove('hidden');
    }
    
    // Fehlermeldung anzeigen
    function showError() {
        errorDiv.classList.remove('hidden');
    }
}); 