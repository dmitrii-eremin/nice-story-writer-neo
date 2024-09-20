/**
 * This file will automatically be loaded by webpack and run in the 'renderer' context.
 * To learn more about the differences between the 'main' and the 'renderer' context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './index.css';

let fileIsSaved: boolean = true;

interface ApiInterface {
    toggleDevTools: CallableFunction;
    saveFile: CallableFunction;
    loadFile: CallableFunction;
};

const api = (): ApiInterface => {
    return (((window as unknown) as any).nswApi) as ApiInterface;
};

const markTextChanged = (changed: boolean): void => {
    fileIsSaved = !changed;
    document.getElementById('save-file').innerText = fileIsSaved ? '[Save]' : '[Save*]';
}

const updateTime = (): void => {
    const el = document.getElementById('current-time');
    el.innerText = new Date().toLocaleTimeString();
}

const getText = (): string => {
    return (document.getElementById('editor') as HTMLInputElement).value;
}

const setText = (text: string): void => {
    (document.getElementById('editor') as HTMLInputElement).value = text;
}

const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(x => x.length > 0).length;
}

const updateCounters = (): void => {
    const text: string = getText();

    const characters = text.length;
    const lines = (text.match(/\n/g) || []).length;

    const pages = Math.ceil(lines / 24);
    const words = countWords(text);
    const paragraphs = text.split(/\n\n/).length;

    document.getElementById('number-of-paragraphs').innerText = paragraphs.toString();
    document.getElementById('number-of-words').innerText = words.toString();
    document.getElementById('number-of-pages').innerText = pages.toString();
    document.getElementById('number-of-lines').innerText = lines.toString();
    document.getElementById('number-of-characters').innerText = characters.toString();
}

const focusOnEditor = (): void => {
    document.getElementById('editor').focus();
}

const insertToText = (element: HTMLInputElement, text: string): void => {
    const v = element.value;
    const s = element.selectionStart;
    const e = element.selectionEnd;

    element.value = v.substring(0, s) + text  + v.substring(e);
    element.selectionStart = element.selectionEnd = s + text.length;
}

const onTextAreaKeyDown = (event: any): void => {
    const element: HTMLInputElement = document.getElementById('editor') as HTMLInputElement;

    if (event.keyCode === 9) {
        insertToText(element, '    ');
        event.preventDefault();
    }
    else if (event.keyCode === 120) {
        const timestamp = new Date();
        insertToText(element, timestamp.toLocaleString());
        event.preventDefault();
    }
    else if (event.keyCode === 123) {
        api().toggleDevTools();
    }

    updateCounters();
    markTextChanged(true);
}

const onNewFile = (): void => {
    setText('');
    updateCounters();
    focusOnEditor();
}

const onSaveFile = (saveAs: boolean) => {
    return (): void => {
        api().saveFile(getText(), saveAs);
        markTextChanged(false);
    };
};

const onLoadFile = async () => {
    setText(await api().loadFile());
    updateCounters();
    focusOnEditor();
}

const main = (): void => {
    updateTime();
    updateCounters();
    focusOnEditor();
    setInterval(updateTime, 1000);

    document.getElementById('editor').addEventListener('keydown', onTextAreaKeyDown);
    document.getElementById('new-file').addEventListener('click', onNewFile);
    document.getElementById('save-file').addEventListener('click', onSaveFile(false));
    document.getElementById('save-file-as').addEventListener('click', onSaveFile(true));
    document.getElementById('load-file').addEventListener('click', onLoadFile);
}

main();