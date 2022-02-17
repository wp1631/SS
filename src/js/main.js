const rampThresholdConsCorrect = 2;
const defaultTimeout = 250;
const defaultISI = 1000;
const defaultinitialspan = 2;
const defaulttestmode = "1-up-2-down-half-switch-stag";

const trialfinevent = new Event('trial-finish');
const testfinevent = new Event('test-finish');
const initializeevent = new Event('test-initialized');
const nextrialevent = new Event('next-trial');
const sessionendevent = new Event('session-end')


function main() {
    document.addEventListener('trial-finish', EventFunctions.onTrialFinish);
    document.addEventListener('test-finish', EventFunctions.onTestFinish);
    document.addEventListener('test-initialized', EventFunctions.onTestintitialized);
}


var DynamicsContainer = {
    currTrialData: {
        seqlength: null,
        sequence: [],
        answersequence: [],
        span: null,
        correct: null,
        anstimes: []
    },
    EventController: {
        initialseqlength: 2,
        seqlength: 2,
        timestart: 0,
        span: "",
        currTrial: 1,
        maxtrial: 20,
        ISImode: null,
        probetimeout: null,
        testmode: null,
        switchingFunc: function() {; },
    },
    identifiers: {
        fname: "",
        mname: "",
        lname: "",
        code: "",
        date: "",
        timestart: null,
    },
    testContainer: {
        trialData: [],
        spans: [],
        corrects: [],
        created: [],
        testmode: null,
        ISImode: null,
        probetimeout: null,
        maxtrial: null,
    },

    trialData: function(trialnumber = null, seqlength = null, span = null, sequence = null, answersequence = null, anstimes = null) {
        let obj = {}
        obj.trialnumber = trialnumber;
        obj.seqlength = seqlength;
        obj.span = span;
        obj.sequence = sequence;
        obj.answersequence = answersequence;
        if (sequence == null) { obj.correct = null } else { obj.correct = MiscOperationFunction.compareSeq(sequence, answersequence) }
        obj.anstimes = anstimes;
        return obj;
    },

    eventController: function(currtrial, iniseqlength, timestart, span, consecutivecorrect, consecutivespancorrect, maxtrial, testmode, ISImode, probetimeout) {
        let obj = {}
        obj.CurrTrial = currtrial;
        obj.initialseqlength = iniseqlength;
        obj.seqlength = iniseqlength;
        obj.timestart = timestart;
        obj.span = span;
        obj.oldspan = oldspan;
        obj.consecutivecorrect = consecutivecorrect;
        obj.consecutivespancorrect = consecutivespancorrect;
        obj.maxtrial = maxtrial;
        obj.testmode = testmode;
        obj.ISImode = ISImode;
        obj.probetimeout = probetimeout;
        obj.switchingFunc = switchingFuncGenerator(testmode);
        return obj;
    },
}

function dynamicUpdate(dynamicscontainer, promptupdate) {
    var ecl = dynamicscontainer.EventController;
    if (promptupdate.seqlength) {
        switch (promptupdate.seqlength) {
            case 'up':
                ecl.seqlength += 1;
                break;
            case 'down':
                ecl.seqlength -= 1;
                break;
            case 'reset':
                ecl.seqlength = ecl.iniseqlength;
        }
    }

    if (promptupdate.span) {
        switch (promptupdate.span) {
            case 'reverse':
                ecl.span = (ecl.span == 'forward') ? 'backward' : 'forward';
                break;
            case 'forward':
                ecl.span = 'forward';
                break;
            case 'backward':
                ecl.span = 'backward';
                break;
        }
    }
}

function promptNewTrial(dynamicscontainer) {
    var currtrial = dynamicscontainer.currTrialData;
    currtrial = null;
}

