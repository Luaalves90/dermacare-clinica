// ============================================
// VARIÁVEIS GLOBAIS E CONSTANTES
// ============================================
const CONFIG = {
    whatsappNumber: '5511999999999',
    totalDepoimentos: 3,
    autoChatbotDelay: 3000,
    carrosselInterval: 5000,
    clinicInfo: {
        phone: '(11) 99999-9999',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        email: 'contato@dermacare.com.br',
        workingHours: {
            weekdays: 'Segunda a Sexta: 9h às 18h',
            saturday: 'Sábado: 9h às 13h',
            sunday: 'Domingo: Fechado'
        }
    },
    // HORÁRIOS FIXOS DA CLÍNICA
    horariosFixos: [
        '09:00', '10:00', '11:00',  // Manhã
        '14:00', '15:00', '16:00', '17:00'  // Tarde
    ],
    // HORÁRIO DE ALMOÇO (SEMPRE INDISPONÍVEL)
    horarioAlmoco: {
        inicio: '12:00',
        fim: '14:00'
    },
    // DURAÇÃO DA CONSULTA EM MINUTOS
    duracaoConsulta: 60,
    // URL DO GOOGLE APPS SCRIPT
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbypdxaHUXlGcY1dzcu1DinBczHDzBcmvekvp2on0w7iX1Om_pC0rkfk4CcLkR5kKtvn/exec'
};

let currentDepoimento = 0;
let carrosselInterval;
let chatbotOpen = false;
let horarioSelecionado = null;
let dataSelecionada = null;

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DermaCare - Inicializando sistema...');
    
    try {
        initMenuMobile();
        initModalAgendamento();
        initChatbot();
        initCarrosselDepoimentos();
        initFormularios();
        initScrollSuave();
        initSistemaHorarios();
        
        // Abrir chatbot automático após delay
        setTimeout(function() {
            const chatbot = document.querySelector('.chatbot-container');
            if (chatbot && !chatbotOpen) {
                chatbot.classList.add('active');
                chatbotOpen = true;
                console.log('🤖 Chatbot aberto automaticamente');
            }
        }, CONFIG.autoChatbotDelay);
        
        // Botão de ligar para mobile
        if (window.innerWidth <= 768) {
            createCallButton();
        }
        
        console.log('✅ Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
});

// ============================================
// 1. MENU MOBILE
// ============================================
function initMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (!menuToggle || !navList) {
        console.warn('⚠️ Elementos do menu mobile não encontrados');
        return;
    }
    
    menuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
        const isActive = navList.classList.contains('active');
        menuToggle.innerHTML = isActive 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-expanded', isActive);
        console.log('📱 Menu mobile:', isActive ? 'aberto' : 'fechado');
    });
    
    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-list a').forEach(function(link) {
        link.addEventListener('click', function() {
            navList.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!navList.contains(e.target) && !menuToggle.contains(e.target) && navList.classList.contains('active')) {
            navList.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================
// 2. MODAL DE AGENDAMENTO - CORREÇÃO COMPLETA
// ============================================
function initModalAgendamento() {
    console.log('🔧 Configurando modal de agendamento...');
    
    const modal = document.getElementById('agendamentoModal');
    if (!modal) {
        console.error('❌ Modal de agendamento não encontrado!');
        return;
    }
    
    console.log('✅ Modal encontrado');
    
    // Botão de fechar
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
        console.log('✅ Botão de fechar configurado');
    }
    
    // Configurar TODOS os botões que abrem o modal
    configurarBotoesAberturaModal();
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Formulário
    const form = document.getElementById('agendamentoForm');
    if (form) {
        form.addEventListener('submit', handleAgendamentoSubmit);
        console.log('✅ Formulário configurado');
    }
    
    // Máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
    }
    
    console.log('✅ Modal de agendamento completamente configurado');
}

function configurarBotoesAberturaModal() {
    // Lista de seletores de botões que devem abrir o modal
    const seletoresBotoes = [
        '#openAgendamento',           // Header
        '#openAgendamento2',          // Hero
        '#openAgendamento3',          // Footer
        '.chat-option[data-option="agendar"]',
        '.chat-option[data-action="agendar"]'
    ];
    
    seletoresBotoes.forEach(function(seletor) {
        document.querySelectorAll(seletor).forEach(function(botao) {
            botao.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Botão clicado para abrir modal:', seletor);
                openModal('agendamentoModal');
            });
        });
    });
    
    console.log(`✅ ${seletoresBotoes.length} tipos de botões configurados para abrir modal`);
}

function openModal(modalId) {
    console.log(`🟢 Tentando abrir modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} não encontrado!`);
        return;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    console.log('✅ Modal aberto com sucesso!');
    
    // Focar no primeiro campo se for modal de agendamento
    if (modalId === 'agendamentoModal') {
        setTimeout(function() {
            const primeiroCampo = modal.querySelector('#nome, input, select, textarea');
            if (primeiroCampo) {
                primeiroCampo.focus();
            }
        }, 300);
    }
}

function closeModal() {
    console.log('🔴 Fechando modal...');
    
    const modal = document.querySelector('.modal.active');
    if (!modal) {
        console.warn('⚠️ Nenhum modal ativo para fechar');
        return;
    }
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.body.classList.remove('modal-open');
    
    // Resetar mensagem de sucesso se estiver visível
    const successDiv = document.getElementById('successMessage');
    const form = document.getElementById('agendamentoForm');
    if (successDiv && successDiv.style.display !== 'none') {
        successDiv.style.display = 'none';
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
    }
    
    console.log('✅ Modal fechado com sucesso');
}

// ============================================
// 3. CHATBOT INTELIGENTE
// ============================================
function initChatbot() {
    console.log('🔧 Configurando chatbot...');
    
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    if (!chatbotToggle) {
        console.error('❌ Botão do chatbot não encontrado!');
        return;
    }
    
    console.log('✅ Botão do chatbot encontrado');
    
    // Toggle do chatbot
    chatbotToggle.addEventListener('click', function() {
        toggleChatbot();
    });
    
    // Botão de fechar
    const closeBtn = document.querySelector('.close-chatbot');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeChatbotHandler();
        });
    }
    
    // Configurar opções do chatbot
    configurarOpcoesChatbot();
    
    // Configurar envio de mensagens
    configurarEnvioMensagens();
    
    console.log('✅ Chatbot completamente configurado');
}

function toggleChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (!chatbotContainer) {
        console.error('❌ Container do chatbot não encontrado!');
        return;
    }
    
    chatbotContainer.classList.toggle('active');
    chatbotOpen = chatbotContainer.classList.contains('active');
    
    if (chatbotOpen) {
        setTimeout(function() {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
    }
    
    console.log('🤖 Chatbot:', chatbotOpen ? 'ABERTO' : 'FECHADO');
}

function closeChatbotHandler() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer) {
        chatbotContainer.classList.remove('active');
        chatbotOpen = false;
        console.log('🤖 Chatbot fechado');
    }
}

function configurarOpcoesChatbot() {
    document.addEventListener('click', function(e) {
        const chatOption = e.target.closest('.chat-option');
        if (chatOption) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = chatOption.getAttribute('data-action');
            
            console.log('🤖 Opção do chatbot selecionada:', action);
            
            if (action) {
                const resposta = getBotResponseForOption(action);
                addBotMessage(resposta);
                
                // Se for agendar, abre o modal
                if (action === 'agendar') {
                    setTimeout(() => {
                        closeChatbotHandler();
                        openModal('agendamentoModal');
                    }, 1500);
                }
            }
        }
    });
}

function configurarEnvioMensagens() {
    const sendBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    
    if (!sendBtn || !chatInput) {
        console.warn('⚠️ Elementos de envio de mensagem não encontrados');
        return;
    }
    
    // Enviar ao clicar no botão
    sendBtn.addEventListener('click', function() {
        sendUserMessage();
    });
    
    // Enviar ao pressionar Enter
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendUserMessage();
        }
    });
    
    console.log('✅ Sistema de mensagens configurado');
}

function sendUserMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addUserMessage(message);
    
    // Limpar input
    chatInput.value = '';
    
    // Resposta inteligente do bot
    setTimeout(function() {
        const botResponse = getBotResponse(message);
        addBotMessage(botResponse);
    }, 800);
}

function addUserMessage(text) {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <p>${text}</p>
        <p class="message-time">${timeString}</p>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addBotMessage(text) {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <p>${text}</p>
        <p class="message-time">${timeString}</p>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    
    // 1. AGENDAMENTO
    if (msg.includes('agendar') || msg.includes('marcar') || msg.includes('consulta') || msg.includes('marcação')) {
        return getBotResponseForOption('agendar');
    }
    
    // 2. VALORES
    if (msg.includes('valor') || msg.includes('preço') || msg.includes('quanto custa') || msg.includes('custa quanto')) {
        return getBotResponseForOption('valores');
    }
    
    // 3. HORÁRIOS
    if (msg.includes('horário') || msg.includes('funciona') || msg.includes('aberto') || msg.includes('horario') || msg.includes('atende')) {
        return getBotResponseForOption('horarios');
    }
    
    // 4. CANCELAMENTO
    if (msg.includes('cancelar') || msg.includes('remarcar') || msg.includes('desmarcar') || msg.includes('falta')) {
        return getBotResponseForOption('cancelar');
    }
    
    // 5. LOCALIZAÇÃO
    if (msg.includes('onde fica') || msg.includes('local') || msg.includes('endereço') || msg.includes('endereco') || msg.includes('chegar')) {
        return getBotResponseForOption('localizacao');
    }
    
    // 6. CONTATO
    if (msg.includes('telefone') || msg.includes('contato') || msg.includes('whatsapp') || msg.includes('ligar') || msg.includes('email')) {
        return getBotResponseForOption('contato');
    }
    
    // 7. CONVÊNIOS
    if (msg.includes('convênio') || msg.includes('convenio') || msg.includes('plano') || msg.includes('unimed') || msg.includes('amil')) {
        return getBotResponseForOption('convênio');
    }
    
    // 8. DOCUMENTOS
    if (msg.includes('documento') || msg.includes('trazer') || msg.includes('primeira consulta') || msg.includes('leve')) {
        return getBotResponseForOption('documentos');
    }
    
    // 9. PONTUALIDADE
    if (msg.includes('atrasar') || msg.includes('pontual') || msg.includes('horário da consulta') || msg.includes('chegar cedo')) {
        return getBotResponseForOption('pontualidade');
    }
    
    // PERGUNTAS TÉCNICAS/DIAGNÓSTICO
    if (
        msg.includes('procedimento') || msg.includes('tratamento') || msg.includes('como funciona') || 
        msg.includes('injeção') || msg.includes('laser') || msg.includes('ácido') || msg.includes('acido') ||
        msg.includes('preenchimento') || msg.includes('botox') ||
        msg.includes('mancha') || msg.includes('verruga') || msg.includes('câncer') || msg.includes('cancer') ||
        msg.includes('alergia') || msg.includes('coceira') || msg.includes('dor') || msg.includes('vermelhidão') ||
        msg.includes('diagnóstico') || msg.includes('diagnostico') || msg.includes('doença') || msg.includes('doenca') ||
        msg.includes('receita') || msg.includes('medicamento') || msg.includes('pomada') || msg.includes('creme')
    ) {
        return getBotResponseForOption('tecnica');
    }
    
    // EMERGÊNCIAS
    if (msg.includes('emergência') || msg.includes('emergencia') || msg.includes('urgente') || 
        msg.includes('sangrando') || msg.includes('infecção') || msg.includes('infeccao') || 
        msg.includes('dor forte') || msg.includes('febre alta')) {
        return getBotResponseForOption('emergencia');
    }
    
    // SAUDAÇÕES
    if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola') || msg.includes('bom dia') || 
        msg.includes('boa tarde') || msg.includes('boa noite')) {
        return getBotResponseForOption('saudacao');
    }
    
    // OPÇÕES
    if (msg.includes('opções') || msg.includes('opcoes') || msg.includes('ajuda') || msg.includes('o que pode fazer')) {
        return getBotResponseForOption('opcoes');
    }
    
    // PADRÃO
    return "Desculpe, não entendi sua pergunta. Posso ajudar com:<br>" +
           "• Agendamento de consultas<br>" +
           "• Valores e formas de pagamento<br>" +
           "• Horários de funcionamento<br>" +
           "• Política de cancelamento<br>" +
           "• Localização e contato<br>" +
           "Digite 'opções' para ver mais.";
}

