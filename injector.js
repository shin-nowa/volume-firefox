console.log("Injetor de volume iniciado.");

const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
let lastKnownVolume = 1.0;

window.AudioContext = window.webkitAudioContext = function(...args) {
    console.log("AudioContext do Songsterr interceptado.");
    const context = new OriginalAudioContext(...args);
    const masterGainNode = context.createGain();

    masterGainNode.gain.value = lastKnownVolume;
    masterGainNode.connect(context.destination);

    Object.defineProperty(context, 'destination', {
        get: () => masterGainNode
    });
    
    console.log("Feito! A 'saída final' do contexto agora é o nosso nó de volume. O som será forçado a passar por nós.");

    context.onstatechange = () => {
        console.log(`Estado do contexto mudou para: ${context.state}`);
    };
    window.addEventListener("message", (event) => {
        if (event.source === window && event.data.type === "SET_VOLUME_SONGTERR") {
            lastKnownVolume = event.data.volume;
            masterGainNode.gain.setValueAtTime(lastKnownVolume, context.currentTime);
        }
    }, false);
    return context;
};