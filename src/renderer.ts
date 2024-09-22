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
import Showdown from 'showdown';

let fileIsSaved: boolean = true;

interface ApiInterface {
    toggleDevTools: CallableFunction;
    saveFile: CallableFunction;
    loadFile: CallableFunction;
    previewMarkdown: CallableFunction;
};

const api = (): ApiInterface => {
    return (((window as unknown) as any).nswApi) as ApiInterface;
};

const markTextChanged = (changed: boolean): void => {
    fileIsSaved = !changed;
    document.getElementById('save-file').innerText = fileIsSaved ? '[Save | F5]' : '[Save*  | F5]';
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

    console.log("event = ", event);

    if (event.keyCode === 9) {
        insertToText(element, '    ');
        event.preventDefault();
    }
    else if (event.key === 'F10') {
        const timestamp = new Date();
        insertToText(element, timestamp.toLocaleString());
        event.preventDefault();
    }
    else if ((event.key === 'F5') || ((event.ctrlKey || event.metaKey) && event.key === 's')) {
        onSaveFile(false)();
    }

    updateCounters();
    markTextChanged(true);
}

const onNewFile = (): void => {
    setText('');
    updateCounters();
    focusOnEditor();
    markTextChanged(false);
}

const onSaveFile = (saveAs: boolean) => {
    return (): void => {
        api().saveFile(getText(), saveAs);
        markTextChanged(false);
    };
};

const onLoadFile = async () => {
    const text: string = await api().loadFile();
    if (text === undefined) {
        return;
    }

    setText(text);
    updateCounters();
    focusOnEditor();
}

const convertToHtml = (markdown: string): string => {
    return (new Showdown.Converter()).makeHtml(markdown);
};

let isMarkdownPreview: boolean = false;

const toggleMarkdown = (): void => {
    isMarkdownPreview = !isMarkdownPreview;
    if (isMarkdownPreview) {
        document.getElementById('preview-markdown').innerText = '[Source | F9]';
        document.getElementById('editor').style.display = 'none';
        document.getElementById('markdown-preview').innerHTML = convertToHtml(getText());
        document.getElementById('markdown-preview').style.display = 'block';
    }
    else {
        document.getElementById('preview-markdown').innerText = '[Preview | F9]';
        document.getElementById('editor').style.display = 'block';
        document.getElementById('markdown-preview').style.display = 'none';
        focusOnEditor();
    }
}

const toggleMarkdownHotKey = (event: any): void => {
    if (event.key == 'F1') {
        onNewFile();
        event.preventDefault();
    }
    else if (event.key == 'F7') {
        onLoadFile();
        event.preventDefault();
    }
    else if (event.key == 'F9') {
        toggleMarkdown();
        event.preventDefault();
    }
    else if (event.key === 'F12') {
        api().toggleDevTools();
        event.preventDefault();
    }
};

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

    document.getElementById('preview-markdown').addEventListener('click', toggleMarkdown);
    document.addEventListener('keydown', toggleMarkdownHotKey);
}

main();