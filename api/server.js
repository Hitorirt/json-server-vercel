// Usando o módulo HTTP nativo do Node.js para criar o servidor
const http = require('http');

// --- Início da Configuração do Bot (Seguro, com Variáveis de Ambiente) ---
// As informações sensíveis são carregadas a partir das Variáveis de Ambiente configuradas na Vercel.
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const sourceChannelId = process.env.SOURCE_CHANNEL_ID;
const destinationChannelId = process.env.DESTINATION_CHANNEL_ID;
// --- Fim da Configuração do Bot ---

/**
 * Função que REALMENTE copia a mensagem no Telegram.
 * @param {string} messageId O ID da mensagem a ser copiada.
 */
const copyTelegramMessage = async (messageId) => {
    // 1. Verificação para garantir que as variáveis de ambiente foram carregadas
    if (!botToken || !sourceChannelId || !destinationChannelId) {
        console.error("[BOT] Erro Crítico: As variáveis de ambiente não foram carregadas. Verifique as configurações na Vercel.");
        throw new Error("As variáveis de ambiente do bot não estão configuradas.");
    }
    
    console.log(`[BOT] Recebido pedido para copiar a mensagem com ID: ${messageId}`);
    
    // 2. Validação para garantir que o ID da mensagem é um número válido
    if (!messageId || isNaN(messageId)) {
        console.error(`[BOT] Falha ao processar. ID de mensagem inválido: ${messageId}.`);
        throw new Error(`ID de mensagem inválido fornecido: ${messageId}`);
    }

    // --- Início da Lógica Real do Bot ---
    // Monta a URL da API do Telegram para o método 'copyMessage'
    const apiUrl = `https://api.telegram.org/bot${botToken}/copyMessage`;

    // Prepara os dados a serem enviados para o Telegram no formato JSON
    const body = {
        chat_id: destinationChannelId,  // Para onde a mensagem vai
        from_chat_id: sourceChannelId, // De onde a mensagem vem
        message_id: messageId          // Qual mensagem específica copiar
    };

    try {
        // Faz a chamada real para a API do Telegram usando fetch
        console.log(`[BOT] Enviando requisição para a API do Telegram...`);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        // Converte a resposta do Telegram em JSON
        const result = await response.json();

        // Verifica se o Telegram retornou um erro (ex: bot não tem permissão, canal não existe)
        if (!response.ok) {
            console.error(`[BOT] Erro da API do Telegram: ${result.description}`);
            throw new Error(`Erro do Telegram: ${result.description}`);
        }

        // Se tudo deu certo, retorna uma mensagem de sucesso
        console.log(`[BOT] Mensagem ${messageId} copiada com sucesso.`);
        return {
            success: true,
            message: `Mensagem ${messageId} copiada com sucesso.`,
            sourceChannel: sourceChannelId,
            destinationChannel: destinationChannelId,
            telegramResponse: result // Inclui a resposta do Telegram para depuração
        };

    } catch (error) {
        // Captura falhas de rede ou outros erros durante a chamada
        console.error("[BOT] Falha na comunicação com a API do Telegram.", error);
        // Repassa o erro para a função principal
        throw error;
    }
    // --- Fim da Lógica do Bot ---
};

// Criação do servidor HTTP que escuta as requisições
const server = http.createServer(async (req, res) => {
    // Define o cabeçalho da resposta para indicar que retornaremos JSON
    res.setHeader('Content-Type', 'application/json');

    // Analisa a URL para criar a rota (ex: /copy/123)
    const urlParts = req.url.split('/');

    // Verifica se a rota está no formato correto: GET /copy/<ID>
    if (req.method === 'GET' && urlParts[1] === 'copy' && urlParts[2]) {
        const messageId = urlParts[2];

        try {
            // Se a rota está correta, executa a lógica do bot
            const result = await copyTelegramMessage(messageId);
            
            // Se a lógica funcionou, retorna status 200 (OK)
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'ok',
                details: result
            }));

        } catch (error) {
            // Se a lógica falhou, retorna um erro apropriado
            // 500 para erro de configuração, 400 para erro de requisição
            const statusCode = error.message.includes("ambiente") ? 500 : 400;
            res.writeHead(statusCode);
            res.end(JSON.stringify({
                status: 'error',
                message: 'A requisição falhou.',
                error_details: error.message
            }));
        }
    } else {
        // Se a URL não corresponde à rota esperada, retorna 404 (Not Found)
        res.writeHead(404);
        res.end(JSON.stringify({
            status: 'error',
            message: 'Rota não encontrada. Use o formato /copy/:messageId'
        }));
    }
});

// Define a porta e inicia o servidor
// A Vercel define a porta através da variável de ambiente PORT
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`[BOT] Aguardando chamadas na rota GET /copy/:messageId`);
});