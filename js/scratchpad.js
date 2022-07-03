const handleMessage = (msg) => {
  if (msg.msg === "toggle-ui") {
    toggleUI();
  }

  if (msg.msg === "update-pad-data") {
    loadPadData();
  }

  if (msg.msg === "update-theme") {
    setTheme(msg.theme);
  }
};

const toggleUI = async () => {
  const mainContainer = document.querySelector("#main-container");
  const status = mainContainer.style.display;

  if (status === "block") {
    hideUI();
  } else {
    mainContainer.style.display = "block";
    loadPadData();
    setCursorEnd();
    const theme = await browser.storage.sync.get("theme");
    setTheme(theme.theme);
  }
};

const createPad = () => {
  fetch(browser.runtime.getURL("/public/scratchpad.html"))
    .then((r) => r.text())
    .then(async (html) => {
      const iconUrls = [
        "/lib/font-awesome/bold.svg",
        "/lib/font-awesome/italic.svg",
        "/lib/font-awesome/underline.svg",
        "/lib/font-awesome/list-ul.svg",
        "/lib/font-awesome/list-ol.svg",
        "/lib/font-awesome/align-left.svg",
        "/lib/font-awesome/align-center.svg",
        "/lib/font-awesome/align-right.svg",
        "/lib/font-awesome/align-justify.svg",
        "/lib/font-awesome/delete-left.svg",
        "/lib/font-awesome/floppy-disk.svg",
      ];

      const mainContainer = document.createElement("div");
      mainContainer.setAttribute("id", "main-container");
      mainContainer.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      const shadow = mainContainer.attachShadow({ mode: "open" });

      //create html from string and append to shadow DOM
      const temp = document.createElement("template");
      html = html.trim();
      temp.innerHTML = html;
      shadow.appendChild(temp.content.firstChild);

      const padStyles = document.createElement("link");
      padStyles.setAttribute("rel", "stylesheet");
      padStyles.setAttribute("href", browser.runtime.getURL("/css/pad.css"));
      shadow.appendChild(padStyles);

      const iconElements = shadow.querySelectorAll(".icon");

      for (let i = 0; i < iconElements.length; i++) {
        iconElements[i].setAttribute(
          "src",
          browser.runtime.getURL(iconUrls[i])
        );
      }

      document.body.appendChild(mainContainer);

      const theme = await browser.storage.sync.get("theme");

      setTheme(theme.theme);
      loadPadData();
      addHandlers();
    });
};

const loadPadData = async () => {
  const pad = document
    .querySelector("#main-container")
    .shadowRoot.querySelector("#pad");

  const storedData = await browser.storage.sync.get("data");
  if (storedData.data === undefined) {
    pad.innerHTML = "";
  } else {
    pad.innerHTML = storedData.data;
  }
};

const savePad = async () => {
  const pad = document
    .querySelector("#main-container")
    .shadowRoot.querySelector("#pad");
  await browser.storage.sync.set({ data: pad.innerHTML });
  transmitMessage({ msg: "update-all-tabs" });
};

const clearPad = () => {
  const pad = document
    .querySelector("#main-container")
    .shadowRoot.querySelector("#pad");
  pad.innerHTML = "";
};

const addHandlers = () => {
  const mainContainer = document.querySelector("#main-container");
  const saveButton = mainContainer.shadowRoot.querySelector("#save");
  const clearButton = mainContainer.shadowRoot.querySelector("#clear");
  const themeDropdown = mainContainer.shadowRoot.querySelector("#theme-select");

  saveButton.addEventListener("click", savePad);
  clearButton.addEventListener("click", clearPad);
  themeDropdown.addEventListener("change", saveTheme);
  document.addEventListener("click", hideUI);
  window.addEventListener("keydown", onTab);
};

const saveTheme = async () => {
  const themeDropdown = document
    .querySelector("#main-container")
    .shadowRoot.querySelector("#theme-select");
  await browser.storage.sync.set({ theme: themeDropdown.value });
  transmitMessage({ msg: "update-theme", theme: themeDropdown.value });
};

