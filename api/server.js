// Usando o módulo HTTP nativo do Node.js para criar o servidor
const http = require('http');

// --- Início da Configuração do Bot (Seguro, com Variáveis de Ambiente) ---
// As informações sensíveis são carregadas a partir das Variáveis de Ambiente configuradas na Vercel.
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const sourceChannelId = process.env.SOURCE_CHANNEL_ID;
const destinationChannelId = process.env.DESTINATION_CHANNEL_ID;
// --- Fim da Configuração do Bot ---

/**
 * Função que contém a lógica para copiar a mensagem no Telegram.
 * @param {string} messageId O ID da mensagem a ser copiada.
 */
const copyTelegramMessage = async (messageId) => {
    // Verificação para garantir que as variáveis de ambiente foram carregadas
    if (!botToken || !sourceChannelId || !destinationChannelId) {
        console.error("[BOT] Erro Crítico: As variáveis de ambiente não foram carregadas. Verifique as configurações na Vercel.");
        throw new Error("As variáveis de ambiente do bot não estão configuradas.");
    }
    
    console.log(`[BOT] Recebido pedido para copiar a mensagem com ID: ${messageId}`);
    // A linha abaixo agora é segura, pois 'botToken' não contém mais o valor real.
    console.log(`[BOT] Usando token que termina com: ...${botToken.slice(-4)}`);

    // --- Início da Lógica Real do Bot (Substitua esta simulação) ---
    // Aqui você usaria o 'botToken' para fazer uma chamada HTTPS para a API do Telegram.
    // Exemplo de como seria a lógica real:
    // const bot = new TelegramBot(botToken);
    // await bot.copyMessage(destinationChannelId, sourceChannelId, messageId);
    
    return new Promise((resolve, reject) => {
        // Validação simples: o ID da mensagem deve ser um número.
        if (messageId && !isNaN(messageId)) { 
            console.log(`[BOT] Ação para copiar msg ${messageId} do canal ${sourceChannelId} para ${destinationChannelId} foi bem-sucedida.`);
            resolve({
                success: true,
                message: `Mensagem ${messageId} processada.`,
                sourceChannel: sourceChannelId,
                destinationChannel: destinationChannelId
            });
        } else {
            console.error(`[BOT] Falha ao processar. ID de mensagem inválido: ${messageId}.`);
            reject(new Error(`ID de mensagem inválido fornecido: ${messageId}`));
        }
    });
    // --- Fim da Lógica do Bot ---
};

// Criação do servidor HTTP
const server = http.createServer(async (req, res) => {
    // Definimos o cabeçalho da resposta para indicar que retornaremos JSON
    res.setHeader('Content-Type', 'application/json');

    // Analisamos a URL para criar a rota
    const urlParts = req.url.split('/');

    // Verificamos se a rota está no formato correto: /copy/<ID>
    if (req.method === 'GET' && urlParts[1] === 'copy' && urlParts[2]) {
        const messageId = urlParts[2];

        try {
            // Se a rota está correta, executamos a lógica do bot
            const result = await copyTelegramMessage(messageId);
            
            // Se a lógica funcionou, retornamos status 200 (OK)
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'ok',
                details: result
            }));

        } catch (error) {
            // Se a lógica falhou, retornamos um erro apropriado
            // Se o erro for de configuração, será 500 (Erro Interno do Servidor)
            const statusCode = error.message.includes("ambiente") ? 500 : 400;
            res.writeHead(statusCode);
            res.end(JSON.stringify({
                status: 'error',
                message: error.message
            }));
        }
    } else {
        // Se a URL não corresponde à rota esperada, retornamos 404 (Not Found)
        res.writeHead(404);
        res.end(JSON.stringify({
            status: 'error',
            message: 'Rota não encontrada. Use o formato /copy/:messageId'
        }));
    }
});

// Define a porta e inicia o servidor
const port = process.env.PORT || 3000; // Vercel define a porta via process.env.PORT
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`[BOT] Aguardando chamadas na rota GET /copy/:messageId`);
});