// Usando o módulo HTTP nativo do Node.js para criar o servidor
const http = require('http');

// --- Início da Configuração do Bot (Hardcoded) ---
// ATENÇÃO: Informações sensíveis diretamente no código. Não faça isso em produção.
const botToken = "8365573982:AAEoh0jrQCybYeTwpBlQM5X1qDrCTMtgcmM"; // Substitua pelo seu token real
const sourceChannelId = "-1002842733849";    // Substitua pelo ID real do canal de origem
const destinationChannelId = "-1002607954838"; // Substitua pelo ID real do canal de destino
// --- Fim da Configuração do Bot ---

/**
 * Função que contém a lógica para copiar a mensagem no Telegram.
 * @param {string} messageId O ID da mensagem a ser copiada.
 */
const copyTelegramMessage = async (messageId) => {
    console.log(`[BOT] Recebido pedido para copiar a mensagem com ID: ${messageId}`);
    console.log(`[BOT] Usando token: ...${botToken.toString().slice(-4)}`);

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
    // req.url será algo como "/copy/12345"
    const urlParts = req.url.split('/'); // Transforma a URL em um array: ['', 'copy', '12345']

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
            // Se a lógica falhou (ex: ID inválido), retornamos 400 (Bad Request)
            res.writeHead(400);
            res.end(JSON.stringify({
                status: 'error',
                message: 'Requisição inválida.',
                error_details: error.message
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
const port = 3000;
server.listen(port, () => {
    console.log(`Servidor nativo do Node.js rodando na porta ${port}`);
    console.log(`[BOT] Aguardando chamadas na rota GET http://localhost:3000/copy/:messageId`);
});