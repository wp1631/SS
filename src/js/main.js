import { sha256 } from "./sha256";

var params = {
    trialParam: {
        seqLength: 3,
        sequences: [],
        answersequences : [],
        span : "",
    },
    trialController: {
        timestart : 0,
        playable : false,
        stagnation : false,
        consecutivecorrect : 0,
    },
    identifiers = {
        fname : "",
        mname : "",
        lname : "",
        code : "",
    }
}

function SelectProbe(probeID) {
    probeRef = object;
    probeRef.setAttribute('class', 'Probe-selected');
}

function FlashProbe(object) {
    probeRef = object;
    probeRef.setAttribute('class', 'Probe-selected');
    setTimeout(function() { probeRef.setAttribute('class', 'Probe'); }, 300)
}

function ClickProbe(object) {

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