const setTheme = (newTheme) => {
  const mainContainer = document.querySelector("#main-container");
  const themeDropdown = mainContainer.shadowRoot.querySelector("#theme-select");
  const scratchpad = mainContainer.shadowRoot.querySelector("#scratchpad");
  const toolbar = mainContainer.shadowRoot.querySelector("#toolbar");
  const pad = mainContainer.shadowRoot.querySelector("#pad");
  const icons = mainContainer.shadowRoot.querySelectorAll(".icon");

  switch (newTheme) {
    case "dark":
      scratchpad.style.backgroundColor = "rgb(44, 44, 44)";
      scratchpad.style.backdropFilter = "none";
      toolbar.style.backgroundColor = "rgb(44, 44, 44)";
      toolbar.style.backdropFilter = "none";
      pad.style.backgroundColor = "#121212";
      pad.style.backdropFilter = "none";
      pad.style.color = "#fff";
      themeDropdown.selectedIndex = 0;

      icons.forEach((icon) => {
        icon.style.filter = "invert(1)";
      });
      setCursorEnd();
      break;
    case "light":
      scratchpad.style.backgroundColor = "#fff";
      scratchpad.style.backdropFilter = "none";
      toolbar.style.backgroundColor = "#fff";
      toolbar.style.backdropFilter = "none";
      pad.style.backgroundColor = "#fff";
      pad.style.backdropFilter = "none";
      pad.style.color = "#000";
      themeDropdown.selectedIndex = 1;

      icons.forEach((icon) => {
        icon.style.filter = "none";
      });
      setCursorEnd();
      break;
    case "blue":
      scratchpad.style.backgroundColor = "#232F3E";
      scratchpad.style.backdropFilter = "none";
      toolbar.style.backgroundColor = "#232F3E";
      toolbar.style.backdropFilter = "none";
      pad.style.backgroundColor = "#262E39";
      pad.style.backdropFilter = "none";
      pad.style.color = "#fff";
      pad.caretColor = "#fff";
      themeDropdown.selectedIndex = 2;

      icons.forEach((icon) => {
        icon.style.filter = "invert(1)";
      });
      setCursorEnd();
      break;
    case "glass-light":
      scratchpad.style.background = "rgba(255, 255, 255, 0.1)";
      scratchpad.style.backdropFilter = "blur(7px)";
      scratchpad.style.border = "1px solid rgba(255, 255, 255, 0.3)";
      toolbar.style.background = "rgba(255, 255, 255, 0.1)";
      pad.style.background = "rgba(255, 255, 255, 0.1)";
      pad.style.color = "#1b1b1b";
      themeDropdown.selectedIndex = 3;

      icons.forEach((icon) => {
        icon.style.filter = "none";
      });
      setCursorEnd();
      break;
    case "glass-dark":
      scratchpad.style.background = "rgba(0, 0, 0, 0.2)";
      scratchpad.style.backdropFilter = "blur(7px)";
      scratchpad.style.border = "1px solid rgba(255, 255, 255, 0.3)";
      toolbar.style.background = "rgba(0, 0, 0, 0.2)";
      pad.style.background = "rgba(0, 0, 0, 0.2)";
      pad.style.color = "#fff";
      themeDropdown.selectedIndex = 4;

      icons.forEach((icon) => {
        icon.style.filter = "invert(1)";
      });
      setCursorEnd();
      break;
    default:
      scratchpad.style.backgroundColor = "rgb(44, 44, 44)";
      scratchpad.style.backdropFilter = "none";
      toolbar.style.backgroundColor = "rgb(44, 44, 44)";
      toolbar.style.backdropFilter = "none";
      pad.style.backgroundColor = "#121212";
      pad.style.backdropFilter = "none";
      pad.style.color = "#fff";
      themeDropdown.selectedIndex = 4;

      icons.forEach((icon) => {
        icon.style.filter = "invert(1)";
      });
      setCursorEnd();
      break;
  }
};

const onTab = (e) => {
  const mainContainer = document.querySelector("#main-container");
  if (e.keyCode === 9) {
    if (mainContainer.style.display === "block") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&#09;");
      setCursorEnd();
    }
  }
};

const hideUI = () => {
  const pad = document.querySelector("#main-container");
  pad.style.display = "none";

  savePad();
};

const transmitMessage = (msg) => {
  browser.runtime.sendMessage(msg);
};

const setCursorEnd = () => {
  const pad = document
    .querySelector("#main-container")
    .shadowRoot.querySelector("#pad");

  pad.focus();
  document.execCommand("selectAll", false, null);
  document.getSelection().collapseToEnd();
  pad.blur();
  pad.focus();
};

browser.runtime.onMessage.addListener(handleMessage);
createPad();
