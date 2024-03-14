
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let osc;

const keys = {
    C: { note: "C", octaveOffset: -1 },
    "C#": { note: "C#", octaveOffset: -1 },
    D: { note: "D", octaveOffset: -1 },
    "D#": { note: "D#", octaveOffset: -1 },
    E: { note: "E", octaveOffset: -1 },
    F: { note: "F", octaveOffset: -1 },
    "F#": { note: "F#", octaveOffset: -1 },
    G: { note: "G", octaveOffset: -1 },
    "G#": { note: "G#", octaveOffset: -1 },
    A: { note: "A", octaveOffset: 0 },
    "A#": { note: "A#", octaveOffset: 0 },
    B: { note: "B", octaveOffset: 0 },
    C2: { note: "C2", octaveOffset: 0 },
    "C#2": { note: "C#2", octaveOffset: 0 },
    D2: { note: "D2", octaveOffset: 0 },
    "D#2": { note: "D#2", octaveOffset: 0 },
    E2: { note: "E2", octaveOffset: 0 }
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

const playKey = (keyNote) => {
    osc = audioContext.createOscillator();
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

    const freq = getHz(keys[keyNote].note, (keys[keyNote].octaveOffset || 0) + 3);

    if (Number.isFinite(freq)) {
        osc.frequency.value = freq;
    }

    const cutoff = parseInt(document.getElementById('cutoff').value);
    const resonance = parseFloat(document.getElementById('resonance').value);
    const attackTime = parseFloat(document.getElementById('attack-control').value);
    const releaseTime = parseFloat(document.getElementById('release-control').value);
    const noteLength = parseFloat(document.getElementById('note-length-control').value);

    const now = audioContext.currentTime;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);
    filter.Q.setValueAtTime(resonance, now);

    const envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attackTime);
    envelope.gain.linearRampToValueAtTime(0, now + attackTime + releaseTime);

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + noteLength);
    const keyElement = document.querySelector(`[note="${keyNote}"]`);
    if (keyElement) {
        keyElement.classList.add("pressed");
        setTimeout(() => {
            keyElement.classList.remove("pressed");
        }, 100);
    }
};

document.addEventListener("mousedown", (e) => {
    const target = e.target;
    const note = target.getAttribute("note");
    if (note && keys.hasOwnProperty(note)) {
        playKey(note);
    } else if (target.classList.contains("black")) {
        const whiteKey = target.getAttribute("data-white");
        if (whiteKey && keys.hasOwnProperty(whiteKey)) {
            playKey(whiteKey);
        }
    }
});

const updateFilter = () => {
    const cutoff = parseInt(document.getElementById('cutoff').value);
    const resonance = parseFloat(document.getElementById('resonance').value);
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, audioContext.currentTime);
    filter.Q.setValueAtTime(resonance, audioContext.currentTime);
};

const updateEnvelope = () => {
    const attackTime = parseFloat(document.getElementById('attack-control').value);
    const releaseTime = parseFloat(document.getElementById('release-control').value);
    const envelope = audioContext.createGain();
    const now = audioContext.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attackTime);
    envelope.gain.linearRampToValueAtTime(0, now + attackTime + releaseTime);
};

const updateWaveform = () => {
    const selectedWaveform = document.getElementById('waveform-select').value;
    if (osc) {
        osc.type = selectedWaveform;
    }
};


document.getElementById('cutoff').addEventListener('input', updateFilter);
document.getElementById('resonance').addEventListener('input', updateFilter);
document.getElementById('attack-control').addEventListener('input', updateEnvelope);
document.getElementById('release-control').addEventListener('input', updateEnvelope);
document.getElementById('waveform-select').addEventListener('change', updateWaveform);
