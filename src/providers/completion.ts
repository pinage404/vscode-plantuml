import * as vscode from 'vscode';
import { SnippetString } from 'vscode';
import { LanguageCompletionItems } from '../plantuml/intellisense/languageCompletion';
import { MacroCompletionItems } from '../plantuml/intellisense/macroCompletion';

export class Completion extends vscode.Disposable implements vscode.CompletionItemProvider {
    private _disposables: vscode.Disposable[] = [];

    constructor() {
        super(() => this.dispose());
        let sel: vscode.DocumentSelector = [
            "diagram"
        ];
        this._disposables.push(
            vscode.languages.registerCompletionItemProvider(sel, this)
        );
    }

    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken)
        : Thenable<vscode.CompletionItem[]> {
        return Promise.all([
            MacroCompletionItems(document, position, token),
            LanguageCompletionItems()
        ]).then(
            results => [].concat(...results)
        )
    }

    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        // TODO: add item.documentation
        return null;
    }
}

