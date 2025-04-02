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
                
                // Direkte Weiterleitung zu einem zuverlässigen Downloader-Service
                // Wir verwenden hier mehrere Optionen für den Fall, dass eine nicht funktioniert
                let downloadServices = [];
                
                if (format === 'mp4') {
                    downloadServices = [
                        {
                            name: "Y2Mate",
                            url: `https://www.y2mate.com/youtube/${videoId}`
                        },
                        {
                            name: "SaveFrom.net",
                            url: `https://de.savefrom.net/#url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
                        },
                        {
                            name: "9xbuddy",
                            url: `https://9xbuddy.com/process?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
                        }
                    ];
                } else {
                    downloadServices = [
                        {
                            name: "Y2Mate MP3",
                            url: `https://www.y2mate.com/youtube-mp3/${videoId}`
                        },
                        {
                            name: "YTMP3.cc",
                            url: `https://ytmp3.cc/youtube-to-mp3/?id=${videoId}`
                        },
                        {
                            name: "OnlineVideoConverter",
                            url: `https://onlinevideoconverter.pro/de/youtube-converter-mp3?url=https://www.youtube.com/watch?v=${videoId}`
                        }
                    ];
                }
                
                // Download-Optionen anzeigen
                let downloadOptionsHTML = `
                    <div class="download-options">
                        <h4>Download-Optionen:</h4>
                        <p>Klicke auf einen der folgenden Dienste, um das Video ${format === 'mp4' ? '' : 'als MP3 '}herunterzuladen:</p>
                        <div class="download-buttons">
                `;
                
                downloadServices.forEach(service => {
                    downloadOptionsHTML += `
                        <a href="${service.url}" target="_blank" class="download-button service-button">
                            ${service.name}
                        </a>
                    `;
                });
                
                downloadOptionsHTML += `
                        </div>
                    </div>
                `;
                
                videoDetailsDiv.innerHTML += downloadOptionsHTML;
                
                // Ursprünglichen Download-Button ausblenden
                downloadLink.style.display = 'none';
                
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
        // Mehrere TikTok Downloader Services anbieten
        const tiktokServices = [
            {
                name: "SSStiK",
                url: "https://ssstik.io/de"
            },
            {
                name: "SnapTik",
                url: "https://snaptik.app/de"
            },
            {
                name: "TikMate",
                url: "https://tikmate.app/"
            }
        ];
        
        // Da wir keine direkte API haben, leiten wir den Benutzer zum Service weiter
        thumbnailDiv.innerHTML = `<div class="placeholder-thumbnail">TikTok Video</div>`;
        
        let tiktokOptionsHTML = `
            <h3>TikTok Video herunterladen</h3>
            <p>Für TikTok-Videos nutzen wir externe Services.</p>
            <p>Kopiere diese URL: <input type="text" value="${videoUrl}" id="tiktokUrlCopy" readonly></p>
            <button id="copyTiktokUrl" class="copy-button">URL kopieren</button>
            <p>Klicke dann auf einen der folgenden Dienste:</p>
            <div class="download-buttons">
        `;
        
        tiktokServices.forEach(service => {
            tiktokOptionsHTML += `
                <a href="${service.url}" target="_blank" class="download-button service-button">
                    ${service.name}
                </a>
            `;
        });
        
        tiktokOptionsHTML += `
            </div>
            <p class="small-note">Füge die kopierte URL auf der Seite des Dienstes ein.</p>
        `;
        
        videoDetailsDiv.innerHTML = tiktokOptionsHTML;
        
        // URL-Kopier-Funktion hinzufügen
        setTimeout(() => {
            const copyButton = document.getElementById('copyTiktokUrl');
            const urlInput = document.getElementById('tiktokUrlCopy');
            
            if (copyButton && urlInput) {
                copyButton.addEventListener('click', function() {
                    urlInput.select();
                    document.execCommand('copy');
                    copyButton.textContent = 'Kopiert!';
                    setTimeout(() => {
                        copyButton.textContent = 'URL kopieren';
                    }, 2000);
                });
            }
        }, 100);
        
        // Ursprünglichen Download-Button ausblenden
        downloadLink.style.display = 'none';
        
        loadingDiv.classList.add('hidden');
        resultDiv.classList.remove('hidden');
    }
    
    // Fehlermeldung anzeigen
    function showError() {
        errorDiv.classList.remove('hidden');
    }
}); 