function getBotResponseForOption(opcao) {
    const respostas = {
        'saudacao': `👋 Olá! Sou o assistente virtual da DermaCare. Posso ajudar você com:<br>
                    • Informações sobre agendamento<br>
                    • Valores e horários<br>
                    • Políticas da clínica<br>
                    • Localização e contato<br><br>
                    Como posso ajudá-lo hoje?`,

        'opcoes': `📋 Posso ajudar com:<br><br>
                  🏥 <strong>Serviços:</strong><br>
                  • Agendar consulta<br>
                  • Valores e convênios<br>
                  • Horários de funcionamento<br>
                  • Documentos necessários<br><br>
                  📞 <strong>Informações:</strong><br>
                  • Endereço e contato<br>
                  • Política de cancelamento<br>
                  • Formas de pagamento<br>
                  • Pontualidade e regras<br><br>
                  <em>Digite sua pergunta ou escolha uma opção acima!</em>`,

        'agendar': `📅 <strong>AGENDAMENTO DE CONSULTA</strong><br><br>
                   Para agendar, você pode:<br>
                   1. <strong>Clique em "Agendar Consulta"</strong> no menu<br>
                   2. <strong>Preencha o formulário online</strong> com seus dados<br>
                   3. <strong>Escolha data e horário</strong> disponíveis<br>
                   4. <strong>Confirmação por e-mail</strong> em até 2h úteis<br><br>
                   <strong>Valores:</strong><br>
                   • Primeira consulta: R$ 350,00 (60min)<br>
                   • Retorno: R$ 200,00 (30min)<br>
                   • Procedimentos: A partir de R$ 500,00<br><br>
                   <em>Vou abrir o formulário para você...</em>`,

        'valores': `💰 <strong>VALORES E PAGAMENTOS</strong><br><br>
                   <strong>Consultas:</strong><br>
                   • Primeira consulta: R$ 350,00 (60 minutos)<br>
                   • Consulta de retorno: R$ 200,00 (30 minutos)<br>
                   • Consulta de emergência: R$ 450,00<br><br>
                   <strong>Formas de pagamento:</strong><br>
                   • Dinheiro<br>
                   • Cartões (todas as bandeiras)<br>
                   • PIX (Chave CNPJ: 12.345.678/0001-90)<br>
                   • Convênios (Amil, Bradesco, SulAmérica, Porto Seguro)<br><br>
                   <strong>Política de reembolso:</strong> Segue legislação vigente.`,

        'horarios': `⏰ <strong>HORÁRIOS DE FUNCIONAMENTO</strong><br><br>
                    <strong>Atendimento presencial:</strong><br>
                    • Segunda a Sexta: 9h às 18h<br>
                    • Sábado: 9h às 13h<br>
                    • Domingo: Fechado<br><br>
                    <strong>Horário de almoço:</strong> 12h às 14h<br><br>
                    <strong>Agendamento online:</strong> 24 horas por dia<br><br>
                    <strong>Tempo de consulta:</strong><br>
                    • Primeira: 60 minutos<br>
                    • Retorno: 30 minutos`,

        'cancelar': `❌ <strong>POLÍTICA DE CANCELAMENTO</strong><br><br>
                    <strong>Cancelamento por parte do paciente:</strong><br>
                    • Até 24h antes: <strong>sem custos</strong><br>
                    • Entre 24h e 2h antes: <strong>taxa de 30%</strong><br>
                    • Menos de 2h antes: <strong>taxa de 50%</strong><br>
                    • Falta sem aviso: <strong>cobrança integral</strong><br><br>
                    <strong>Como cancelar:</strong><br>
                    • Link no e-mail de confirmação<br>
                    • WhatsApp: (11) 99999-9999<br>
                    • Telefone: (11) 3333-4444<br>
                    • E-mail: cancelamentos@dermacare.com.br<br><br>
                    <strong>Remarcações:</strong> Cancele e faça novo agendamento.`,

        'localizacao': `🗺️ <strong>LOCALIZAÇÃO</strong><br><br>
                       <strong>Endereço:</strong><br>
                       Av. Paulista, 1000<br>
                       Bela Vista, São Paulo - SP<br>
                       CEP: 01310-000<br><br>
                       <strong>Como chegar:</strong><br>
                       • Metrô: Estação Trianon-MASP (Linha 2-Verde)<br>
                       • Ônibus: Diversas linhas na Av. Paulista<br>
                       • Estacionamento: Há vagas no local<br><br>
                       <strong>Use o mapa no rodapé do site para navegação!</strong>`,

        'contato': `📞 <strong>CONTATO</strong><br><br>
                   <strong>Telefone fixo:</strong> (11) 3333-4444<br>
                   <strong>WhatsApp:</strong> (11) 99999-9999<br>
                   <strong>E-mail:</strong> contato@dermacare.com.br<br><br>
                   <strong>Horário de atendimento telefônico:</strong><br>
                   • Segunda a Sexta: 9h às 17h<br>
                   • Sábado: 9h às 13h<br><br>
                   <strong>Jurídico:</strong> juridico@dermacare.com.br<br>
                   <strong>Agendamento:</strong> agendamento@dermacare.com.br`,

        'convênio': `🏥 <strong>CONVÊNIOS ACEITOS</strong><br><br>
                    Aceitamos os seguintes convênios:<br>
                    • Amil<br>
                    • Bradesco Saúde<br>
                    • SulAmérica<br>
                    • Porto Seguro<br><br>
                    <strong>Importante:</strong><br>
                    • Traga carteirinha na consulta<br>
                    • Verifique cobertura com seu convênio<br>
                    • Alguns procedimentos podem não ser cobertos<br><br>
                    <em>Para consultas particulares, aceitamos todas formas de pagamento.</em>`,

        'documentos': `📄 <strong>DOCUMENTAÇÃO NECESSÁRIA</strong><br><br>
                      <strong>Para primeira consulta, traga:</strong><br>
                      1. <strong>Documento com foto:</strong> RG, CNH ou passaporte<br>
                      2. <strong>Cartão do convênio:</strong> Se for utilizar<br>
                      3. <strong>Exames anteriores:</strong> Relatórios, biópsias, receitas<br>
                      4. <strong>Lista de medicamentos:</strong> Em uso atualmente<br><br>
                      <strong>Para menores de 18 anos:</strong><br>
                      • Autorização dos pais/responsáveis<br>
                      • Documentos do responsável<br>
                      • Certidão de nascimento da criança`,

        'pontualidade': `⏰ <strong>PONTUALIDADE E REGRAS</strong><br><br>
                        <strong>Chegada:</strong> Recomendamos chegar 15 minutos antes<br><br>
                        <strong>Tolerância:</strong><br>
                        • Consultas de 60min: 15 minutos<br>
                        • Consultas de 30min: 10 minutos<br><br>
                        <strong>Atrasos:</strong><br>
                        • Mais de 15min: consulta cancelada<br>
                        • Sujeito à taxa de falta<br><br>
                        <strong>Comportamento:</strong><br>
                        • Respeito à equipe e outros pacientes<br>
                        • Uso de máscara se com sintomas respiratórios`,

        'tecnica': `🩺 <strong>INFORMAÇÃO IMPORTANTE</strong><br><br>
                   Desculpe, mas <strong>não posso fornecer informações técnicas, diagnósticos ou recomendações médicas específicas</strong>.<br><br>
                   <strong>Por que?</strong><br>
                   • Cada caso dermatológico é único<br>
                   • Diagnóstico requer avaliação presencial<br>
                   • Tratamentos devem ser personalizados<br><br>
                   <strong>O que fazer:</strong><br>
                   • <strong>Agende uma consulta</strong> para avaliação completa<br>
                   • Nossa dermatologista avaliará seu caso pessoalmente<br>
                   • Receberá orientações específicas para você<br><br>
                   <em>A sua saúde em primeiro lugar!</em>`,

        'emergencia': `🚨 <strong>EMERGÊNCIA MÉDICA</strong><br><br>
                      <strong>ATENÇÃO: NÃO USE ESTE CHAT PARA EMERGÊNCIAS!</strong><br><br>
                      <strong>Se você está com:</strong><br>
                      • Dor intensa<br>
                      • Sangramento importante<br>
                      • Dificuldade para respirar<br>
                      • Febre muito alta<br>
                      • Reação alérgica grave<br><br>
                      <strong>PROCURE IMEDIATAMENTE:</strong><br>
                      1. <strong>Pronto-socorro</strong> mais próximo<br>
                      2. <strong>SAMU: 192</strong><br>
                      3. <strong>Corpo de Bombeiros: 193</strong><br><br>
                      <em>Este chat é apenas para informações administrativas!</em>`,

        'default': `🤔 <strong>NÃO ENTENDI</strong><br><br>
                   Desculpe, não entendi sua pergunta. Posso ajudar com:<br><br>
                   📅 <strong>Agendamento:</strong> Valores, horários, como agendar<br>
                   📋 <strong>Informações:</strong> Documentos, convênios, localização<br>
                   📞 <strong>Contato:</strong> Telefones, e-mails, endereço<br>
                   ❌ <strong>Políticas:</strong> Cancelamento, pontualidade<br><br>
                   <em>Tente perguntar de outra forma ou digite "opções"!</em>`
    };
    
    return respostas[opcao] || respostas['default'];
}

