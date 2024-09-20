// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { ipcRenderer } from 'electron';
const { contextBridge } = require('electron')

interface NswApi {
    toggleDevTools: CallableFunction;
    saveFile: CallableFunction;
    loadFile: CallableFunction;
};

const toggleDevTools = (): void => {
    ipcRenderer.send('toggle-dev-tools');
};

const saveFile = (text: string): void => {
    ipcRenderer.send('save-file', text);
};

const loadFile = async (): Promise<string> => {
    return ipcRenderer.invoke('load-file');
};

contextBridge.exposeInMainWorld('nswApi', {
    toggleDevTools,
    saveFile,
    loadFile
})