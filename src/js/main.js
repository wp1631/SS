import sha256 from "./sha256 "

var DynamicsContainer = {
    trialParam: {
        seqLength: null,
        sequences: [],
        answersequences: [],
        span: "",
        correct: [],
    },
    EventController: {
        seqLength: 3,
        timestart: 0,
        span: "",
        stagnation: false,
        consecutivecorrect: 0,
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
    }
}

const rampThresholdCorrect = 2;

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
    forProbeHover: function(e) {

    }
}

function SelectProbe(object) {
    probeRef = object;
    //do upon being selected
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
        probeRef.setAttribute("class", old_class)
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

function setDemoMode() {
    document.getElementById("welcomeCanvas").hidden = true;
    document.getElementById("testCanvas").hidden = false;
}

function setPlayMode(mode = "on") {
    document.getElementById("welcomeCanvas").hidden = true;
    document.getElementById("testCanvas").hidden = false;
    switch (mode) {
        case "on":
            for (let i = 1; i < 7; i++) {
                var temp = document.getElementById("Probe" + i)
                temp.addEventListener("click", EventFunctions.forProbeFlash)
            }
            break;
        case "off":
            for (let i = 1; i < 7; i++) {
                var temp = document.getElementById("Probe" + i)
                temp.addEventListener("click", EventFunctions.forProbeFlash)
            }
            break;
    }
}

function TrialPrep() {

}

function InitializeTestparams(firstname = null, middlename = null, lastname = null, code = null, startseqLength = 3, span = 'forward', maxTrial = 40, testmode = 'no-switch') {
    var idf = DynamicsContainer.identifiers;
    var ecl = DynamicsContainer.EventController;

    idf.fname = firstname || "testfname";
    idf.identifiers.mname = middlename || "testmname";
    idf.identifiers.lname = lastname || "testlname";

    let tempcode = code || "test";
    idf.identifiers.code = sha256(tempcode);
    idf.identifiers.date = (new Date()).toDateString();

    ecl.seqLength = startseqLength;
    ecl.span = span;
    ecl.timestart = (new Date()).toTimeString();
    ecl.maxTrial = maxTrial;
    ecl.testmode = testmode;
    ecl.stagnation = false;
    ecl.consecutivecorrect = 0;
}

function InitiateTest(currentSeqLength, stagnation, consecutivecorrect, testmode) {
    switch (stagnation) {
        case true:
            //assign old sequence to variable seq
            //seq = genSeq(currentSeqLength);
            break;
        case false:
            if (consecutivecorrect == rampThresholdCorrect) {
                console.log("Hello");
            }
            break;
    }

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

function revSpan(seq, seqSpan) {
    if (seqSpan == 'forward') {
        return seq;
    } else if (seqSpan == 'backward') {
        return seq.reverse();
    } else {
        throw EvalError;
    }
}

function genSeq(seqLength) {
    var seq = []
    for (var i = 0; i < seqLength; i++) {
        // randInt from 1 to 6 
        var num = Math.floor(Math.random() * 6) + 1;
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