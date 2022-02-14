var DynamicsContainer = {
    currTrialData: {
        seqLength: null,
        sequences: [],
        answersequences: [],
        span: null,
        correct: [],
        reactiontimes: []
    },
    EventController: {
        seqLength: 3,
        timestart: 0,
        span: "",
        consecutivecorrect: 0,
        consecutiveSpancorrect: 0,
        maxTrial: 40,
        testmode: 'no-switch',
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
        created: []
    },
    trialData: function (seqlength = null,span = null,sequence = null,answersequence = null,reactiontimes = null) {
        let obj = {}
        obj.seqlength = seqlength;
        obj.span = span;
        obj.sequence = sequence;
        obj.answersequence = answersequence;
        if (sequence == null) {obj.correct = null} else{ obj.correct = MiscOperationFunction.compareSeq(sequence,answersequence) }
        obj.reactiontimes = reactiontimes
        return obj
    }
}

const rampThresholdConsCorrect = 2;

const defaultColorFlashDef = {
    bgcolor: "yellow",
    bdcolor: "white",
}

const defaultColorHoverDef = {
    bordercolor: "white",
}

const defaultTimeout = 250;


var EventFunctions = {
    forProbeFlash: function(e) {
        FlashProbe(e.target);
    },
    forProbeClick: function(e) {
        SelectProbe(e.target);
        if (CheckTrialFinish()) {
            setPlayMode("off");
        }
    }
}

function SelectProbe(object) {
    probeRef = object;
    _name = object.getAttribute("id");
    //do upon being selected
    DynamicsContainer.currTrialData.answersequences.push(_name[_name.length - 1]);
    console.log(DynamicsContainer.currTrialData);
    //do after selected
}

function CheckTrialFinish() {
    var tparams = DynamicsContainer.currTrialData;
    return tparams.answersequences.length == tparams.seqLength;
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

function sequenceFlash(seq, flashmode = "flashing-forward", timeout = defaultTimeout, ISI = 1000, seqmode = 'const-interval') {
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

function InitializeTestparams(firstname = null, middlename = null, lastname = null, code = null, startseqLength = 3, span = 'forward', maxTrial = 40, testmode = 'no-switch') {
    var idf = DynamicsContainer.identifiers;
    var ecl = DynamicsContainer.EventController;

    idf.fname = firstname || "ANON";
    idf.identifiers.mname = middlename || "ANON";
    idf.identifiers.lname = lastname || "ANON";

    let tempcode = code || "ANON";
    idf.identifiers.code = MiscOperationFunction.sha256(tempcode);
    idf.identifiers.date = (new Date()).toDateString();

    ecl.seqLength = startseqLength;
    ecl.span = span;
    ecl.timestart = (new Date()).toTimeString();
    ecl.maxTrial = maxTrial;
    ecl.testmode = testmode;
    ecl.consecutivecorrect = 0;
    ecl.consecutiveSpancorrect = 0;
}

function updateDynamicparams(DynamicsContainer) {
    currSeq = DynamicsContainer.currTrialData.sequences;
    ansSeq = DynamicsContainer.currTrialData.answersequences;
    correct = MiscOperationFunction.compareSeq(currSeq,ansSeq);
    poscsccorrect =  DynamicsContainer.EventController.consecutivecorrect >= 0;
    poscscspancorrect = ansSeq.EventController.consecutiveSpancorrect >= 0;
    switch (correct) {
        case true:
            if (poscsccorrect) {
                DynamicsContainer.EventController.consecutivecorrect += 1;
                DynamicsContainer.EventController.consecutiveSpancorrect +=1;
                // TO DO: if Span change reset to 0
            } else {
                DynamicsContainer.EventController.consecutivecorrect = 1;
                DynamicsContainer.EventController.consecutiveSpancorrect =1;
            }
            break;
        case false:
            if (poscsccorrect) {
                DynamicsContainer.EventController.consecutivecorrect = -1;
                DynamicsContainer.EventController.consecutiveSpancorrect = -1;
            } else {
                DynamicsContainer.EventController.consecutivecorrect += 1;
                DynamicsContainer.EventController.consecutiveSpancorrect +=1;
                // TO DO: if Span change reset to 0   
            }
            break;
    }
}

function InitiateTest(currentSeqLength, consecutivecorrect, consecutivespancorrect, testmode) {
    //To do
    switch (testmode) {
        case "no-switch":
            break;
        case "switch":
            //calculate switching logic
            break;
    }
}

function FinishTrial(numTrial, seqLength) {
    //remove all event listener on probe
    //wait fo next trial
    //Check if finish test
    //generate trialdata
}

function genSeq(seqLength, numOption = 6) {
    var seq = []
    for (var i = 0; i < seqLength; i++) {
        // randInt from 1 to 6 
        var num = Math.floor(Math.random() * numOption) + 1;
        seq[i] = num;
    };
    return seq;
}

function TrialCueData(numTrial, seqLength, seqSpan) {
    var TrialCueData = {
        numTrial: numTrial,
        seqLength: seqLength,
        Seq: genSeq(seqLength),
        seqSpan: seqSpan,
    };
    return TrialCueData;
}

function playData() {
    var playData = {
        clickData: null, //
        hoverData: null, //
    };
    return playData;
}

function TrialData(TrialCueData, playData) {
    var TrialData = {
        numTrial: TrialCueData.numTrial,
        seqLength: TrialCueData.seqLength,
        Seq: TrialCueData.Seq,
        seqSpan: TrialCueData.seqSpan
    };
    return TrialData
}

function ToDB() {

}

function FinishTest() {

}

function changeBackgroundColor() {

}

//#region MiscOperationFunction
MiscOperationFunction = {
    compareSeq : (seq1,seq2) => {
        console.assert (typeof(seq1) == "object")
        console.assert (seq1.length == seq2.length)
        var truthValue = true;
        for (let i=0; i < seq1.length; i++) {
            if (seq1 != seq2) { truthValue = false}
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