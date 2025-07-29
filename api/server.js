// Carrega as variáveis de ambiente do arquivo .

const jsonServer = require('json-server')

// --- Início da Configuração do Bot ---
// Pega as variáveis do ambiente. O '|| null' garante que o valor seja nulo se não for definido.
const botToken = 777
const sourceChannelId = 7557
const destinationChannelId = 6776

// Validação inicial: verifica se as variáveis essenciais foram definidas no .env
if (!botToken || !sourceChannelId || !destinationChannelId) {
    console.error("ERRO FATAL: Variáveis de ambiente essenciais (TELEGRAM_BOT_TOKEN, SOURCE_CHANNEL_ID, DESTINATION_CHANNEL_ID) não foram definidas.");
    console.error("Por favor, crie um arquivo .env e defina as variáveis necessárias.");
    // Encerra o processo se a configuração estiver faltando
    process.exit(1); 
}
// --- Fim da Configuração do Bot ---


const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

/**
 * Função que simula a lógica do seu bot usando as variáveis de ambiente.
 * É aqui que você colocará o código real para interagir com a API do Telegram.
 * @param {string} messageId O ID da mensagem a ser copiada.
 */
const copyTelegramMessage = async (messageId) => {
    console.log(`[BOT] Recebido pedido para copiar a mensagem com ID: ${messageId}`);
    console.log(`[BOT] Usando token: ...${botToken.slice(-4)}`); // Mostra apenas o final do token por segurança

    // --- Início da Lógica do Bot (Simulação) ---
    // Substitua este bloco pelo seu código real que usa node-telegram-bot-api ou telegraf.
    // O código aqui usaria 'botToken' para autenticar, e os IDs dos canais para saber de onde copiar e para onde colar.
    
    return new Promise((resolve, reject) => {
        if (messageId && messageId.toString().length > 3) {
            console.log(`[BOT] Mensagem ${messageId} copiada do canal ${sourceChannelId} para o canal ${destinationChannelId} com sucesso.`);
            resolve({
                success: true,
                message: `Mensagem ${messageId} processada.`,
                sourceChannel: sourceChannelId,
                destinationChannel: destinationChannelId
            });
        } else {
            console.error(`[BOT] Falha ao processar a mensagem ${messageId}.`);
            reject(new Error(`ID de mensagem inválido ou não encontrado: ${messageId}`));
        }
    });
    // --- Fim da Lógica do Bot (Simulação) ---
};


// ROTA CUSTOMIZADA PARA O BOT
server.post('/api/bot/copy-message', async (req, res) => {
    const { message_id } = req.body;

    if (!message_id) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'O campo "message_id" é obrigatório.' 
        });
    }

    try {
        const result = await copyTelegramMessage(message_id);
        res.status(200).json({
            status: 'ok',
            details: result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao processar a mensagem.',
            error_details: error.message
        });
    }
});


// Rotas do json-server
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}))

server.use(router)
server.listen(3000, () => {
    console.log(`JSON Server está rodando na porta 3000`);
    console.log(`[BOT] Configuração do bot carregada. Pronto para receber chamadas.`);
})

// Exporta o Server API
module.exports = server