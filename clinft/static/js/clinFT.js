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
    indexMarks();
}

function handleScroll() {
    var scrollTop = this.scrollTop;
    this.parentNode.getElementsByClassName('clinFT_backdrop')[0].scrollTop = scrollTop;
}

function applyHighlights(text) {
    text = text
        .replace(/\n$/g, '\n\n')
        .replace(/[A-F].*?\b/g, '<mark class="greenmark">$&</mark>')
        .replace(/[G-P].*?\b/g, '<mark class="bluemark">$&</mark>')
        .replace(/[Q-Z].*?\b/g, '<mark class="redmark">$&</mark>');
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
});

function indexMarks(){
    var greenMarkList = document.getElementsByClassName('greenmark');
    for (var i = 0; i < greenMarkList.length; i++) {
        greenMarkList[i].addEventListener('mouseover', handleHover, false);
    }
}

function handleHover() {
    alert(this.innerHTML);
}