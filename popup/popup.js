const volumeSlider = document.querySelector('#volume-slider');

function setTabVolume(tabs){
    const volume = volumeSlider.value / 100;
    browser.tabs.sendMessage(tabs[0].id, {
        command: 'setVolume',
        volume: volume
    });
}

volumeSlider.addEventListener('input', () => {
    browser.tabs.query({active: true, currentWindow: true})
    .then(setTabVolume)
    .catch(error => conmsole.error(`Error: ${error}`));
});