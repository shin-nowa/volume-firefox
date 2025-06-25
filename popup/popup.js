const volumeSlider = document.getElementById('volume-slider');
const percentageDisplay = document.getElementById('volume-percentage');

volumeSlider.addEventListener('input', () => {
    percentageDisplay.textContent = `${volumeSlider.value}%`;
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length > 0) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "setVolume",
                volume: volumeSlider.value / 100
            });
        }
    });
});

function syncSliderOnOpen() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length > 0) {
            browser.tabs.sendMessage(tabs[0].id, { command: "getVolumeState" })
                .then(response => {
                    if (response && typeof response.extensionVolume !== 'undefined') {
                        volumeSlider.value = response.extensionVolume * 100;
                    }
                })
                .catch(err => {
                    console.log(`Não foi possível obter estado da guia: ${err.message}`);
                });
        }
    });
}
syncSliderOnOpen();