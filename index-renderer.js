const body = document.querySelector("BODY");
const logEl = document.querySelector("#log");
const sendDataBtn = document.querySelector("#sendDataBtn");
const data = document.querySelector("#data");

function init(){
    body.onkeydown = onKeydown;
    sendDataBtn.onclick = function(){
        window.appWindow.sendData({data: data.value});
    }
}
init();

function formatMilliseconds(num){
    if(num < 10)
        return `00${num}`;
    else if (num < 100)
        return `0${num}`;
    return `${num}`;

}

function formatDate(date){
    return `${date.toLocaleString()}.${formatMilliseconds(date.getMilliseconds())}`;
}

function log(str, obj){
    const li = document.createElement("li");
    const pre = document.createElement("pre");
    pre.innerText = formatDate(new Date()).toLocaleString() + ": " + str;
    if(obj) pre.innerText += JSON.stringify(obj, null, 4);
    li.append(pre);
    logEl.prepend(li);
}

function hideWindow(){
    window.appWindow.hide();
}

function showSettings(){
    window.appWindow.showSettings();
}

function logIPCfunction(_, value){
    log(JSON.stringify(value));
}

window.appWindow.receiveData(logIPCfunction);
window.appWindow.receiveDataString(logIPCfunction);

function onKeydown(e){
    console.log(e);
    if(e.key == "Escape") {
        hideWindow();
    }
    else if(e.key == "," && e.metaKey) {
        showSettings();
    }
}