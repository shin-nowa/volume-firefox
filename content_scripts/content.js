console.log('Script iniciado. (Volume)');

const s = document.createElement('script');
s.src = browser.runtime.getURL('injector.js');
s.onload = function() {
    this.remove();
};

(document.head || document.documentElement).appendChild(s);
console.log('[ContentScript] injector.js foi injetado na página.');

const state = {
    extensionVolume: 1.0, // Vol Controlado pela extensão
    siteVolume: 1.0,      // Vol Controlado pelo slider do site (ex: YouTube)
    isExtensionSetting: false // Flag para não ter loop
};

//Funções de mixer de volume.
function applyMixerVolume(element) {
    const finalVolume = state.extensionVolume * state.siteVolume;
    state.isExtensionSetting = true;
    element.volume = finalVolume;
    setTimeout(() => { state.isExtensionSetting = false; }, 100);
}

function attachMixerTo(mediaElement) {
    if (mediaElement.hasAttribute('data-mixer-attached')) return;
    mediaElement.setAttribute('data-mixer-attached', 'true');
    
    state.siteVolume = mediaElement.volume;

    mediaElement.addEventListener('volumechange', () => {
        if (state.isExtensionSetting) return;
        if (state.extensionVolume !== 0) {
            state.siteVolume = mediaElement.volume / state.extensionVolume;
        } else {
            state.siteVolume = mediaElement.volume > 0 ? 1 : 0;
        }
    });
}

// Listener Principal de Mensagem
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.command) {
        case "setVolume":
            state.extensionVolume = message.volume;
            // Atua no Mixer (YouTube ou outros sites)
            document.querySelectorAll('video, audio').forEach(applyMixerVolume);
            // 2. Atua no Web Audio (Songsterr, por exemplo)
            window.postMessage({ type: "SET_VOLUME_SONGTERR", volume: state.extensionVolume }, "*");
            break;

        case "getVolumeState":
            sendResponse({ extensionVolume: state.extensionVolume });
            return true;
    }
});

setInterval(() => document.querySelectorAll('video, audio').forEach(attachMixerTo), 2000);