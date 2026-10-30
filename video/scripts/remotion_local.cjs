// O renderizador só precisa servir os arquivos no loopback. Não é necessário
// enumerar interfaces de rede, operação indisponível em alguns ambientes.
const path = require('node:path');
const renderer = require.resolve('@remotion/renderer', {paths: [path.resolve(__dirname, '../remotion')]});
const config = require(path.join(path.dirname(renderer), 'port-config.js'));
config.getPortConfig = () => ({host: '127.0.0.1', hostsToTry: ['127.0.0.1']});
