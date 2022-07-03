const transmitMessage = (tabId, msg) => {
  browser.tabs.sendMessage(tabId, msg);
};

const handleCommand = async (msg) => {
  if (msg === "toggle-ui") {
    const tabs = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });
    transmitMessage(tabs[0].id, { msg: "toggle-ui" });
  }
};

const handleMessage = async (msg, sender, sendResponse) => {
  const tabs = await browser.tabs.query({});

  if (msg.msg === "update-all-tabs") {
    tabs.forEach((tab) => {
      transmitMessage(tab.id, { msg: "update-pad-data" });
    });
  }

  if (msg.msg === "update-theme") {
    tabs.forEach((tab) => {
      transmitMessage(tab.id, { msg: "update-theme", theme: msg.theme });
    });
  }
};

const initSetup = () => {
  browser.storage.sync.set({ theme: "dark" });
};

browser.commands.onCommand.addListener(handleCommand);
browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(initSetup);
