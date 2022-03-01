const rampThresholdConsCorrect = 2;
const defaultTimeout = 250;
const defaultISI = 1000;
const defaultISImode = 'const-interval';

const defaultinitialspan = 2;
const defaultmaxtrial = 5;
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
const trialstartevent = new Event('trial-start');
const nextrialevent = new Event('trial-next');
const trialfinevent = new Event('trial-finish');
const sessionendevent = new Event('session-end');
const testfinevent = new Event('test-finish');
const sequenceflashfinish = new Event('sequential-flash-finish');

const databaseevent = new Event('database');

function main() {
    document.addEventListener('consent-submit', EventFunctions.onConsentSubmit);
    document.addEventListener('preparation-start', EventFunctions.onPreparationStart);
    document.addEventListener('preparation-submit', EventFunctions.onPreparationSubmit);

    document.addEventListener('test-initialized', EventFunctions.onTestintitialized);
    document.addEventListener('test-start', EventFunctions.onTestStart);
    document.addEventListener('trial-start', EventFunctions.onTrialStart);
    document.addEventListener('trial-next', EventFunctions.onTrialStart);
    document.addEventListener('sequential-flash-finish', EventFunctions.toPlay);
    document.addEventListener('trial-finish', EventFunctions.onTrialFinish);
    document.addEventListener('test-finish', EventFunctions.onTestFinish);

    document.addEventListener('instruction-start', EventFunctions.onInstructionStart);
    document.addEventListener('instruction-next', EventFunctions.onInstructionNext);
    document.addEventListener('instruction-finish', EventFunctions.onInstructionFinish);

    document.addEventListener('eventcontroller-initiate', EventFunctions.onEventControllerInitiation);
}

var DynamicsContainer = {
    currTrialData: {
        seqlength: null,
        sequence: [],
        answersequence: [],
        span: null,
    },
    EventController: {
        initialseqlength: defaultinitialspan,
        seqlength: defaultinitialspan,
        span: 'forward',
        currTrial: 1,
        maxtrial: defaultmaxtrial,
        ISI: defaultISI,
        ISImode: defaultISImode,
        probetimeout: defaultTimeout,
        probeflashmode: defaultISImode,
        testmode: defaulttestmode,
        switchingFunc: switchingFuncGenerator(defaulttestmode),
    },
    identifiers: {
        fname: null,
        mname: null,
        lname: null,
        code: null,
        date: null,
        dob: null,
        timestart: null,
    },

    Timer: {
        timeteststart: null,
        timetestfinish: null,
        timetrialstart: null,
        timeprobestart: null,
        timeprobeend: null,
        timetrialanswer: [], // [t11, t12, t13, t4]
        timetrialfinish: null,
    },

    trialData: function(trialnumber = null, seqlength = null, span = null, sequence = null, answersequence = null, anstimes = null, timetrialstart = null, timetrialfinish = null, timeprobestart = null, timeprobeend = null) {
        var obj = {};
        obj.timetrialstart = timetrialstart;
        obj.timetrialfinish = timetrialfinish;
        obj.timeprobestart = timeprobestart;
        obj.timeprobeend = timeprobeend;
        obj.trialnumber = trialnumber;
        obj.seqlength = seqlength;
        obj.span = span;
        obj.sequence = sequence;
        obj.answersequence = answersequence;
        obj.anstimes = anstimes;
        if (sequence === null) {
            obj.correct = null;
        } else {
            obj.correct = MiscOperationFunction.compareSeq(sequence, MiscOperationFunction.revSeq(answersequence, span));
        }
        return obj;
    },

    testContainer: {
        trialData: [],
        spans: [],
        corrects: [],
        created: [],
        initialseqlength: defaultinitialspan,
        testmode: defaulttestmode,
        ISImode: defaultISImode,
        probetimeout: defaultTimeout,
        maxtrial: defaultmaxtrial,
    },

    currentTrialData: function(seqlength = null, span = null) {
        let obj = {
            seqlength: seqlength || DynamicsContainer.EventController.seqlength,
            answersequence: [],
            span: span || DynamicsContainer.EventController.span,
        }
        obj.sequence = genSeq(obj.seqlength);
        return obj;
    },

    sumTestData: function(code = null, identifiers = null, trialDataArr = null, testmode = defaulttestmode, ISImode = defaultISImode, ISI = defaultISI, probetimeout = defaultTimeout, maxtrial = defaultmaxtrial, iniseqlength = defaultinitialspan, timestamp_teststart = null, timestamp_testfinish = null) {
        let obj = {}
        let now = new Date();
        obj.id = code || "Anonymous";
        obj.identifiers = identifiers || null;
        obj.date = now.toDateString();
        obj.timestamp = now.toTimeString();
        obj.testdata = {
            timestamp_teststart: null || timestamp_teststart,
            timestamp_testfinish: null || timestamp_testfinish,
            trialDataArr: trialDataArr,
            testmode: testmode,
            ISImode: ISImode,
            ISI: ISI,
            probetimeout: probetimeout,
            maxtrial: maxtrial,
            initialseqlength: iniseqlength,
        }

        return obj;
    },

    sumSensitiveContent: function(code = null, fname = null, mname = null, lname = null, date = null) {
        let obj = {
            id: code || "Anonymous",
            firstname: fname || "Anoynymous",
            middlename: mname === "" ? "" : null,
            lastname: lname || "Anonymous",
            date: date || new Date().toISOString(),
        }
        return obj;
    }
}
var promptupdate = {};