// ============================================
// 4. SISTEMA DE HORÁRIOS
// ============================================
function initSistemaHorarios() {
    console.log('🔧 Configurando sistema de horários...');
    
    const dataInput = document.getElementById('data-escolhida');
    if (!dataInput) {
        console.warn('⚠️ Campo de data não encontrado');
        return;
    }
    
    // Configurar data mínima (amanhã)
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    dataInput.min = amanha.toISOString().split('T')[0];
    
    // Configurar data padrão (3 dias à frente)
    const dataPadrao = new Date();
    dataPadrao.setDate(dataPadrao.getDate() + 3);
    dataInput.value = dataPadrao.toISOString().split('T')[0];
    dataSelecionada = dataInput.value;
    
    console.log('📅 Data inicial configurada:', dataSelecionada);
    
    // Event listener para mudança de data
    dataInput.addEventListener('change', function(e) {
        dataSelecionada = e.target.value;
        if (dataSelecionada) {
            console.log('📅 Data alterada para:', dataSelecionada);
            carregarHorariosDisponiveis(dataSelecionada);
        }
    });
    
    // Carregar horários inicialmente
    carregarHorariosDisponiveis(dataSelecionada);
}

function carregarHorariosDisponiveis(data) {
    console.log('⏰ Carregando horários para:', data);
    
    const container = document.getElementById('horarios-disponiveis');
    if (!container) {
        console.error('❌ Container de horários não encontrado');
        return;
    }
    
    // Mostrar loading
    container.innerHTML = `
        <div class="loading-horarios">
            <i class="fas fa-spinner fa-spin"></i>
            Buscando horários disponíveis...
        </div>
    `;
    
    // Simular carregamento (em produção, buscar do Google Calendar)
    setTimeout(function() {
        gerarBotoesHorario(container, data);
    }, 800);
}

function gerarBotoesHorario(container, data) {
    const hoje = new Date();
    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay();
    const ehFinalDeSemana = diaSemana === 0 || diaSemana === 6;
    
    let html = '';
    let horariosDisponiveisCount = 0;
    
    // Para cada horário fixo
    CONFIG.horariosFixos.forEach(function(horario) {
        const [hora, minuto] = horario.split(':').map(Number);
        const dataHora = new Date(dataObj);
        dataHora.setHours(hora, minuto, 0, 0);
        
        // Verificar status do horário
        const status = verificarStatusHorario(dataHora, horario, ehFinalDeSemana);
        const classes = `horario-btn ${status.classe}`;
        const disabled = status.disponivel ? '' : 'disabled';
        const ariaLabel = `${horario} - ${status.texto}`;
        
        html += `
            <button type="button" 
                    class="${classes}"
                    data-horario="${horario}"
                    ${disabled}
                    aria-label="${ariaLabel}"
                    onclick="selecionarHorario('${horario}', this)">
                ${horario}
            </button>
        `;
        
        if (status.disponivel) horariosDisponiveisCount++;
    });
    
    // Adicionar horário de almoço (sempre indisponível)
    html += `
        <button type="button" 
                class="horario-btn almoço"
                disabled
                aria-label="Horário de almoço - Indisponível">
            12:00-14:00
        </button>
    `;
    
    // Verificar se não há horários disponíveis
    if (horariosDisponiveisCount === 0) {
        const mensagem = ehFinalDeSemana 
            ? 'Não há atendimento aos finais de semana'
            : 'Não há horários disponíveis para esta data';
            
        html = `
            <div class="no-horarios">
                <i class="fas fa-calendar-times"></i>
                ${mensagem}
                <p style="font-size: 0.9rem; margin-top: 10px; color: #666;">
                    Selecione outra data ou entre em contato: (11) 99999-9999
                </p>
            </div>
        `;
    }
    
    container.innerHTML = html;
    console.log(`⏰ ${horariosDisponiveisCount} horários disponíveis gerados`);
}

