import * as vscode from 'vscode';

export function getConfigProperty(property: 'noteFolder', fallback: string): string;
export function getConfigProperty(property: 'dailyNoteDirPath', fallback: string): string;
export function getConfigProperty<T>(property: string, fallback: T): T {
    const config = vscode.workspace.getConfiguration('quick-voice-note');
    return config.get(property, fallback);
};