//#region form validity
function fnameValidation(object) {
    if (object.value === '') {
        object.setCustomValidity('กรุณากรอก ชื่อจริง\nPlease fill your firstname');
    } else if (object.validity.typeMismatch) {
        object.setCustomValidity('ชื่อจริง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else if (object.validity.patternMismatch) {
        object.setCustomValidity('ชื่อจริง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else {
        object.setCustomValidity('');
    }
    return true;
}

function mnameValidation(object) {
    if (object.validity.typeMismatch) {
        object.setCustomValidity('ชื่อกลาง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else if (object.validity.patternMismatch) {
        object.setCustomValidity('ชื่อกลาง เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else {
        object.setCustomValidity('');
    }
    return true;
}

function lnameValidation(object) {
    if (object.value === '') {
        object.setCustomValidity('กรุณากรอก นามสกุล\nPlease fill your lastname');
    } else if (object.validity.typeMismatch) {
        object.setCustomValidity('นามสกุล เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else if (object.validity.patternMismatch) {
        object.setCustomValidity('นามสกุล เป็นภาษาไทยหรือภาษาอังกฤษ ไม่มีเว้นวรรคและอักขระพิเศษ\nThai or English without spacings and special characters');
    } else {
        object.setCustomValidity('');
    }
    return true;
}
//#endregion 

function dynamicUpdate(promptupdate) {
    var ecl = DynamicsContainer.EventController;
    ecl.currTrial += 1;
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

function switchingFuncGenerator(testmode) {
    switch (testmode) {
        case "1-up-2-down-no-switch-forward-stag": //only forward
            break;
        case "1-up-2-down-no-switch-backward-stag": //only backward
            break;
        case "1-up-2-down-half-switch-stag": // First half forward then backward with stagnation
            function res_func(dynamicscontainer) {
                var obj = {};
                var container = dynamicscontainer.testContainer;
                var corrArray = container.corrects;
                var spanArray = container.spans;
                //Check session of test
                let secondhalf = spanArray.includes('backward');
                let li = spanArray.length - 1;
                if (secondhalf) {
                    let l = spanArray.length - spanArray.indexOf('backward');
                    if (l > 1) {
                        switch (l % 2) {
                            case 0: //even session2
                                if (corrArray[li]) {
                                    if ((corrArray[li - 1] === false) && (corrArray[li - 2] === false) && (corrArray[li - 3] === false)) {
                                        //Terminate game
                                        document.dispatchEvent(testfinevent);
                                    } else {
                                        //Pass with span+=1
                                        obj.seqlength = 'up';
                                    }
                                } else {
                                    if (corrArray[li - 1]) {
                                        //pass with span+=1
                                        obj.seqlength = 'up';
                                    } else {
                                        //pass with stag
                                        obj.stag = true;
                                    }
                                }
                                break;
                            case 1: //odd session2
                                if (corrArray[li]) {
                                    if ((corrArray[li - 1] === false) && (corrArray[li - 2] === false)) {
                                        //terminate game
                                        document.dispatchEvent(testfinevent);
                                    } else {
                                        //pass
                                    }
                                } else {
                                    //pass
                                }
                                break;
                        }
                    }
                    if (l == DynamicsContainer.EventController.maxtrial) {
                        document.dispatchEvent(testfinevent);
                    }
                } else {
                    let l = spanArray.length;
                    if (l > 1) {
                        switch (l % 2) {
                            case 0: //even session
                                if (corrArray[li]) {
                                    if ((corrArray[li - 1] === false) && (corrArray[li - 2] === false) && (corrArray[li - 3] === false)) {
                                        //Terminate session + change span direction
                                        obj.span = 'reverse';
                                    } else {
                                        //Pass with span+=1
                                        obj.seqlength = 'up';
                                    }
                                } else {
                                    if (corrArray[li - 1]) {
                                        //pass with span+=1
                                        obj.seqlength = 'up';
                                    } else {
                                        //pass with stag
                                        obj.stag = true;
                                    }
                                }
                                break;
                            case 1: //odd session
                                if (corrArray[li]) {
                                    if ((corrArray[li - 1] == false) && (corrArray[li - 2] == false)) {
                                        //terminate session chagen span direction
                                        obj.span = 'reverse';
                                    } else {
                                        //pass
                                    }
                                } else {
                                    //pass
                                }
                                break;
                        }
                    }
                    if (l == DynamicsContainer.EventController.maxtrial) {
                        //First session end
                        obj.span = 'reverse';
                    }
                }
                return obj;
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
        console.log(e.target.id)
    },
    forProbeClick: function(e) {
        SelectProbe(e.target);
        CheckFinishTrial(DynamicsContainer);
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
        id.dob = formobj.elements['dob'].value;
        id.code = sha256(id.fname + " " + id.mname + " " + id.lname);
        id.date = time.toDateString();

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
        console.log('prep-start');
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
        document.getElementById('title').innerHTML = '';
        document.dispatchEvent(eventcontrollerinitiateevent);
    },
    onEventControllerInitiation: function(e) {
        /**
         * Prep ECL
         * >>EventController initiate by copy values from option section (Not implemented)
         * >>Generate Update function
         * >>Generate sumSensitiveContents
         * >>Ready
         **/
        DynamicsContainer.EventController.switchingFunc = switchingFuncGenerator(DynamicsContainer.EventController.testmode);
        DynamicsContainer.sumSensitiveContent = new DynamicsContainer.sumSensitiveContent(
            DynamicsContainer.identifiers.code,
            DynamicsContainer.identifiers.fname,
            DynamicsContainer.identifiers.mname,
            DynamicsContainer.identifiers.lname,
            new Date().toDateString()
        )
        document.dispatchEvent(teststartevent);
    },
    onTestStart: function(e) {
        //Log starting time
        let tnow = new Date().toISOString();
        DynamicsContainer.Timer.timeteststart = tnow;
        DynamicsContainer.identifiers.timestart = tnow;
        document.dispatchEvent(trialstartevent);
    },
    onTrialStart: function(e) {
        //Initialization
        var timer = DynamicsContainer.Timer;
        var ecl = DynamicsContainer.EventController;
        if (promptupdate.stag == true) {
            DynamicsContainer.currTrialData.answersequence = [];
        } else {
            DynamicsContainer.currTrialData = DynamicsContainer.currentTrialData(ecl.seqlength, ecl.span);
        }
        resetTrialTimer(DynamicsContainer);
        changeBackground(DynamicsContainer.currTrialData.span);

        timer.timetrialstart = new Date().toISOString();
        sequenceFlash(DynamicsContainer.currTrialData.sequence, DynamicsContainer.currTrialData.span, ecl.probetimeout, ecl.ISI, ecl.ISImode, log = true, toplay = true);
    },

    onTrialFinish: function(e) {
        var useTrial = DynamicsContainer.currTrialData;
        var timer = DynamicsContainer.Timer;
        var ecl = DynamicsContainer.EventController;
        var container = DynamicsContainer.testContainer;
        timer.timetrialfinish = new Date().toISOString();
        setPlayMode('off');
        //Push data to testContainer 
        container.trialData.push(DynamicsContainer.trialData(ecl.currTrial, useTrial.seqlength, useTrial.span, useTrial.sequence, useTrial.answersequence, timer.timetrialanswer, timer.timetrialstart, timer.timetrialfinish, timer.timeprobestart, timer.timeprobeend));
        container.corrects.push(MiscOperationFunction.compareSeq(useTrial.answersequence, MiscOperationFunction.revSeq(useTrial.sequence, useTrial.span)));
        container.spans.push(useTrial.span);
        //Calculate updateparameter (If testend signal trigger testend)
        promptupdate = ecl.switchingFunc(DynamicsContainer);
        dynamicUpdate(promptupdate);
        document.dispatchEvent(nextrialevent);
    },
    toPlay: (e) => {
        setPlayMode('on');
    },

    onTestFinish: function(e) {
        DynamicsContainer.Timer.timetestfinish = new Date().toISOString();
        setPlayMode('off');
        document.getElementById("testCanvas").setAttribute("hidden", true);
        document.dispatchEvent(databaseevent);
    },

    onDBevent: function(e) {
        var id = DynamicsContainer.identifiers;
        var testcontainer = DynamicsContainer.testContainer;
        var ecl = DynamicsContainer.EventController;
        var timer = DynamicsContainer.Timer;
        var sumData = DynamicsContainer.sumTestData(id.code, id, testcontainer.trialData, ecl.testmode, ecl.ISImode, ecl.ISI, ecl.probetimeout, ecl.maxtrial, ecl.initialseqlength, timer.timeteststart, timestamp_testfinish)
        console.log(sumData);
        var jsondat = JSON.stringify(sumData);

    }
}

function resetTrialTimer(DynamicsContainer) {
    var timer = DynamicsContainer.Timer;
    timer.timetrialstart = null;
    timer.timeprobestart = [];
    timer.timeprobeend = [];
    timer.timetrialanswer = [];
    timer.timetrialfinish = null;
}

function SelectProbe(object) {
    let _name = object.getAttribute("id");
    //do upon being selected
    let _num = parseInt(_name[_name.length - 1]);
    DynamicsContainer.currTrialData.answersequence.push(_num); //push only probe number to answer collection
    DynamicsContainer.Timer.timetrialanswer.push(new Date().toISOString());
    console.log(DynamicsContainer.currTrialData);
    console.log(_num);
    console.log([DynamicsContainer.currTrialData.answersequence, DynamicsContainer.currTrialData.sequence])
        //do after selected
}

function FlashProbe(object, span = "forward", timeout = defaultTimeout, log = false) {
    var probeRef = object;
    switch (span) {
        case 'forward':
            old_class = 'Probe';
            break;
        case 'backward':
            old_class = 'Probe';
            break;
    }
    switch (span) {
        case "forward":
            probeRef.setAttribute("class", "Probe-flashing-forward")
            break;
        case "backward":
            probeRef.setAttribute("class", "Probe-flashing-backward")
            break;
    }
    if (log) {
        DynamicsContainer.Timer.timeprobestart.push(new Date().toISOString());
    }
    setTimeout(function() {
        probeRef.setAttribute("class", old_class);
        DynamicsContainer.Timer.timeprobeend.push(new Date().toISOString());
    }, timeout)
}

function sequenceFlash(seq, span = "forward", timeout = defaultTimeout, ISI = defaultISI, seqmode = 'const-interval', log = false, toplay = false) {
    switch (seqmode) {
        case "const-interval":
            var waittime = ISI - timeout;
            for (var i = 0; i < seq.length; i++) {
                let _element = document.getElementById("Probe" + seq[i]);
                setTimeout(() => {
                    FlashProbe(_element, span, timeout, log);
                }, (i * ISI) + waittime);
                if ((i == (seq.length - 1)) && toplay) {
                    setTimeout(() => { document.dispatchEvent(sequenceflashfinish) }, (i * ISI) + waittime);
                }
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


function CheckFinishTrial(dynamicscontainer) {
    if (dynamicscontainer.currTrialData.seqlength == dynamicscontainer.currTrialData.answersequence.length) {
        document.dispatchEvent(trialfinevent);
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
                if (seq1[i] != seq2[i]) { truthValue = false }
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
            var res = Array.from(seq)
            if (rev == 'forward') {
                return res;
            } else if (rev == 'backward') {
                return res.reverse();
            } else {
                throw "EvalError";
            }
        },
        sleep: function(milliseconds) {
            const date = Date.now();
            let currentDate = null;
            do {
                currentDate = Date.now();
            } while (currentDate - date < milliseconds);
        }
    }
    //#endregion


//#region DB

function postTestData(testdata) {
    async function postData(testdata) {
        // Default options are marked with *
        var formobj = document.getElementById('preparation-form');
        var sendBody = {
            firstname: formobj.elements['fname'].value,
            middlename: formobj.elements['mname'].value,
            lastname: formobj.elements['lname'].value,
            dob: formobj.elements['dob'].value,
            education: formobj.elements['education'].value,
            testdata: testdata,
            code: sha256(this.firstname + "CCCN" + this.lastname)
        };

        const response = await fetch(url = "http://127.0.0.1:8000/spatialspan/", {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(sendBody) // body data type must match "Content-Type" header
                //body: sendBody
        });

        return response; // parses JSON response into native JavaScript objects
    }

    postData(testdata)
        .then(data => {
            console.log(data); // JSON data parsed by `data.json()` call
        });

}
//#endregion

//#region sequential program
main();
//#endregion