function verificarStatusHorario(dataHora, horario, ehFinalDeSemana) {
    const hoje = new Date();
    const [hora] = horario.split(':').map(Number);
    
    // Verificar se é passado
    if (dataHora < hoje) {
        return {
            classe: 'indisponivel passado',
            texto: 'Horário já passado',
            disponivel: false
        };
    }
    
    // Verificar se é final de semana
    if (ehFinalDeSemana) {
        return {
            classe: 'indisponivel',
            texto: 'Atendimento apenas de Segunda a Sexta',
            disponivel: false
        };
    }
    
    // Verificar se está dentro do horário comercial (9h-18h)
    if (hora < 9 || hora >= 18) {
        return {
            classe: 'indisponivel',
            texto: 'Fora do horário comercial',
            disponivel: false
        };
    }
    
    // Verificar se é horário de almoço (12h-14h sempre indisponível)
    if (hora >= 12 && hora < 14) {
        return {
            classe: 'almoço',
            texto: 'Horário de almoço',
            disponivel: false
        };
    }
    
    // Se passou por todas as verificações, está disponível
    return {
        classe: 'disponivel',
        texto: 'Horário disponível',
        disponivel: true
    };
}

// ============================================
// 5. FORMULÁRIO DE AGENDAMENTO
// ============================================
function handleAgendamentoSubmit(e) {
    e.preventDefault();
    console.log('📋 Enviando formulário de agendamento...');
    
    const form = e.target;
    const submitBtn = form.querySelector('#btn-agendar');
    
    // Coletar dados do formulário
    const agendamentoData = {
        nome: document.getElementById('nome').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        email: document.getElementById('email').value.trim(),
        data: dataSelecionada,
        horario: horarioSelecionado,
        tipoConsulta: document.getElementById('tipo-consulta').value,
        whatsapp: document.getElementById('whatsapp').value,
        mensagem: document.getElementById('mensagem').value.trim(),
        action: 'agendarConsulta'
    };
    
    // Validação
    if (!validarFormularioAgendamento(agendamentoData)) {
        return;
    }
    
    // Desabilitar botão durante envio
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando Agendamento...';
    }
    
    // Simular envio (em produção, enviar para Google Script)
    setTimeout(function() {
        // Mostrar mensagem de sucesso
        mostrarMensagemSucesso(agendamentoData);
        
        // Reabilitar botão
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Confirmar Agendamento';
        }
        
        console.log('✅ Agendamento simulado com sucesso:', agendamentoData);
    }, 2000);
}

function validarFormularioAgendamento(data) {
    // Validar nome
    if (!data.nome || data.nome.length < 3) {
        alert('Por favor, insira um nome completo válido (mínimo 3 caracteres)');
        return false;
    }
    
    // Validar telefone
    const telefoneNumeros = data.telefone.replace(/\D/g, '');
    if (!telefoneNumeros || telefoneNumeros.length < 10) {
        alert('Por favor, insira um telefone válido com DDD');
        return false;
    }
    
    // Validar email
    if (!data.email || !validateEmail(data.email)) {
        alert('Por favor, insira um e-mail válido');
        return false;
    }
    
    // Validar tipo de consulta
    if (!data.tipoConsulta) {
        alert('Por favor, selecione o tipo de consulta');
        return false;
    }
    
    // Validar horário selecionado
    if (!data.horario) {
        alert('Por favor, selecione um horário disponível');
        return false;
    }
    
    // Validar termos
    const lgpd = document.getElementById('lgpd');
    const confirmacao = document.getElementById('confirmacao');
    
    if (!lgpd || !lgpd.checked) {
        alert('Por favor, aceite a política de privacidade');
        return false;
    }
    
    if (!confirmacao || !confirmacao.checked) {
        alert('Por favor, confirme que entendeu que o horário será reservado');
        return false;
    }
    
    return true;
}

function mostrarMensagemSucesso(data) {
    const form = document.getElementById('agendamentoForm');
    const successDiv = document.getElementById('successMessage');
    const successDetails = document.getElementById('successDetails');
    
    if (!form || !successDiv || !successDetails) {
        console.error('❌ Elementos de sucesso não encontrados');
        return;
    }
    
    // Formatar data para exibição
    const dataFormatada = formatarDataParaExibicao(data.data);
    
    // Atualizar mensagem de sucesso
    successDetails.innerHTML = `
        <strong>Consulta agendada com sucesso!</strong><br><br>
        📅 <strong>Data:</strong> ${dataFormatada}<br>
        ⏰ <strong>Horário:</strong> ${data.horario}<br>
        👤 <strong>Paciente:</strong> ${data.nome}<br>
        📞 <strong>Contato:</strong> ${data.telefone}<br>
        📧 <strong>E-mail:</strong> ${data.email}
    `;
    
    // Mostrar div de sucesso e esconder formulário
    form.style.display = 'none';
    successDiv.style.display = 'block';
    
    // Adicionar funcionalidade para imprimir
    const btnImprimir = successDiv.querySelector('.btn-secondary');
    if (btnImprimir) {
        btnImprimir.onclick = function() {
            imprimirComprovante(data);
        };
    }
    
    console.log('✅ Mensagem de sucesso exibida');
}