function switchingFuncGenerator(testmode) {
    switch (testmode) {
        case "1-up-2-down-no-switch-forward-stag": //only forward
            break;
        case "1-up-2-down-no-switch-backward-stag": //only backward
            break;
        case "1-up-2-down-half-switch-stag": // First half forward then backward with stagnation
            function res_func(dynamicscontainer) {
                let corr = dynamicscontainer.testContainer.corrects;
                let sp = dynamicscontainer.testContainer.spans;
                let length = sp.length;
                let promtupdate = {};
                //#region span check
                if (length > 2) {
                    if (sp.includes('backward')) {
                        let ll = length - sp.lastIndexOf('forward');
                        if (ll > 3) {
                            if (length - ll == 21) {
                                document.dispatchEvent(sessionendevent);
                            } else if (length - ll < 22) {
                                switch (ll % 2) {
                                    case 0: //even
                                        if (corr[length - 1]) {
                                            if ((corr[length - 3] == false) && (corr[length - 4] == false)) {
                                                if (corghbhbjhbjhar[length - 2]) {
                                                    promtupdate.seqlength = 'up';
                                                } else {
                                                    document.dispatchEvent(sessionendevent);
                                                }
                                            } else if (corr[length - 1] || corr[length - 2]) {
                                                promtupdate.seqlength = 'up';
                                            } else {
                                                //Do nothing
                                            }
                                        }
                                        break;
                                    case 1: //odd
                                        if (corr[length - 1] && (corr[length - 2] == false) && (corr[length - 3] == false)) {
                                            document.dispatchEvent(sessionendevent);
                                        }
                                        break;
                                }
                            } else {
                                console.log("We should not be here");
                            }
                        }
                    } else {
                        // length of forward equal to total length
                        if (length == dynamicscontainer.EventController.maxtrial) {
                            document.dispatchEvent(sessionendevent);
                        } else if (length < dynamicscontainer.EventController.maxtrial + 1) {
                            switch (length % 2) {
                                case 1: // odd
                                    //signal sessionend for first correct after long consecutive false
                                    if (corr[length - 1] && (corr[length - 2] == false) && (corr[length - 3] == false)) {
                                        document.dispatchEvent(sessionendevent);
                                    }
                                    break;
                                case 0: //even
                                    if (corr[length - 1]) {
                                        if ((corr[length - 3] == false) && (corr[length - 4] == false)) {
                                            if (corr[length - 2]) {
                                                promtupdate.seqlength = 'up';
                                            } else {
                                                document.dispatchEvent(sessionendevent);
                                            }
                                        } else if (corr[length - 1] || corr[length - 2]) {
                                            promtupdate.seqlength = 'up';
                                        } else {
                                            //Do nothing
                                        }
                                    }
                                    break;
                            }
                        } else {
                            console.log("We should not be here"); // Error
                        }
                    }
                }
                //#endregion
            }
        case "default-ramp-switch-stag": // ramp-switch with default parameters
            break;
        case "1-up-2-down-random-stag": // 1:1 chance keep : change
            break;
        case "1-up-2-down-stag": //
            break;
    }
    return res_func;
}

var EventFunctions = {
    forProbeFlash: function(e) {
        FlashProbe(e.target);
    },
    forProbeClick: function(e) {
        SelectProbe(e.target);
        if (CheckTrialFinish()) {
            setPlayMode("off");
        }
    },
    onTrialFinish: function(e) {
        console.log("Trial Finish");
        console.log(DynamicsContainer.currTrialData);
    },
    onTestFinish: function(e) {
        console.log("Test Finish");
        console.log(DynamicsContainer.testContainer);
    },
    onTestintitialized: function(e) {
        console.log('Test initialized');
        console.log(DynamicsContainer.EventController);
        console.log(DynamicsContainer.identifiers);
    },
}

function SelectProbe(object) {
    _name = object.getAttribute("id");
    //do upon being selected
    DynamicsContainer.currTrialData.answersequence.push(_name[_name.length - 1]); //push only probe number to answer collection
    console.log(DynamicsContainer.currTrialData);
    //do after selected
}

function FlashProbe(object, flashmode = "flashing-forward", timeout = defaultTimeout) {
    var probeRef = object;
    old_class = probeRef.getAttribute("class")
    switch (flashmode) {
        case "flashing-forward":
            probeRef.setAttribute("class", "Probe-flashing-forward")
            break;
        case "flashing-backward":
            probeRef.setAttribute("class", "Probe-flashing-backward")
            break;
    }
    setTimeout(function() {
        probeRef.setAttribute("class", "Probe")
    }, timeout)
}

function sequenceFlash(seq, flashmode = "flashing-forward", timeout = defaultTimeout, ISI = defaultISI, seqmode = 'const-interval') {
    switch (seqmode) {
        case "const-interval":
            let waittime = ISI - timeout;
            for (let i = 0; i < seq.length; i++) {
                setTimeout(() => { FlashProbe(document.getElementById("Probe" + seq[i]), flashmode, timeout); }, i * ISI + waittime);
            }
            break;
    }
}

