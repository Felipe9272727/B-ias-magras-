import {Config} from '@remotion/cli/config';
import {existsSync} from 'fs';

// Chromium headless já instalado no container (o mesmo usado pelo Playwright); nas máquinas do GitHub o Remotion baixa o dele.
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(CHROME)) Config.setBrowserExecutable(CHROME);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(3);
Config.setOverwriteOutput(true);
