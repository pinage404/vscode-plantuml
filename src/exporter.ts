import * as vscode from 'vscode';
import * as path from 'path';

import { exporter as exp } from './exporter/exporter';
import { Diagram, Diagrams } from './diagram';
import { outputPanel, localize } from './planuml';
import { config } from './config';
import { showMessagePanel, StopWatch } from './tools';

class DocumentExporter {
    register(): vscode.Disposable[] {
        //register export
        let ds: vscode.Disposable[] = [];
        let d = vscode.commands.registerCommand('plantuml.exportCurrent', () => {
            this.exportDocument(false);
        });
        ds.push(d);
        d = vscode.commands.registerCommand('plantuml.exportDocument', () => {
            this.exportDocument(true);
        });
        ds.push(d);
        return ds;
    }
    private async exportDocument(all: boolean) {
        try {
            let stopWatch = new StopWatch();
            stopWatch.start();
            let editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage(localize(0, null));
                return;
            }
            if (!path.isAbsolute(editor.document.fileName)) {
                vscode.window.showInformationMessage(localize(1, null));
                return;
            };
            let format = config.exportFormat;
            if (!format) {
                format = await vscode.window.showQuickPick(exp.formats());
                if (!format) return;
            }
            outputPanel.clear();
            let ds = new Diagrams();
            if (all) {
                ds.AddDocument();
                if (!ds.diagrams.length) {
                    vscode.window.showInformationMessage(localize(2, null));
                    return;
                }
            } else {
                let dg = new Diagram().GetCurrent();
                if (!dg.content) {
                    vscode.window.showInformationMessage(localize(3, null));
                    return;
                }
                ds.Add(dg);
                editor.selections = [new vscode.Selection(dg.start, dg.end)];
            }
            let bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            exp.exportDiagrams(ds.diagrams, format, bar).then(
                async results => {
                    stopWatch.stop();
                    bar.dispose();
                    if (!results.length) return;
                    let viewReport = localize(26, null);
                    let btn = await vscode.window.showInformationMessage(localize(4, null), viewReport);
                    if (btn !== viewReport) return;
                    let fileCnt = 0;
                    let fileLst = results.reduce((p, c) => {
                        fileCnt += c.length;
                        return p + "\n" + c.join("\n");
                    }, "");
                    showMessagePanel(
                        outputPanel,
                        localize(27, null, ds.diagrams.length, fileCnt, stopWatch.runTime() / 1000) + fileLst
                    );
                },
                error => {
                    bar.dispose();
                    showMessagePanel(outputPanel, error);
                }
            );
        } catch (error) {
            showMessagePanel(outputPanel, error);
        }
        return;
    }
}
export const exporter = new DocumentExporter();