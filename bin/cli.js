#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Anthropic } = require('@anthropic-ai/sdk');
const promp = inquirer.createPromptModule();

const [, , ...args] = process.argv;

async function setup() {
    console.log('Ejecutando setup...');

    const questions = [
        {
            type: 'list',
            name: 'aiProvider',
            message: '¿Qué proveedor de AI quieres usar?',
            choices: ['OpenAI', 'Anthropic'],
        },
        {
            type: 'input',
            name: 'apiToken',
            message: 'Introduce tu token de API:',
            validate: input => input.length > 0 ? true : 'Por favor, introduce un token válido.',
        },
    ];

    const answers = await promp(questions);

    // Guardar la configuración
    const config = JSON.stringify(answers, null, 2);
    const configPath = path.join(process.cwd(), 'commit-config.json');

    fs.writeFileSync(configPath, config);

    console.log(`Configuración guardada en ${configPath}`);
}


async function defaultCommand() {
    console.log('Ejecutando commit...');

    const configPath = path.join(process.cwd(), 'commit-config.json');

    if (!fs.existsSync(configPath)) {
        console.log('No se encontró configuración. Por favor, ejecuta "commit setup" primero.');
        return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (config.aiProvider !== 'Anthropic') {
        console.log('Este comando solo funciona con Anthropic por ahora.');
        return;
    }

    // Leer archivos en staging
    const stagedFiles = await getStagedFiles();

    if (stagedFiles.length !== 0 && stagedFiles[0] === '') {
        console.log('No hay archivos en staging. Añade archivos antes de hacer commit.');
        return;
    }

    // Leer el contenido de los archivos en staging
    const filesContent = await getFilesContent(stagedFiles);

    console.log('Archivos en staging:\n', filesContent);
    return 

    // Generar mensaje de commit usando Claude
    const commitMessage = await generateCommitMessage(config.apiToken, filesContent);

    // Mostrar el mensaje generado y pedir confirmación
    const { confirmCommit } = await promp([
        {
            type: 'confirm',
            name: 'confirmCommit',
            message: `Mensaje de commit generado:\n\n${commitMessage}\n\n¿Quieres usar este mensaje?`,
        }
    ]);

    if (confirmCommit) {
        await makeCommit(commitMessage);
        console.log('Commit realizado con éxito.');
    } else {
        console.log('Commit cancelado.');
    }
}

async function getStagedFiles() {
    return new Promise((resolve, reject) => {
        exec('git diff --cached --name-only', (error, stdout, stderr) => {
            if (error) {
                reject(`Error al obtener archivos en staging: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Error al obtener archivos en staging: ${stderr}`);
                return;
            }
            resolve(stdout.trim().split('\n'));
        });
    });
}

async function getFilesContent(files) {
    let content = '';
    for (const file of files) {
        content += `File: ${file}\n`;
        content += await fs.promises.readFile(file, 'utf8');
        content += '\n\n';
    }
    return content;
}

async function generateCommitMessage(apiToken, filesContent) {
    const anthropic = new Anthropic({
        apiKey: apiToken,
    });

    const response = await anthropic.completions.create({
        model: "claude-2",
        prompt: `Por favor, genera un mensaje de commit conciso y descriptivo basado en los siguientes cambios:\n\n${filesContent}\n\nMensaje de commit:`,
        max_tokens_to_sample: 100,
    });

    return response.completion.trim();
}

async function makeCommit(message) {
    return new Promise((resolve, reject) => {
        exec(`git commit -m "${message}"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error al hacer commit: ${error.message}`);
                return;
            }
            if (stderr) {
                console.warn(`Advertencia al hacer commit: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

if (args.length > 0 && args[0] === 'setup') {
    setup();
} else {
    defaultCommand();
}