// main.ts
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var main_exports = {};
__export(main_exports, {
  default: () => CombinedPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  mySetting: "default",
  customRegex: "(\\d+\\s*)+$",
  savedRegexPatterns: [
    { name: "Digi-num", regex: "(\\d+-\\d+-\\d+)$", description: "Numbers and Hyphens - Matches multiple numbers separated by hyphens at the end of the line, useful for dates or version numbers." },
    { name: "Tag Tur Turkey", regex: "([a-zA-Z0-9]+)$", description: "Alphanumeric Sorting - Matches any alphanumeric string at the end of the line. Useful for general sorting of items ending in alphanumeric characters." }
  ]
};
var RegexOrderPlugin = class extends import_obsidian.Plugin {
  async onload() {
    console.log("Loading Regex Order Plugin");
    await this.loadSettings();
    this.addCommand({
      id: "order-list-by-regex",
      name: "Order List by Regex",
      editorCallback: (editor, view) => {
        console.log("Executing order-list-by-regex command");
        const selectedText = editor.getSelection();
        const content = selectedText || editor.getValue();
        console.log("Original Content:", content);
        const orderedContent = this.orderListByRegex(content);
        console.log("Ordered Content:", orderedContent);
        if (selectedText) {
          editor.replaceSelection(orderedContent);
        } else {
          editor.setValue(orderedContent);
        }
      }
    });
    this.addSettingTab(new RegexOrderSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  orderListByRegex(content) {
    console.log("Starting orderListByRegex with content:", content);
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    console.log("Filtered lines:", lines);
    const regex = new RegExp(this.settings.customRegex);
    console.log("Using regex:", regex);
    const orderedLines = lines.sort((a, b) => {
      const matchA = a.match(regex);
      const matchB = b.match(regex);
      console.log("MatchA:", matchA, "MatchB:", matchB);
      if (matchA && matchB) {
        const comparison = matchA[0].localeCompare(matchB[0], void 0, { numeric: true });
        console.log("Comparison result:", comparison);
        return comparison;
      } else if (matchA) {
        return -1;
      } else if (matchB) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });
    console.log("Ordered lines:", orderedLines);
    return orderedLines.join("\n");
  }
  onunload() {
    console.log("Unloading Regex Order Plugin");
  }
};
var RegexOrderSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Custom Regex").setDesc("Enter the custom regex pattern").addText((text) => text.setPlaceholder("Enter your regex pattern").setValue(this.plugin.settings.customRegex).onChange(async (value) => {
      this.plugin.settings.customRegex = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Save Custom Regex").setDesc("Save the custom regex pattern with a name and description").addButton((button) => button.setButtonText("Save").onClick(async () => {
      const name = await this.getUserInput("Enter the name for this regex pattern");
      const description = await this.getUserInput("Enter the description for this regex pattern");
      if (name && description) {
        const newPattern = {
          name,
          regex: this.plugin.settings.customRegex,
          description
        };
        this.plugin.settings.savedRegexPatterns.push(newPattern);
        await this.plugin.saveSettings();
        this.display();
      }
    }));
    new import_obsidian.Setting(containerEl).setName("Restore to Default Regex").setDesc("Restore the custom regex pattern to the default value").addButton((button) => button.setButtonText("Restore").onClick(async () => {
      this.plugin.settings.customRegex = DEFAULT_SETTINGS.customRegex;
      await this.plugin.saveSettings();
      this.display();
    }));
    containerEl.createEl("h3", { text: "Saved Regex Patterns" });
    this.plugin.settings.savedRegexPatterns.forEach((pattern, index) => {
      new import_obsidian.Setting(containerEl).setName(pattern.name).setDesc(pattern.description).addButton((button) => button.setButtonText("Use").onClick(async () => {
        this.plugin.settings.customRegex = pattern.regex;
        await this.plugin.saveSettings();
        this.display();
      })).addButton((button) => button.setButtonText("Delete").onClick(async () => {
        this.plugin.settings.savedRegexPatterns.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
      }));
    });
  }
  async getUserInput(promptText) {
    return new Promise((resolve) => {
      const promptModal = new PromptModal(this.app, promptText, resolve);
      promptModal.open();
    });
  }
};
var PromptModal = class extends import_obsidian.Modal {
  constructor(app, promptText, callback) {
    super(app);
    this.promptText = promptText;
    this.callback = callback;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: this.promptText });
    const inputEl = contentEl.createEl("input", { type: "text" });
    inputEl.focus();
    contentEl.createEl("button", { text: "Submit" }, (el) => {
      el.addEventListener("click", () => {
        this.callback(inputEl.value);
        this.close();
      });
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var CombinedPlugin = class extends import_obsidian.Plugin {
  async onload() {
    const regexOrderPlugin = new RegexOrderPlugin(this.app, this.manifest);
    await regexOrderPlugin.onload();
  }
  onunload() {
    console.log("Unloading Combined Plugin");
  }
};
