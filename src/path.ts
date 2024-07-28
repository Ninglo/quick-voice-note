import * as vscode from 'vscode';
import { getConfigProperty } from "./getConfigProperty";

// TODO: description at configuration
export function getNoteFolder(): string {
    const noteFolderConfig = getConfigProperty('noteFolder', '');

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    return noteFolderConfig
        .replace('${year}', year)
        .replace('${month}', month)
        .replace('${day}', day);
}

export async function getDailyNotePath(date: Date, context: vscode.ExtensionContext): Promise<vscode.Uri> {
    const dailyFolderConfig = getConfigProperty('createDailyNote', '');

    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const fileName = `${year}-${month}-${day}.md`;

    const dir = dailyFolderConfig ? vscode.Uri.file(dailyFolderConfig) : vscode.Uri.joinPath(context.globalStorageUri, 'daily');
    await vscode.workspace.fs.createDirectory(dir);

    return vscode.Uri.joinPath(dir, fileName);
}
