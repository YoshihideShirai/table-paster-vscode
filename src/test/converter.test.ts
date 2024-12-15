import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myConverter from '../converter';
import asciidoctor from 'asciidoctor';

suite('Converter Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    const Asciidoctor = asciidoctor();
    test('Converter Test', () => {
        const asciidoc: string = `
[cols="1,1"]
|===
|Cell in column 1, row 1 
|Cell in column 2, row 1 

|Cell in column 1, row 2
|Cell in column 2, row 2

|Cell in column 1, row 3
|Cell in column 2, row 3 
|=== 
`;
        const expected = Asciidoctor.convert(asciidoc);
        if (typeof expected === "string") {
            const actual_adoc: string = myConverter.tableConverter('asciidoc', expected);
            const actual = Asciidoctor.convert(actual_adoc);
            assert.equal(actual, expected);
        }
    });
});
