const openBtn = document.getElementById('openBtn');
const popupBox = document.getElementById('popupOverlay');
const iframe = document.getElementById('popupIframe');
const closeBtn = document.getElementById('closeBtn');

if (!openBtn || !popupBox || !iframe || !closeBtn) {
    console.error('One or more required element not found:',{openBtn, popupBox, iframe, closeBtn});
} else{

    openBtn.addEventListener('click', () => {
        iframe.src = '/window/indexadd.html';
        popupBox.style.display = 'flex';
        popupBox.setAttribute('aria-hidden','false');
    });
    
    closeBtn.addEventListener('click',closepopup);
    popupBox.addEventListener('click',(e) => {
        if(e.target === popupBox)
            closepopup();
    });

    document.addEventListener('keydown',(e) => {
        if (e.key === 'Escape' &&
            popupBox.style.display === 'flex')
            closepopup();
    });

    function closepopup() {
        popupBox.style.display = 'none';
        iframe.src = '';
        popupBox.setAttribute('aria-hidden','true');
    }
}

function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
}

const task = [
    { title: "Design logo", description: "finish branding logo for client"},
    { title: "Code login page", description: "Implement authentication UI"},
    { title: "Fix bugs", description: "Resolve sidebar animation issue"},
];

iframe.onload = () => {

    iframe.contentWindow.postMessage({ tasks }, "*");
};