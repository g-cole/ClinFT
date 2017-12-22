//Garrett Cole
//University of Utah BMI term project

//User agent match for IE formatting
var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);

//add reverse() function to strings for RegEx negative look-behind simulation
String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}

//Initialize some global variables
var global_dx = [];
var stterm_green = {}, stterm_blue = {}, stterm_red = {};
var re, re2, re3, terminology;
var openTimeStamp = Date.now();

//Javascript doesn't support RegEx negative look-behinds, which could be used to detect negation terms before a word. However it
//does support negative look-aheads, so if we reverse the search string and regular expression, we can simulate negative look-behinds.
function loadTerminology(t) {
    //Originally the terminologies were hard-coded here. This function converts the JSON object back to the JS dicts.
    //"loadTerminology()" is called from the HTML template with FLASK/Jinja passing in the JSON object.
    for(i=0;i<t[0]["green"].length;i++) {
        stterm_green[t[0]["green"][i]["literal"]] = [t[0]["green"][i]["display"],
                                                t[0]["green"][i]["ICD10"],
                                                t[0]["green"][i]["SNOMED"]];
    }
    re = new RegExp((")"+Object.keys(stterm_green).join("|")+"(").reverse()+"(?! evah ton seod| on| ton)","ig");
    for(i=0;i<t[1]["blue"].length;i++) {
        stterm_blue[t[1]["blue"][i]["literal"]] = [t[1]["blue"][i]["display"],
                                                t[1]["blue"][i]["ICD10"],
                                                t[1]["blue"][i]["SNOMED"]];
    }
    re2 = new RegExp((")"+Object.keys(stterm_blue).join("|")+"(").reverse()+"(?! evah ton seod| on| ton)","ig");
    for(i=0;i<t[2]["red"].length;i++) {
        stterm_red[t[2]["red"][i]["literal"]] = [t[2]["red"][i]["display"],
                                                t[2]["red"][i]["ICD10"],
                                                t[2]["red"][i]["SNOMED"]];
    }
    re3 = new RegExp((")"+Object.keys(stterm_red).join("|")+"(").reverse()+"(?! evah ton seod| on| ton)","ig");
}

//get list of all clinFT textareas on the page and add event listeners to them
var clinFTList = document.getElementsByClassName('clinFT_textarea');
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
        //replace reversed found term into reversed highlight class
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

    //add the FHIR-returned condition list to the JS global_dx array
    var temp_global_dx = eval(document.getElementById('dxcode').innerHTML)
    for (var i = 0; i < temp_global_dx.length; i++){
        applyCode(temp_global_dx[i][0], temp_global_dx[i][1])
    }
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
            tar.dispatchEvent(new Event('mousemove')); //Update this for IE compatibility (IE doesn't like "new Event" inline)
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
        tooltip.innerHTML += '<button class="btn" onClick="applyCode(' + stterm_green[theTextL][2] + ',\''+ stterm_green[theTextL][0] +'\')">Apply codes</button>';
    }
    else if (theTextL in stterm_blue) {
        tooltip.innerHTML = 'Discovered concept "' + stterm_blue[theTextL][0] + '"<br>SNOMED: ' + stterm_blue[theTextL][2] + '<br>ICD10: ' + stterm_blue[theTextL][1];
        tooltip.innerHTML += '<button class="btn" onClick="applyCode(' + stterm_blue[theTextL][2] + ',\''+ stterm_blue[theTextL][0] +'\')">Apply codes</button>';
    }
    else {
        tooltip.innerHTML = 'Discovered concept "' + stterm_red[theTextL][0] + '"<br>SNOMED: ' + stterm_red[theTextL][2] + '<br>ICD10: ' + stterm_red[theTextL][1];
        tooltip.innerHTML += '<button class="btn" onClick="applyCode(' + stterm_red[theTextL][2] + ',\''+ stterm_red[theTextL][0] +'\')">Apply codes</button>';
    }
    
    hpos = highlight.getBoundingClientRect();
    tooltip.style.left = hpos.left-125+(hpos.width/2)+'px'; //125 = half tooltip width
    tooltip.style.top = hpos.top-90+window.scrollY+'px'; //90 = tooltip height
    tooltip.style.visibility = 'visible';
}

function applyCode(code, desc) {
    var flag = true;
    for (i=0;i<global_dx.length;i++) {
        if (global_dx[i][0] == code) {
            flag = false;
        }
    }
    if (flag == true){
        document.getElementById('dxcode').innerHTML = "";
        global_dx.push([code, desc]);
        temp_dx_text = "";
        for (var i=0;i<global_dx.length;i++) {
            temp_dx_text += global_dx[i][0] + ' : ' + global_dx[i][1] + ' <a style="color: #0000EE; cursor: pointer;" onClick="remove_dx(' + global_dx[i][0] + ')">x</a><br>';
        }
        document.getElementById('dxcode').innerHTML = temp_dx_text;
    } 
}

function remove_dx(dx) {
    for (var i=0;i<global_dx.length;i++) {
        if (global_dx[i][0] == dx){
            global_dx.splice(i,1);
        }
    }
    document.getElementById('dxcode').innerHTML = "";
    temp_dx_text = "";
        for (var i=0;i<global_dx.length;i++) {
            temp_dx_text += global_dx[i][0] + ' : ' + global_dx[i][1] + ' <a style="color: #0000EE; cursor: pointer;" onClick="remove_dx(' + global_dx[i][0] + ')">x</a><br>';

        }
        document.getElementById('dxcode').innerHTML = temp_dx_text;
}

//send final dx list for processing by fhir_tools
function updateFhir(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/update-fhir");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            alert("Diagnosis code(s) sent successfully.\nServer responded: "+xmlhttp.responseText)        
        }
        else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
            alert("Error sending diagnosis code(s).");
        }
    };
    xmlhttp.send(JSON.stringify(global_dx.concat(document.getElementById('patientId').value,proc_id,openTimeStamp,Date.now())));
}
