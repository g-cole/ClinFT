//Garrett Cole
//University of Utah - BMI 6300 final project

var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);

var clinFTList = document.getElementsByClassName('clinFT_textarea');

//add reverse() function to strings for RegEx negative look-behind simulation
String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}

for (var i = 0; i < clinFTList.length; i++) {
    clinFTList[i].addEventListener('input', handleInput, false);
    clinFTList[i].addEventListener('scroll', handleScroll, false);
}

function handleInput() {
    var text = this.value;
    var highlightedText = applyHighlights(text);
    this.parentNode.getElementsByClassName('clinFT_highlights')[0].innerHTML = highlightedText;
    processMarks();
}

function handleScroll() {
    var scrollTop = this.scrollTop;
    this.parentNode.getElementsByClassName('clinFT_backdrop')[0].scrollTop = scrollTop;
}

function applyHighlights(text) {
    text = text
        .replace(/\n$/g, '\n\n') //necessary for highlight/textarea alignment
        // replace reversed found term into reversed highlight class
        .reverse().replace(re, '>kram/<$&>"pitloot kram neerg"=ssalc kram<').reverse()
        .reverse().replace(re2, '>kram/<$&>"pitloot kram eulb"=ssalc kram<').reverse()
        .reverse().replace(re3, '>kram/<$&>"pitloot kram der"=ssalc kram<').reverse();
    return text;
}

document.addEventListener('DOMContentLoaded', function(event) {
    var event = document.createEvent("Event");
    event.initEvent('input', false, true);
    for (var i = 0; i < clinFTList.length; i++) {
        if (isIE){
            clinFTList[i].parentNode.getElementsByClassName('clinFT_highlights')[0].style.paddingRight = '2px';
        }
        clinFTList[i].dispatchEvent(event); //apply highlights to each clinFT instance when page loads
    }

    //Create the tooltip element
    var tt = document.createElement('div');
    tt.id = 'tooltip';
    document.body.appendChild(tt);
    //mouseout tooltip
    tt.addEventListener("mouseout", function(event){
        var e = event.toElement || event.relatedTarget;
        if (e.parentNode == this || e == this) {
            return;
        }
    this.style.visibility = "hidden";
    });
});

//The highlights are behind the textarea, so chain the hover events
function processMarks(){
    var markList = document.getElementsByClassName('mark');
    for (var i = 0; i < markList.length; i++) {
        markList[i].addEventListener('mousemove', function(e){
            handleHover(this);
        }, false);
        markList[i].parentNode.parentNode.parentNode.getElementsByClassName('clinFT_textarea')[0].addEventListener('mousemove',function(ev){
            this.style.display = "none";
            var tar = document.elementFromPoint(ev.clientX, ev.clientY);
            this.style.display = "block";
            //mouseout highlight
            if (tar != this) {
                document.getElementById('tooltip').style.visibility = "hidden";
            }
            tar.dispatchEvent(new Event('mousemove'));//UPDATE THIS FOR IE COMPATIBILITY (IE doesn't like "new Event" inline)
        },false);
    }
}

document.addEventListener('click', function() {
    if (this != document.getElementById('tooltip')){
        document.getElementById('tooltip').style.visibility = "hidden";
    }
});

function handleHover(highlight) {
    var theText = highlight.innerHTML;
    var theTextL = theText.toLowerCase();
    var tooltip = document.getElementById('tooltip');
    if (theTextL in stterm_green) {
        tooltip.innerHTML = 'Discovered concept "' + stterm_green[theTextL][0] + '"<br>SNOMED: ' + stterm_green[theTextL][2] + '<br>ICD10: ' + stterm_green[theTextL][1];
    }
    else if (theTextL in stterm_blue) {
        tooltip.innerHTML = 'Discovered concept "' + stterm_blue[theTextL][0] + '"<br>SNOMED: ' + stterm_blue[theTextL][2] + '<br>ICD10: ' + stterm_blue[theTextL][1];
    }
    else {
        tooltip.innerHTML = 'Discovered concept "' + stterm_red[theTextL][0] + '"<br>SNOMED: ' + stterm_red[theTextL][2] + '<br>ICD10: ' + stterm_red[theTextL][1];
    }
    tooltip.innerHTML += '<button class="btn">Apply codes</button>';
    hpos = highlight.getBoundingClientRect();
    tooltip.style.left = hpos.left-125+(hpos.width/2)+'px'; //150 = half tooltip width
    tooltip.style.top = hpos.top-90+window.scrollY+'px'; //90 = tooltip height
    tooltip.style.visibility = 'visible';
}

// term_literal : [standard_name, ICD10_code, SNOMED_code]
var stterm_green = {
    "esophageal varices" : ["Esophageal Varices", "I85.0", "28670008"],
    "esophageal varix" : ["Esophageal Varices", "I85.0", "28670008"]
};
var stterm_blue = {
    "dysphagia" : ["Dysphagia", "R13.1", "40739000"]
};
var stterm_red = {
    "heartburn" : ["Heartburn", "R12", "16331000"]
};

//Javascript doesn't support RegEx negative look-behinds, which could be used to detect negation terms before a word. However, it
//does support negative look-aheads, so if we reverse the search string and regular expression, we can simulate negative look-behinds.
//replaced:
//var re = new RegExp(Object.keys(stterm).join("|"), "ig");
var re = new RegExp((")"+Object.keys(stterm_green).join("|")+"(").reverse()+"(?! on| ton)","ig");
var re2 = new RegExp((")"+Object.keys(stterm_blue).join("|")+"(").reverse()+"(?! on| ton)","ig");
var re3 = new RegExp((")"+Object.keys(stterm_red).join("|")+"(").reverse()+"(?! on| ton)","ig");
