const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const keys = {
    C: { element: getElementByNote("C"), note: "C", octaveOffset: -1 },
    W: { element: getElementByNote("C#"), note: "C#", octaveOffset: -1 },
    S: { element: getElementByNote("D"), note: "D", octaveOffset: -1 },
    E: { element: getElementByNote("D#"), note: "D#", octaveOffset: -1 },
    D: { element: getElementByNote("E"), note: "E", octaveOffset: -1 },
    F: { element: getElementByNote("F"), note: "F", octaveOffset: -1 },
    T: { element: getElementByNote("F#"), note: "F#", octaveOffset: -1 },
    G: { element: getElementByNote("G"), note: "G", octaveOffset: -1 },
    Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: -1 },
    H: { element: getElementByNote("A"), note: "A", octaveOffset: 0 },
    U: { element: getElementByNote("A#"), note: "A#", octaveOffset: 0 },
    J: { element: getElementByNote("B"), note: "B", octaveOffset: 0 },
    K: { element: getElementByNote("C2"), note: "C", octaveOffset: 0 },
    O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: 0 },
    L: { element: getElementByNote("D2"), note: "D", octaveOffset: 0 },
    P: { element: getElementByNote("D#2"), note: "D#", octaveOffset: 0 },
    semicolon: { element: getElementByNote("E2"), note: "E", octaveOffset: 0 }
};

const getHz = (note = "A", octave = 4) => {
    const A4 = 440;
    let N = 0;
    switch (note) {
        default:
        case "A":
            N = 0;
            break;
        case "A#":
        case "Bb":
            N = 1;
            break;
        case "B":
            N = 2;
            break;
        case "C":
            N = 3;
            break;
        case "C#":
        case "Db":
            N = 4;
            break;
        case "D":
            N = 5;
            break;
        case "D#":
        case "Eb":
            N = 6;
            break;
        case "E":
            N = 7;
            break;
        case "F":
            N = 8;
            break;
        case "F#":
        case "Gb":
            N = 9;
            break;
        case "G":
            N = 10;
            break;
        case "G#":
        case "Ab":
            N = 11;
            break;
    }
    N += 12 * (octave - 4);
    return A4 * Math.pow(2, N / 12);
};

const pressedNotes = new Map();
let clickedKey = "";

const playKey = (key) => {
    if (!keys[key]) {
        return;
    }

    const osc = audioContext.createOscillator();
    const noteGainNode = audioContext.createGain();
    noteGainNode.connect(audioContext.destination);

    const zeroGain = 0.00001;
    const maxGain = 0.5;
    const sustainedGain = 0.001;

    noteGainNode.gain.value = zeroGain;

    const setAttack = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            maxGain,
            audioContext.currentTime + 0.01
        );
    const setDecay = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            sustainedGain,
            audioContext.currentTime + 1
        );
    const setRelease = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            zeroGain,
            audioContext.currentTime + 2
        );

    setAttack();
    setDecay();
    setRelease();

    osc.connect(noteGainNode);

    const waveform = keys[key].waveform || 'triangle';
    osc.type = waveform;

    const freq = getHz(keys[key].note, (keys[key].octaveOffset || 0) + 3);

    if (Number.isFinite(freq)) {
        osc.frequency.value = freq;
    }


    const cutoff = parseInt(document.getElementById('cutoff').value);
    const resonance = parseFloat(document.getElementById('resonance').value);
    const attackTime = parseFloat(document.getElementById('attack-control').value);
    const releaseTime = parseFloat(document.getElementById('release-control').value);
    const noteLength = parseFloat(document.getElementById('note-length-control').value);


    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, audioContext.currentTime);
    filter.Q.setValueAtTime(resonance, audioContext.currentTime);



    const envelope = audioContext.createGain();
    const now = audioContext.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attackTime);
    envelope.gain.linearRampToValueAtTime(0, now + attackTime + releaseTime);

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + noteLength);

    keys[key].element.classList.add("pressed");
    pressedNotes.set(key, osc);
};

const stopKey = (key) => {
    if (!keys[key]) {
        return;
    }

    keys[key].element.classList.remove("pressed");
    const osc = pressedNotes.get(key);

    if (osc) {
        osc.stop();
        pressedNotes.delete(key);
    }
};

document.addEventListener("keydown", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!key || pressedNotes.get(key)) {
        return;
    }
    playKey(key);
});

document.addEventListener("keyup", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!key) {
        return;
    }
    stopKey(key);
});

for (const [key, { element }] of Object.entries(keys)) {
    element.addEventListener("mousedown", () => {
        playKey(key);
        clickedKey = key;
    });
}

document.addEventListener("mouseup", () => {
    stopKey(clickedKey);
});

document.getElementById("waveform-select").addEventListener("change", function () {
    const selectedWaveform = this.value;
    pressedNotes.forEach((osc, key) => {
        osc.type = selectedWaveform;
    });
    for (const key in keys) {
        if (!pressedNotes.has(key)) {
            keys[key].waveform = selectedWaveform;
        }
    }
});

const attackControl = document.querySelector('#attack-control');
const releaseControl = document.querySelector('#release-control');
const noteLengthControl = document.querySelector('#note-length-control');

attackControl.addEventListener('input', function () {

});

releaseControl.addEventListener('input', function () {

});

noteLengthControl.addEventListener('input', function () {

});



const getControlsValues = () => {
    return {
        cutoff: parseInt(document.getElementById('cutoff').value),
        resonance: parseFloat(document.getElementById('resonance').value),
        attackTime: parseFloat(document.getElementById('attack-control').value),
        releaseTime: parseFloat(document.getElementById('release-control').value),
        noteLength: parseFloat(document.getElementById('note-length-control').value),
        waveform: document.getElementById('waveform-select').value
    };
};





const updateSynthParams = () => {
    const { cutoff, resonance, attackTime, releaseTime, noteLength, waveform } = getControlsValues();


    const cutoffFactor = 1000;
    const resonanceFactor = 10;


    pressedNotes.forEach((osc, key) => {
        osc.type = waveform;


        const filter = osc.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff * cutoffFactor, osc.context.currentTime);
        filter.Q.setValueAtTime(resonance * resonanceFactor, osc.context.currentTime);
        osc.disconnect();
        osc.connect(filter);


        const envelope = osc.context.createGain();
        const now = osc.context.currentTime;
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(1, now + attackTime);
        envelope.gain.linearRampToValueAtTime(0, now + attackTime + releaseTime);

        osc.disconnect();
        osc.connect(envelope);
        envelope.connect(osc.context.destination);
    });


    for (const key in keys) {
        if (!pressedNotes.has(key)) {
            keys[key].waveform = waveform;
        }
    }
};





document.getElementById("waveform-select").addEventListener("change", () => {
    updateSynthParams();
});


document.querySelectorAll('.controls input[type="range"]').forEach(input => {
    input.addEventListener('input', () => {
        updateSynthParams();
    });
});