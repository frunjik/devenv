import * as fs from 'node:fs';
import { resolve } from 'node:path';
import { cloneAgentGuide } from './clone-guide';

const destinationArgument = process.argv[2];
if (process.argv.length !== 3 || !destinationArgument) throw new Error('Usage: npm run clone -- <destination>');
const destination = resolve(destinationArgument);
cloneAgentGuide(process.cwd(), destination, fs);
console.log(`Cloned AgentPhaseGuide to ${destination}`);
