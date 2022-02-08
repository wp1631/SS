var params = {
    trialParam : {
        seqLength: 3,
        sequences: [],
        answersequences : [],
        span : "",
        correct : [],
    },
    trialController : {
        timestart : 0,
        playable : false,
        stagnation : false,
        consecutivecorrect : 0,
        maxTrial : 40,
        mode : 'no-switch',
    },
    identifiers : {
        fname : "",
        mname : "",
        lname : "",
        code : "",
        date : "",
        timestart : null,
    }
}

const defaultColorFlashDef = {
    bgcolor : "green",
    bdcolor: "pink",
}

function SelectProbe(object) {
    probeRef = object;
    setTimeout(function() { probeRef.setAttribute('class', 'Probe'); }, 300)
    //do after selected
}

function FlashProbe(object, colorflashdef=defaultColorFlashDef, timeout = 250) {
    var probeRef = object;

    probeRef.style.borderColor = colorflashdef.bdcolor;
    probeRef.style.backgroundColor = colorflashdef.bgcolor;
    setTimeout(function() { 
        probeRef.style.borderColor = null;
        probeRef.style.backgroundColor = null;
    }, timeout)
}

function prelude(){
    
}

function setInstruction() {

}

function setDemoMode() {

}

function setPlayMode() {
    document.getElementById("testCanvas").hidden = false;
    //Add evenet listener to all probe
} 

function InitiateTrial(numTrial, TrialCueData) {
    //Display all cue
    //wait
    //AddEventListener to all probe
    //Add interaction to probe
}

function allowDataCollection() {

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