import {Config} from '@remotion/cli/config';

// Chromium headless já instalado no container (o mesmo usado pelo Playwright).
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(3);
Config.setOverwriteOutput(true);
