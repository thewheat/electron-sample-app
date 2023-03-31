const saveBtn = document.querySelector("#save")
const saveAndCloseBtn = document.querySelector("#saveAndClose")
const closeBtn = document.querySelector("#cancel")

const shortcutToggleText = document.querySelector("#shortcut-toggle")
const shortcutToggleSetBtn = document.querySelector("#shortcut-toggle-set");
const shortcutToggleCancelBtn = document.querySelector("#shortcut-toggle-cancel");
let listenForShortcut = '';


function getSavedSettings(){
    return window.settings.get();
}

function getNewSettings(){
    let settings = getSavedSettings();
    document.querySelectorAll(".saveable").forEach(setting => {
        if(!setting.id) return;

        if(setting.getAttribute("type") == "checkbox") {
            settings[setting.id] = setting.checked;
        }
        else {
            settings[setting.id] = setting.value;
        }         
    })

    return settings;
}

function saveSettingsToDatabase(settings){
    window.settings.setAndRefreshShortcuts(JSON.stringify(settings));
}

function populateCurrentSettings(){
    const settings = getSavedSettings();
    console.log(JSON.stringify(settings));
    Object.keys(settings).forEach(key => {
        try
        {
            const el = document.querySelector("#" + key);
            if(el.getAttribute("type") == "checkbox") {
                el.checked = settings[key];
            }
            else {
                el.value = settings[key];
            }
        }
        catch(err){
            console.error(`Cannot populate setting: ${key}`)
        }
    })
}

function buildShortcutString(keyEvent){
    let parts = [];
    
    // https://www.electronjs.org/docs/api/accelerator
    if(keyEvent.metaKey) parts.push("Meta");
    if(keyEvent.altKey) parts.push("Alt");
    if(keyEvent.ctrlKey) parts.push("Ctrl");
    if(keyEvent.shiftKey) parts.push("Shift");

    if(["Space", "Tab"].indexOf(keyEvent.code) != -1) {
        parts.push(keyEvent.code);
    }
    else {
        parts.push(String.fromCharCode(keyEvent.keyCode));
    }
    
    return parts.join("+");
}


function enableShortcutListening(){
    listenForShortcut = 'shortcut-toggle';
    shortcutToggleCancelBtn.removeAttribute("disabled");
}

function disableShortcutListening(){
    listenForShortcut = '';
    shortcutToggleCancelBtn.setAttribute("disabled", "disabled");
}

function initEventHandlers(){
    saveBtn.addEventListener('click', () => {
        saveSettings();
    });
    saveAndCloseBtn.addEventListener('click', () => {
        saveSettings();
        closeSettings();
    });
    closeBtn.addEventListener('click', () => {
        closeSettings();
    });

    document.querySelector("BODY").addEventListener('keydown', function(e){
        if(!listenForShortcut)  {
            onGlobalKeydown(e);
            return;
        }
        if(["Meta", "Shift", "Control", "Alt"].includes(e.key)) return;

        shortcutToggleText.value = buildShortcutString(e);
        disableShortcutListening();
    });

    shortcutToggleSetBtn.addEventListener('click', () => {
        enableShortcutListening();
    });

    shortcutToggleCancelBtn.addEventListener('click', () => {
        disableShortcutListening();
    });
}

function closeSettings(){
    window.settings.close();    
}

function saveSettings(){
    listenForShortcut = '';
    shortcutToggleCancelBtn.setAttribute("disabled", "disabled");

    let settings = getNewSettings();
    saveSettingsToDatabase(settings);
}

function init(){
    populateCurrentSettings();
    initEventHandlers();
}

function onGlobalKeydown(e){
    if(e.key == "Escape") {
        window.settings.close();
    }
};

init();