function formatarDataParaExibicao(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function imprimirComprovante(data) {
    const dataFormatada = formatarDataParaExibicao(data.data);
    const conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprovante de Agendamento - DermaCare</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #0a3d62; }
                .title { color: #0ABAB5; margin: 20px 0; }
                .details { border: 2px solid #0ABAB5; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .detail-row { margin: 10px 0; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">DermaCare Clínica Dermatológica</div>
                <h1 class="title">COMPROVANTE DE AGENDAMENTO</h1>
            </div>
            <div class="details">
                <div class="detail-row"><strong>Paciente:</strong> ${data.nome}</div>
                <div class="detail-row"><strong>Telefone:</strong> ${data.telefone}</div>
                <div class="detail-row"><strong>E-mail:</strong> ${data.email}</div>
                <div class="detail-row"><strong>Data da Consulta:</strong> ${dataFormatada}</div>
                <div class="detail-row"><strong>Horário:</strong> ${data.horario}</div>
                <div class="detail-row"><strong>Tipo de Consulta:</strong> ${data.tipoConsulta}</div>
                <div class="detail-row"><strong>Observações:</strong> ${data.mensagem || 'Nenhuma'}</div>
            </div>
            <div class="footer">
                <p>DermaCare • Av. Paulista, 1000 - São Paulo • (11) 99999-9999</p>
                <p>Comprovante gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                <button class="no-print" onclick="window.close()">Fechar</button>
            </div>
        </body>
        </html>
    `;
    
    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    
    // Aguardar carregamento e imprimir
    setTimeout(function() {
        janela.print();
    }, 500);
}

// ============================================
// 6. CARROSSEL DE DEPOIMENTOS
// ============================================
function initCarrosselDepoimentos() {
    const prevBtn = document.querySelector('.carrossel-btn.prev');
    const nextBtn = document.querySelector('.carrossel-btn.next');
    const indicadores = document.querySelectorAll('.indicador');
    
    if (!prevBtn || !nextBtn) {
        console.warn('⚠️ Botões do carrossel não encontrados');
        return;
    }
    
    prevBtn.addEventListener('click', showPreviousDepoimento);
    nextBtn.addEventListener('click', showNextDepoimento);
    
    indicadores.forEach(function(indicador, index) {
        indicador.addEventListener('click', function() {
            showDepoimento(index);
        });
    });
    
    // Iniciar rotação automática
    startCarrosselAutoRotation();
    
    // Pausar ao passar o mouse
    const container = document.querySelector('.depoimentos-container');
    if (container) {
        container.addEventListener('mouseenter', stopCarrosselAutoRotation);
        container.addEventListener('mouseleave', startCarrosselAutoRotation);
    }
    
    console.log('✅ Carrossel de depoimentos configurado');
}

function showPreviousDepoimento() {
    currentDepoimento = (currentDepoimento - 1 + CONFIG.totalDepoimentos) % CONFIG.totalDepoimentos;
    updateCarrossel();
}

function showNextDepoimento() {
    currentDepoimento = (currentDepoimento + 1) % CONFIG.totalDepoimentos;
    updateCarrossel();
}

function showDepoimento(index) {
    if (index >= 0 && index < CONFIG.totalDepoimentos) {
        currentDepoimento = index;
        updateCarrossel();
    }
}

function updateCarrossel() {
    const depoimentos = document.querySelectorAll('.depoimento-card');
    const indicadores = document.querySelectorAll('.indicador');
    
    depoimentos.forEach(function(depoimento, index) {
        depoimento.classList.toggle('active', index === currentDepoimento);
    });
    
    indicadores.forEach(function(indicador, index) {
        indicador.classList.toggle('active', index === currentDepoimento);
    });
}

function startCarrosselAutoRotation() {
    stopCarrosselAutoRotation();
    carrosselInterval = setInterval(showNextDepoimento, CONFIG.carrosselInterval);
}

function stopCarrosselAutoRotation() {
    if (carrosselInterval) {
        clearInterval(carrosselInterval);
        carrosselInterval = null;
    }
}

// ============================================
// 7. FORMULÁRIOS GERAIS
// ============================================
function initFormularios() {
    // Formulário de contato
    const contatoForm = document.getElementById('contatoForm');
    if (contatoForm) {
        contatoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            this.reset();
        });
    }
    
    // Newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && validateEmail(emailInput.value)) {
                alert('Obrigado por se inscrever em nossa newsletter!');
                emailInput.value = '';
            } else {
                alert('Por favor, insira um e-mail válido.');
            }
        });
    }
    
    console.log('✅ Formulários gerais configurados');
}

// ============================================
// 8. SCROLL SUAVE
// ============================================
function initScrollSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#inicio') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile se estiver aberto
                const navList = document.querySelector('.nav-list');
                const menuToggle = document.querySelector('.menu-toggle');
                if (navList && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });
    
    console.log('✅ Scroll suave configurado');
}

// ============================================
// 9. BOTÃO DE LIGAR (MOBILE)
// ============================================
function createCallButton() {
    // Verificar se já existe
    if (document.querySelector('.ligar-btn')) return;
    
    const ligarBtn = document.createElement('a');
    ligarBtn.href = `tel:${CONFIG.clinicInfo.phone.replace(/\D/g, '')}`;
    ligarBtn.className = 'ligar-btn';
    ligarBtn.innerHTML = '<i class="fas fa-phone"></i>';
    ligarBtn.setAttribute('aria-label', 'Ligar para clínica');
    
    // Estilos
    ligarBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        width: 60px;
        height: 60px;
        background-color: #25D366;
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
        text-decoration: none;
        box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
        z-index: 999;
        transition: all 0.3s;
    `;
    
    // Efeitos hover
    ligarBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.backgroundColor = '#128C7E';
    });
    
    ligarBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = '#25D366';
    });
    
    document.body.appendChild(ligarBtn);
    console.log('✅ Botão de ligar para mobile criado');
}

// ============================================
// 10. FUNÇÕES UTILITÁRIAS
// ============================================
function formatarTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }
    
    e.target.value = value;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// 11. FUNÇÕES EXPORTADAS PARA HTML
// ============================================
// Estas funções são chamadas diretamente do HTML
window.selecionarHorario = function(horario, elemento) {
    // Desselecionar todos
    document.querySelectorAll('.horario-btn').forEach(function(btn) {
        btn.classList.remove('selecionado');
    });
    
    // Selecionar este
    elemento.classList.add('selecionado');
    horarioSelecionado = horario;
    
    // Atualizar campo oculto
    const campoHorario = document.getElementById('horario-escolhido');
    if (campoHorario) {
        campoHorario.value = horario;
    }
    
    console.log('⏰ Horário selecionado:', horario);
};

window.closeModal = closeModal;
window.openModal = openModal;
window.toggleChatbot = toggleChatbot;
window.closeChatbotHandler = closeChatbotHandler;

