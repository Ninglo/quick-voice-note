import * as vscode from 'vscode';
import { getDailyNotePath } from './path';

export async function createDailyNote(context: vscode.ExtensionContext) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayUri = await getDailyNotePath(yesterday, context);
    const todayUri = await getDailyNotePath(today, context);

    try {
        const yesterdayContent = await vscode.workspace.fs.readFile(yesterdayUri).then(content => content, () => new Uint8Array(0));
        await vscode.workspace.fs.writeFile(todayUri, yesterdayContent);

        await vscode.workspace.openTextDocument(todayUri).then(vscode.window.showTextDocument);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        vscode.window.showErrorMessage(`Failed to create daily note: ${errorMsg}`);
    }
}