function setPlayMode(mode = "on") {
    document.getElementById("welcomeCanvas").hidden = true;
    document.getElementById("testCanvas").hidden = false;
    switch (mode) {
        case "on":
            for (let i = 1; i < 7; i++) {
                var temp = document.getElementById("Probe" + i)
                temp.addEventListener("click", EventFunctions.forProbeFlash)
                temp.addEventListener("click", EventFunctions.forProbeClick)
            }
            break;
        case "demo":
            for (let i = 1; i < 7; i++) {
                var temp = document.getElementById("Probe" + i)
                temp.addEventListener("click", EventFunctions.forProbeFlash)
            }
        case "off":
            for (let i = 1; i < 7; i++) {
                var temp = document.getElementById("Probe" + i)
                temp.removeEventListener("click", EventFunctions.forProbeFlash)
                temp.removeEventListener("click", EventFunctions.forProbeClick)
            }
            break;
    }
}

function InitializeTestparams(firstname = null, middlename = null, lastname = null, code = null, startseqlength = 3, span = 'forward', maxtrial = 40, testmode = 'no-switch') {
    var idf = DynamicsContainer.identifiers;
    var ecl = DynamicsContainer.EventController;

    idf.fname = firstname || "ANON";
    idf.identifiers.mname = middlename || "ANON";
    idf.identifiers.lname = lastname || "ANON";

    let tempcode = code || "ANON";
    idf.identifiers.code = MiscOperationFunction.sha256(tempcode);
    idf.identifiers.date = (new Date()).toDateString();

    ecl.seqlength = startseqlength;
    ecl.span = span;
    ecl.timestart = (new Date()).toTimeString();
    ecl.maxtrial = maxtrial;
    ecl.testmode = testmode;
    ecl.consecutivecorrect = 0;
    ecl.consecutiveSpancorrect = 0;
    ecl.currTrial = 1;
}

/** 
function updateDynamicparams(DynamicsContainer) {
    currSeq = DynamicsContainer.currTrialData.sequence;
    ansSeq = DynamicsContainer.currTrialData.answersequence;
    correct = MiscOperationFunction.compareSeq(currSeq, ansSeq);
    poscsccorrect = DynamicsContainer.EventController.consecutivecorrect >= 0;
    poscscspancorrect = ansSeq.EventController.consecutiveSpancorrect >= 0;

    switch (correct) {
        case true:
            if (poscsccorrect) {
                DynamicsContainer.EventController.consecutivecorrect += 1;
                DynamicsContainer.EventController.consecutiveSpancorrect += 1;
            } else {
                DynamicsContainer.EventController.consecutivecorrect = 1;
                DynamicsContainer.EventController.consecutiveSpancorrect = 1;
            }
            if (DynamicsContainer.EventController.span != DynamicsContainer.EventController.oldspan) {
                DynamicsContainer.EventController.consecutiveSpancorrect = 0;
            }
            break;
        case false:
            if (poscsccorrect) {
                DynamicsContainer.EventController.consecutivecorrect = -1;
                DynamicsContainer.EventController.consecutiveSpancorrect = -1;
            } else {
                DynamicsContainer.EventController.consecutivecorrect += 1;
                DynamicsContainer.EventController.consecutiveSpancorrect += 1;
            }
            if (DynamicsContainer.EventController.span != DynamicsContainer.EventController.oldspan) {
                DynamicsContainer.EventController.consecutiveSpancorrect = 0;
            }
            break;
    }
}
**/

function genSeq(seqlength, numOption = 6) {
    var seq = []
    for (var i = 0; i < seqlength; i++) {
        // randInt from 1 to 6 
        var num = Math.floor(Math.random() * numOption) + 1;
        seq[i] = num;
    };
    return seq;
}

function playData() {
    var playData = {
        clickData: null, //
        hoverData: null, //
    };
    return playData;
}

function CheckFinishTrial(dynamicscontainer) {
    if (dynamicscontainer.currTrialData.seqlength == dynamicscontainer.currTrialData.sequence.length) {
        //print("Trial end with");
        //console.log(dynamicscontainer.currTrial);
        return yes
    }
}

