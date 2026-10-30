import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

// Chromium headless já instalado no container (o mesmo usado pelo Playwright).
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(browser)) Config.setBrowserExecutable(browser);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(3);
Config.setOverwriteOutput(true);
