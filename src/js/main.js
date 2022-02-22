const rampThresholdConsCorrect = 2;
const defaultTimeout = 250;
const defaultISI = 1000;
const defaultinitialspan = 2;
const defaultmaxtrial = 20;
const defaulttestmode = "1-up-2-down-half-switch-stag";
const defaultspandirection = 'forward';

const consentsubmitevent = new Event('consent-submit');

const preparationstartevent = new Event('preparation-start');
const preparationsubmitevent = new Event('preparation-submit');

const instructstartevent = new Event('instruction-start');
const instructionnextevent = new Event('instruction-next');
const instructdemoevent = new Event('instruction-demo-mode');
const instructfinevent = new Event('instruction-finish');

const eventcontrollerinitiateevent = new Event('eventcontroller-initiate');
const teststartevent = new Event('test-start');
const nextrialevent = new Event('next-trial');
const trialfinevent = new Event('trial-finish');
const sessionendevent = new Event('session-end');
const testfinevent = new Event('test-finish');

function main() {
    document.addEventListener('consent-submit', EventFunctions.onConsentSubmit);
    document.addEventListener('preparation-start', EventFunctions.onPreparationStart);
    document.addEventListener('preparation-submit', EventFunctions.onPreparationSubmit);

    document.addEventListener('test-initialized', EventFunctions.onTestintitialized);
    document.addEventListener('trial-finish', EventFunctions.onTrialFinish);
    document.addEventListener('test-finish', EventFunctions.onTestFinish);

    document.addEventListener('instruction-start', EventFunctions.onInstructionStart);
    document.addEventListener('instruction-next', EventFunctions.onInstructionNext);
    document.addEventListener('instruction-finish',EventFunctions.onInstructionFinish);
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
        probeflashmode: null,
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
    
    Timer: {
        timeteststart: null,
        timetestfinish: null,

        timetrialstart: null,
        timetrialanswer: null, // [t1, t2, t3, t4]
        timetrialfinish: null, // 
    },
    trialData: function(trialnumber = null, seqlength = null, span = null, sequence = null, answersequence = null, anstimes = null, trialstart = null, trialfinish = null,) {
        let obj = {}
        obj.trialstart = trialstart;
        obj.trialfinish = trialfinish;
        obj.trialnumber = trialnumber;
        obj.seqlength = seqlength;
        obj.span = span;
        obj.sequence = sequence;
        obj.answersequence = answersequence;
        if (sequence == null) { obj.correct = null } else { obj.correct = MiscOperationFunction.compareSeq(sequence, answersequence) }
        obj.anstimes = anstimes;
        return obj;
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

    sumTestData: function () {
        
    }


}

//#region form validity
function fnameValidation(object) {
    if (object.value === '') {
        object.setCustomValidity('กรุณากรอก ชื่อจริง\nPlease fill your firstname');
    } else if (object.validity.typeMismatch){
        object.setCustomValidity('ชื่อจริง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else if (object.validity.patternMismatch){
        object.setCustomValidity('ชื่อจริง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else {
        object.setCustomValidity('');
    }
    return true;
}

function mnameValidation(object) {
    if (object.validity.typeMismatch){
        object.setCustomValidity('ชื่อกลาง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else if (object.validity.patternMismatch){
        object.setCustomValidity('ชื่อกลาง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else {
        object.setCustomValidity('');
    }
    return true;
}

function lnameValidation(object) {
    if (object.value === '') {
        object.setCustomValidity('กรุณากรอก นามสกุล\nPlease fill your lastname');
    } else if (object.validity.typeMismatch){
        object.setCustomValidity('นามสกุล เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else if (object.validity.patternMismatch){
        object.setCustomValidity('นามสกุล เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else {
        object.setCustomValidity('');
    }
    return true;
}
//#endregion 

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
    let currtrial = dynamicscontainer.currTrialData;
    let eventcontroller = dynamicscontainer.EventController;
    currtrial.seqlength = eventcontroller.seqlength;
    currtrial.sequence = genSeq(currtrial.seqlength);
    currtrial.answersequence = [];
    currtrial.span = eventcontroller.span;
    correct = null;
    anstimes = [];
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
        //setPlayMode('on');
    },
    onPreparationSubmit: function(e) {
        console.log("Preparation data submitted!");
        var id = DynamicsContainer.identifiers;
        var formobj = document.getElementById('preparation-form');
        let time = new Date();

        id.fname = formobj.elements['fname'].value;
        id.mname = formobj.elements['mname'].value;
        id.lname = formobj.elements['lname'].value;
        id.code = sha256(id.fname + " " + id.mname + " " + id.lname);
        id.date = time.toDateString();
        id.timestart = time.toTimeString();

        document.getElementById('preparationCanvas').hidden = true;
        console.log(id);
        document.dispatchEvent(instructstartevent);
    },
    onConsentDenied: function(e) {
        throw ('You should not do this');
    },
    onConsentSubmit: function(e) {
        let consent = document.getElementById('consent').consent.value;
        console.log(consent);

        switch (consent) {
            case "accept":
                document.dispatchEvent(preparationstartevent);
                break;
            case 'deny':
                this.onConsentDenied(new Event(''));
                break;
        }
    },
    onPreparationStart: function(e) {
        console.log('prep-start')
        document.getElementById('welcomeCanvas').hidden = true;
        document.getElementById('preparationCanvas').hidden = false;
    },
    onInstructionStart: function(e) {
        console.log('instruction-start');
        document.getElementById('preparationCanvas').hidden = true;
        document.getElementById('instructionCanvas').hidden = false;
    },
    onInstructionNext: function(e) {
        var icv = document.getElementById('instructionCanvas').getElementsByTagName('div');
        for (let i = 0; i < icv.length; i++) {
            var element = icv[i];
            if (element.hidden == false) {
                let _name = element.getAttribute('id');
                let namestr = _name.slice(0, _name.length - 1);
                let num = parseInt(_name[_name.length - 1]) + 1;
                element.hidden = true;
                document.getElementById(namestr + num).hidden = false;
                break;
            }
        }
    },
    onInstructionFinish: function(e) {
        document.getElementById('instructionCanvas').hidden = true;
        document.getElementById('testCanvas').hidden = false;
        document.dispatchEvent(eventcontrollerinitiateevent);
    },
    onEventControllerInitiation: function (e) {
        document.dispatchEvent(teststartevent);
    }
}

function testinitializer(testmode) {


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

//#region sequential program
main();
//#endregion