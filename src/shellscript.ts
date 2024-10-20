'use strict';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

function executeCommand(shell: string, options: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        let process: ChildProcess = spawn(shell, options);
        if (null !== process.stdout) {
            process.stdout.on("data", contents => {
                stdout += contents;
            });
        }
        if (null !== process.stderr) {
            process.stderr.on("data", contents => {
                stderr += contents;
            });
        }
        process.on("error", reject).on("close", function (code) {
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(stderr));
            }
        });
    });
}

function getShellScript(): ScriptRunner {
    return new Win32Script();
}

interface ScriptRunner {
    readHtml(): Promise<string>;
    runScript(script: string, parameters: string[]): Promise<string>;
}

class Win32Script implements ScriptRunner {
    public async readHtml() {
        const script = "win32.ps1";
        let stdout;
        try {
            stdout = await this.runScript(script, []);
        } catch (err) {
            throw new Error('faild save image of clipboard');
        }

        const data = stdout.trim();

        if (!data) {
            throw new Error('faild genrate image from clipboard');
        }

        if (data === 'no readhtml') {
            throw new Error('html of clipboard is empty');
        }
        return data;
    }

    public runScript(script: string, parameters: string[]): Promise<string> {
        const scriptPath = path.join(__dirname, '../res/' + script);
        const shell = 'powershell';
        const command = [
            '-noprofile',
            '-noninteractive',
            '-nologo',
            '-sta',
            '-executionpolicy', 'unrestricted',
            '-windowstyle', 'hidden',
            '-file', scriptPath].concat(parameters);
        return executeCommand(shell, command);
    }
}

export { getShellScript };