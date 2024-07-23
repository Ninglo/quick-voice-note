import * as vscode from 'vscode';

// TODO: description at configuration
function getNoteFolder(): string {
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

function getConfigProperty(property: 'noteFolder', fallback: string): string;
function getConfigProperty<T>(property: string, fallback: T): T {
	const config = vscode.workspace.getConfiguration('quick-voice-note');
	return config.get(property, fallback);
};

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('quick-voice-note.takeNote', async () => {
		const configPath = getNoteFolder();
		const notesDirPath = configPath ? vscode.Uri.file(configPath) : context.globalStorageUri;
		const noteFilePath = await findValidPath(notesDirPath)(1);

		await vscode.workspace.fs.createDirectory(notesDirPath);
		await vscode.workspace.fs.writeFile(noteFilePath, new Uint8Array(0));
		await vscode.workspace.openTextDocument(noteFilePath).then(vscode.window.showTextDocument);

		await vscode.commands.executeCommand('workbench.action.editorDictation.start');
	});

	const disposable2 = vscode.commands.registerCommand('quick-voice-note.openNote', async () => {
		const configPath = getNoteFolder();
		const notesDirPath = configPath ? vscode.Uri.file(configPath) : context.globalStorageUri;
		const noteFiles = await vscode.workspace.fs.readDirectory(notesDirPath);
		const fileNames = noteFiles.map(([fileName]) => fileName);

		const selectedFileName = await vscode.window.showQuickPick(fileNames, {
			title: 'Select a note file',
			placeHolder: 'Select a note file to open',
		});
		if (!selectedFileName) {
			return;
		}

		const noteFilePath = vscode.Uri.joinPath(notesDirPath, selectedFileName);
		await vscode.workspace.openTextDocument(noteFilePath).then(vscode.window.showTextDocument);
	});

	context.subscriptions.push(disposable, disposable2);
}

const findValidPath = (dir: vscode.Uri, template = 'note-${index}.md') => (index: number): Thenable<vscode.Uri> => {
	const noteFileName = template.replace('${index}', index.toString());
	const noteFilePath = vscode.Uri.joinPath(dir, noteFileName);
	return vscode.workspace.fs.stat(noteFilePath).then(
		() => findValidPath(dir, template)(index + 1),
		() => noteFilePath
	);
};

export function deactivate() { }
