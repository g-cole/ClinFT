var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);

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
        .replace(/\n$/g, '\n\n')
        .replace(/[A-F].*?\b/g, '<mark class="green mark tooltip">$&</mark>')
        .replace(/[G-P].*?\b/g, '<mark class="blue mark tooltip">$&</mark>')
        .replace(/[Q-Z].*?\b/g, '<mark class="red mark tooltip">$&</mark>');
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

    var tt = document.createElement('div');
    tt.id = 'tooltip';
    document.body.appendChild(tt);
});

//The highlights are behind the textarea, so chain the hover events - UPDATE THIS FOR IE COMPATIBILITY (IE doesn't like "new Event" inline)!!!
function processMarks(){
    var markList = document.getElementsByClassName('mark');
    for (var i = 0; i < markList.length; i++) {
        markList[i].addEventListener('mousemove', function(e){
            handleHover(this);
        }, false);
        markList[i].parentNode.parentNode.parentNode.getElementsByClassName('clinFT_textarea')[0].addEventListener('mousemove',function(ev){
            this.style.display = "none"
            var tar = document.elementFromPoint(ev.clientX, ev.clientY);
            this.style.display = "block";
            tar.dispatchEvent(new Event('mousemove'));
        },false);
    }
}

function handleHover(highlight) {
    var theText = highlight.innerHTML;
    //document.getElementById('examType').value = theText;
    var tooltip = document.getElementById('tooltip')
    tooltip.innerHTML = theText;
    hpos = highlight.getBoundingClientRect();
    tooltip.style.left = hpos.left-70+'px';
    tooltip.style.top = hpos.top-100+window.scrollY+'px';
    tooltip.style.visibility = "visible";
}