// ============================================
// INICIALIZAÇÃO FINAL
// ============================================
console.log('🎉 Sistema DermaCare carregado com sucesso!');
console.log('📞 Telefone:', CONFIG.clinicInfo.phone);
console.log('⏰ Horários fixos:', CONFIG.horariosFixos.join(', '));
console.log('🚀 Pronto para uso!');

// ============================================
// 10. TESTE DE PELE RESPONSÁVEL - 3 PERGUNTAS
// ============================================
function initTestePeleResponsavel() {
    console.log('🔧 Inicializando teste de pele responsável...');
    
    // Estado do teste
    let respostas = {
        tipoPele: null,
        acne: null,
        reacaoSol: null
    };
    
    let perguntaAtual = 1;
    const totalPerguntas = 3;
    
    // Elementos
    const btnContinuar = document.getElementById('btnContinuarTeste');
    const btnVoltar = document.getElementById('btnVoltarTeste');
    const btnAgendar = document.getElementById('btnAgendarConsulta');
    const btnRefazer = document.getElementById('btnRefazerTeste');
    const opcoesBtns = document.querySelectorAll('.opcao-btn');
    const progressoBar = document.getElementById('progressoBar');
    const progressoTexto = document.getElementById('progressoTexto');
    
    if (!btnContinuar || opcoesBtns.length === 0) {
        console.error('❌ Elementos do teste não encontrados');
        return;
    }
    
    console.log('✅ Teste de pele responsável inicializado');
    
    // 1. Atualizar progresso
    function atualizarProgresso() {
        const progresso = ((perguntaAtual - 1) / totalPerguntas) * 100;
        progressoBar.style.width = `${progresso}%`;
        progressoTexto.textContent = `${Math.round(progresso)}%`;
    }
    
    // 2. Configurar seleção de opções
    opcoesBtns.forEach(botao => {
        botao.addEventListener('click', function() {
            // Remover seleção anterior da mesma pergunta
            const perguntaNum = this.getAttribute('data-pergunta');
            document.querySelectorAll(`.opcao-btn[data-pergunta="${perguntaNum}"]`).forEach(op => {
                op.classList.remove('selecionada');
            });
            
            // Selecionar esta opção
            this.classList.add('selecionada');
            
            // Salvar resposta
            const resposta = this.getAttribute('data-resposta');
            switch(perguntaNum) {
                case '1':
                    respostas.tipoPele = resposta;
                    console.log('🎯 Tipo de pele:', resposta);
                    break;
                case '2':
                    respostas.acne = resposta;
                    console.log('🎯 Frequência de acne:', resposta);
                    break;
                case '3':
                    respostas.reacaoSol = resposta;
                    console.log('🎯 Reação ao sol:', resposta);
                    break;
            }
            
            // Habilitar botão Continuar
            btnContinuar.disabled = false;
            btnContinuar.style.opacity = '1';
            btnContinuar.style.cursor = 'pointer';
        });
    });
    
    // 3. Configurar botão Continuar
    btnContinuar.addEventListener('click', function() {
        // Validar se selecionou algo na pergunta atual
        const perguntaAtualElement = document.querySelector(`.pergunta[data-pergunta="${perguntaAtual}"]`);
        const selecionada = perguntaAtualElement.querySelector('.opcao-btn.selecionada');
        
        if (!selecionada) {
            alert('Por favor, selecione uma opção para continuar.');
            return;
        }
        
        if (perguntaAtual < totalPerguntas) {
            // Ir para próxima pergunta
            document.querySelector(`.pergunta[data-pergunta="${perguntaAtual}"]`).classList.remove('ativa');
            perguntaAtual++;
            document.querySelector(`.pergunta[data-pergunta="${perguntaAtual}"]`).classList.add('ativa');
            
            // Atualizar progresso
            atualizarProgresso();
            
            // Resetar botão Continuar
            btnContinuar.disabled = true;
            btnContinuar.style.opacity = '0.5';
            
            // Mostrar botão Voltar
            btnVoltar.style.display = 'flex';
            
            console.log(`➡️ Indo para pergunta ${perguntaAtual}`);
        } else {
            // Mostrar resultado
            mostrarResultado();
            console.log('📊 Mostrando resultado final');
        }
    });
    
    // 4. Configurar botão Voltar
    btnVoltar.addEventListener('click', function() {
        if (perguntaAtual > 1) {
            // Voltar para pergunta anterior
            document.querySelector(`.pergunta[data-pergunta="${perguntaAtual}"]`).classList.remove('ativa');
            perguntaAtual--;
            document.querySelector(`.pergunta[data-pergunta="${perguntaAtual}"]`).classList.add('ativa');
            
            // Atualizar progresso
            atualizarProgresso();
            
            // Habilitar botão Continuar (já tem resposta)
            const perguntaElement = document.querySelector(`.pergunta[data-pergunta="${perguntaAtual}"]`);
            const temSelecao = perguntaElement.querySelector('.opcao-btn.selecionada');
            btnContinuar.disabled = !temSelecao;
            btnContinuar.style.opacity = temSelecao ? '1' : '0.5';
            
            // Esconder botão Voltar se estiver na primeira
            if (perguntaAtual === 1) {
                this.style.display = 'none';
            }
            
            console.log(`⬅️ Voltando para pergunta ${perguntaAtual}`);
        }
    });
    
    // 5. Configurar botão Agendar Consulta
    btnAgendar.addEventListener('click', function() {
        console.log('🎯 Agendar consulta do resultado');
        closeChatbotHandler();
        setTimeout(() => openModal('agendamentoModal'), 300);
    });
    
    // 6. Configurar botão Refazer
    btnRefazer.addEventListener('click', reiniciarTeste);
    
    // 7. Função para mostrar resultado
    function mostrarResultado() {
        // Esconder perguntas e navegação
        document.querySelector('.pergunta.ativa').classList.remove('ativa');
        document.querySelector('.navegacao-teste').style.display = 'none';
        
        // Determinar tipo de pele principal
        const resultado = determinarResultado(respostas);
        
        // Atualizar resultado
        document.getElementById('tipoTitulo').textContent = resultado.titulo;
        document.getElementById('tipoDescricao').textContent = resultado.descricao;
        
        // Atualizar orientações
        const listaOrientacoes = document.getElementById('orientacoesLista');
        listaOrientacoes.innerHTML = '';
        resultado.orientacoes.forEach(orientacao => {
            const li = document.createElement('li');
            li.textContent = orientacao;
            listaOrientacoes.appendChild(li);
        });
        
        // Mostrar resultado
        document.getElementById('resultadoContainer').style.display = 'block';
        
        // Rolar para resultado
        document.getElementById('resultadoContainer').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // 8. Função para determinar resultado (baseado em dermatologia real)
    function determinarResultado(dados) {
        // Dados médicos baseados em dermatologia
        const tipos = {
            'oleosa': {
                titulo: 'Pele Oleosa',
                descricao: 'Sua pele produz mais sebo que o normal, o que pode levar a poros dilatados, brilho excessivo e maior tendência à acne.',
                orientacoes: [
                    'Lave o rosto 2x ao dia com sabonete específico para pele oleosa',
                    'Use produtos oil-free e não comedogênicos',
                    'Aplique protetor solar em gel ou sérum diariamente',
                    'Evite tocar o rosto com as mãos sujas',
                    'Faça limpeza de pele profissional regularmente'
                ]
            },
            'seca': {
                titulo: 'Pele Seca',
                descricao: 'Sua pele produz menos sebo que o necessário, podendo causar sensação de repuxamento, descamação, coceira e maior sensibilidade.',
                orientacoes: [
                    'Use hidratantes ricos em ceramidas, ácido hialurônico e glicerina',
                    'Evite água muito quente no banho (prefira morna)',
                    'Aplique hidratante logo após o banho, com a pele ainda úmida',
                    'Use protetor solar com textura cremosa ou loção',
                    'Considere usar um umidificador no ambiente'
                ]
            },
            'mista': {
                titulo: 'Pele Mista',
                descricao: 'Sua pele é oleosa na "zona T" (testa, nariz e queixo) e normal/seca nas bochechas. É o tipo mais comum na população.',
                orientacoes: [
                    'Use produtos específicos para pele mista',
                    'Aplique hidratante mais leve na zona T e mais rico nas bochechas',
                    'Faça limpezas localizadas na zona oleosa quando necessário',
                    'Use protetor solar oil-free ou sérum',
                    'Máscaras diferentes podem ser usadas em áreas diferentes'
                ]
            },
            'normal': {
                titulo: 'Pele Normal',
                descricao: 'Sua pele tem um equilíbrio adequado de hidratação e oleosidade, sem grandes problemas ou sensibilidades.',
                orientacoes: [
                    'Mantenha rotina básica de limpeza, hidratação e proteção solar',
                    'Faça limpeza de pele preventiva a cada 3 meses',
                    'Use antioxidantes como vitamina C para prevenção do envelhecimento',
                    'Não descuide do protetor solar diário (mesmo em dias nublados)',
                    'Beba bastante água e mantenha alimentação equilibrada'
                ]
            },
            'sensivel': {
                titulo: 'Pele Sensível',
                descricao: 'Sua pele reage facilmente a produtos, mudanças de temperatura e fatores ambientais, com vermelhidão, coceira ou irritação.',
                orientacoes: [
                    'Use produtos hipoalergênicos, sem fragrância e sem álcool',
                    'Faça teste de contato antes de usar novos produtos',
                    'Evite esfoliantes físicos agressivos (prefira químicos suaves)',
                    'Use protetor solar mineral (óxido de zinco ou dióxido de titânio)',
                    'Consulte dermatologista antes de iniciar qualquer tratamento'
                ]
            }
        };
        
        // Determinar tipo principal
        const tipoPrincipal = dados.tipoPele in tipos ? dados.tipoPele : 'normal';
        const resultado = tipos[tipoPrincipal];
        
        // Adicionar orientações específicas baseadas nas outras respostas
        if (dados.acne === 'frequente') {
            resultado.orientacoes.push('Evite alimentos muito gordurosos e com alto índice glicêmico');
            resultado.orientacoes.push('Não esprema as espinhas para evitar cicatrizes');
        }
        
        if (dados.reacaoSol === 'queima') {
            resultado.orientacoes.push('Use protetor solar FPS 50+ e reaplique a cada 2 horas');
            resultado.orientacoes.push('Use chapéu e óculos escuros com proteção UV');
        }
        
        return resultado;
    }
    
    // 9. Função para reiniciar teste
    function reiniciarTeste() {
        // Resetar variáveis
        respostas = { tipoPele: null, acne: null, reacaoSol: null };
        perguntaAtual = 1;
        
        // Resetar seleções visuais
        opcoesBtns.forEach(botao => {
            botao.classList.remove('selecionada');
        });
        
        // Mostrar pergunta 1
        document.querySelectorAll('.pergunta').forEach(p => p.classList.remove('ativa'));
        document.querySelector('.pergunta[data-pergunta="1"]').classList.add('ativa');
        document.getElementById('resultadoContainer').style.display = 'none';
        document.querySelector('.navegacao-teste').style.display = 'flex';
        
        // Resetar botões
        btnContinuar.disabled = true;
        btnContinuar.style.opacity = '0.5';
        btnVoltar.style.display = 'none';
        
        // Resetar progresso
        atualizarProgresso();
        
        // Rolar para o topo do teste
        document.querySelector('.teste-pele-responsavel').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        console.log('🔄 Teste reiniciado');
    }
    
    // Inicializar estado
    atualizarProgresso();
    btnContinuar.disabled = true;
    btnContinuar.style.opacity = '0.5';
    btnVoltar.style.display = 'none';
    
    console.log('✅ Teste de pele responsável configurado com sucesso!');
}

// ============================================
// ATUALIZAR INICIALIZAÇÃO
// ============================================
// Atualize sua função DOMContentLoaded para incluir o teste:
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DermaCare - Inicializando sistema...');
    
    try {
        initMenuMobile();
        initModalAgendamento();
        initChatbot();
        initCarrosselDepoimentos();
        initFormularios();
        initScrollSuave();
        initSistemaHorarios();
        initTestePeleResponsavel(); // ← ADICIONAR ESTA LINHA
        
        // Abrir chatbot automático após delay
        setTimeout(function() {
            const chatbot = document.querySelector('.chatbot-container');
            if (chatbot && !chatbotOpen) {
                chatbot.classList.add('active');
                chatbotOpen = true;
                console.log('🤖 Chatbot aberto automaticamente');
            }
        }, CONFIG.autoChatbotDelay);
        
        // Botão de ligar para mobile
        if (window.innerWidth <= 768) {
            createCallButton();
        }
        
        console.log('✅ Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
});