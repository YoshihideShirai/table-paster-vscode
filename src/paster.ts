'use strict';
import * as vscode from 'vscode';
import { getShellScript } from './shellscript';
import { tableConverter } from './converter';

class Paster {
    public static async pasteTableOnEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        const lang = editor.document.languageId;
        const target = new PasteTarget(editor);
        const script = getShellScript();

        try {
            const htmlData = await script.readHtml();
            const context = tableConverter(lang, htmlData) ?? "";
            target.pasteText(context);
        } catch (err) {
            vscode.window.showErrorMessage("" + err);
        }
    }
}

class PasteTarget {
    private readonly editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    public pasteText(context: string) {
        context = decodeURI(context);
        return this.editor.edit(edit => {
            const current = this.editor.selection;

            if (current.isEmpty) {
                edit.insert(current.start, context);
            } else {
                edit.replace(current, context);
            }
        });
    }
}

export { Paster };