function CheckFinishTest(dynamicscontainer) {
    if (dynamicscontainer.currTrialData.seqlength == dynamicscontainer.currTrialData.sequence.length) {
        //print("Trial end with")
        //console.log(dynamicscontainer)
        return yes
    }
}

function changeBackground(backgroundmode = 'forward') {
    let canvas = document.getElementById('testCanvas');
    let changeto = null;
    switch (backgroundmode) {
        case ('forward'):
            changeto = 'testCanvas-forward';
            break;
        case ('backward'):
            changeto = 'testCanvas-backward';
            break;
        case ('neutral'):
            changeto = 'testCanvas-neutral';
            break;
    }
    canvas.setAttribute('class', changeto)
}

//#region MiscOperationFunction
MiscOperationFunction = {
        compareSeq: (seq1, seq2) => {
            console.assert(typeof(seq1) == "object")
            console.assert(seq1.length == seq2.length)
            var truthValue = true;
            for (let i = 0; i < seq1.length; i++) {
                if (seq1 != seq2) { truthValue = false }
            }
            return truthValue;
        },
        sha256: (ascii) => {
            function rightRotate(value, amount) {
                return (value >>> amount) | (value << (32 - amount));
            };

            var mathPow = Math.pow;
            var maxWord = mathPow(2, 32);
            var lengthProperty = 'length';
            var i, j; // Used as a counter across the whole file
            var result = '';

            var words = [];
            var asciiBitLength = ascii[lengthProperty] * 8;

            //* caching results is optional - remove/add slash from front of this line to toggle
            // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
            // (we actually calculate the first 64, but extra values are just ignored)
            var hash = sha256.h = sha256.h || [];
            // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
            var k = sha256.k = sha256.k || [];
            var primeCounter = k[lengthProperty];
            /*/
            var hash = [], k = [];
            var primeCounter = 0;
            //*/

            var isComposite = {};
            for (var candidate = 2; primeCounter < 64; candidate++) {
                if (!isComposite[candidate]) {
                    for (i = 0; i < 313; i += candidate) {
                        isComposite[i] = candidate;
                    }
                    hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                    k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
                }
            }

            ascii += '\x80'; // Append '1' bit (plus zero padding)
            while (ascii[lengthProperty] % 64 - 56) ascii += '\x00'; // More zero padding
            for (i = 0; i < ascii[lengthProperty]; i++) {
                j = ascii.charCodeAt(i);
                if (j >> 8) return; // ASCII check: only accept characters in range 0-255
                words[i >> 2] |= j << ((3 - i) % 4) * 8;
            }
            words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
            words[words[lengthProperty]] = (asciiBitLength)

            // process each chunk
            for (j = 0; j < words[lengthProperty];) {
                var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
                var oldHash = hash;
                // This is now the "working hash", often labelled as variables a...g
                // (we have to truncate as well, otherwise extra entries at the end accumulate
                hash = hash.slice(0, 8);

                for (i = 0; i < 64; i++) {
                    var i2 = i + j;
                    // Expand the message into 64 words
                    // Used below if 
                    var w15 = w[i - 15],
                        w2 = w[i - 2];

                    // Iterate
                    var a = hash[0],
                        e = hash[4];
                    var temp1 = hash[7] +
                        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                        +
                        ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                        +
                        k[i]
                        // Expand the message schedule if needed
                        +
                        (w[i] = (i < 16) ? w[i] : (
                            w[i - 16] +
                            (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                            +
                            w[i - 7] +
                            (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                        ) | 0);
                    // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
                    var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                        +
                        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

                    hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
                    hash[4] = (hash[4] + temp1) | 0;
                }

                for (i = 0; i < 8; i++) {
                    hash[i] = (hash[i] + oldHash[i]) | 0;
                }
            }

            for (i = 0; i < 8; i++) {
                for (j = 3; j + 1; j--) {
                    var b = (hash[i] >> (j * 8)) & 255;
                    result += ((b < 16) ? 0 : '') + b.toString(16);
                }
            }
            return result;
        },
        revSeq: (seq, rev) => {
            if (~rev) {
                return seq;
            } else if (rev) {
                return seq.reverse();
            } else {
                throw EvalError;
            }
        },
    }
    //#endregion