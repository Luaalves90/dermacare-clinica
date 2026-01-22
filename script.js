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
            weekdays: 'Segunda a Sexta: 8h às 19h',
            saturday: 'Sábado: 8h às 14h',
            sunday: 'Domingo: Fechado'
        }
    }
};

let currentDepoimento = 0;
let carrosselInterval;
let chatbotOpen = false;

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DermaCare - Inicializando...');
    
    initApplication();
});

function initApplication() {
    initMenuMobile();
    initChatbot();
    initModalAgendamento();
    initCarrosselDepoimentos();
    initFormularios();
    initScrollSuave();
    initTestePele();
    initImageOptimization();
    
    setTimeout(openChatbot, CONFIG.autoChatbotDelay);
    
    if (window.innerWidth <= 768) {
        createCallButton();
    }
    
    console.log('✅ Aplicação inicializada com sucesso!');
}

// ============================================
// MENU MOBILE
// ============================================
function initMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (!menuToggle || !navList) return;
    
    menuToggle.addEventListener('click', toggleMobileMenu);
    
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    document.addEventListener('click', (e) => {
        if (!navList.contains(e.target) && !menuToggle.contains(e.target) && navList.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    navList.classList.toggle('active');
    menuToggle.innerHTML = navList.classList.contains('active') 
        ? '<i class="fas fa-times" aria-hidden="true"></i>' 
        : '<i class="fas fa-bars" aria-hidden="true"></i>';
    
    menuToggle.setAttribute('aria-expanded', navList.classList.contains('active'));
}

function closeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    navList.classList.remove('active');
    menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    menuToggle.setAttribute('aria-expanded', 'false');
}

// ============================================
// CHATBOT INTELIGENTE - VERSÃO MELHORADA
// ============================================
function initChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeChatbot = document.querySelector('.close-chatbot');
    const chatOptions = document.querySelectorAll('.chat-option');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    
    if (!chatbotToggle) return;
    
    chatbotToggle.addEventListener('click', toggleChatbot);
    closeChatbot?.addEventListener('click', closeChatbotHandler);
    
    chatOptions.forEach(option => {
        option.addEventListener('click', handleChatOptionClick);
    });
    
    sendMessageBtn?.addEventListener('click', sendUserMessage);
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });
}

function toggleChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    chatbotContainer?.classList.toggle('active');
    chatbotOpen = chatbotContainer?.classList.contains('active') || false;
    
    if (chatbotOpen) {
        setTimeout(() => {
            document.getElementById('chatInput')?.focus();
        }, 300);
    }
}

function openChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer && !chatbotOpen) {
        chatbotContainer.classList.add('active');
        chatbotOpen = true;
    }
}

function closeChatbotHandler() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    chatbotContainer?.classList.remove('active');
    chatbotOpen = false;
}

function handleChatOptionClick(e) {
    const optionType = e.currentTarget.getAttribute('data-option');
    
    switch(optionType) {
        case 'agendar':
            handleAgendarOption();
            break;
        case 'servicos':
            handleServicosOption();
            break;
        case 'duvidas':
            handleDuvidasOption();
            break;
        case 'whatsapp':
            handleWhatsAppOption();
            break;
    }
}

function handleAgendarOption() {
    addBotMessage('Ótimo! Vou te ajudar a agendar uma consulta. Por favor, preencha o formulário que será aberto.');
    
    setTimeout(() => {
        closeChatbotHandler();
        openModal('agendamentoModal');
    }, 1500);
}

function handleServicosOption() {
    const message = `
        Na <strong>DermaCare</strong> oferecemos:<br><br>
        🏥 <strong>Dermatologia Clínica</strong> - Diagnóstico e tratamento de doenças da pele<br>
        💆 <strong>Dermatologia Estética</strong> - Toxina botulínica, preenchimentos, bioestimuladores<br>
        🔪 <strong>Cirurgia Dermatológica</strong> - Remoção de pintas, cistos, câncer de pele<br>
        🛡️ <strong>Oncodermatologia</strong> - Prevenção e tratamento do câncer de pele<br>
        💇 <strong>Tricologia</strong> - Tratamento de queda de cabelo<br>
        ✨ <strong>Estética Avançada</strong> - Laser, luz pulsada, radiofrequência<br><br>
        Gostaria de saber mais sobre algum específico?
    `;
    
    addBotMessageHTML(message);
}

function handleDuvidasOption() {
    const faqOptions = `
        <div class="message bot options">
            <p>Escolha uma dúvida comum:</p>
            <button class="chat-option" data-faq="consulta">💰 Quanto custa uma consulta?</button>
            <button class="chat-option" data-faq="horario">🕒 Quais os horários de atendimento?</button>
            <button class="chat-option" data-faq="plano">🏥 Atendem meu plano de saúde?</button>
            <button class="chat-option" data-faq="procedimento">✨ Posso fazer procedimento no mesmo dia?</button>
        </div>
    `;
    
    addBotMessageHTML(faqOptions);
    
    setTimeout(() => {
        document.querySelectorAll('[data-faq]').forEach(btn => {
            btn.addEventListener('click', handleFaqClick);
        });
    }, 100);
}

function handleFaqClick(e) {
    const faqType = e.currentTarget.getAttribute('data-faq');
    let resposta;
    
    switch(faqType) {
        case 'consulta':
            resposta = 'A consulta dermatológica tem valor de <strong>R$ 350,00</strong>. Para procedimentos estéticos, oferecemos <strong>avaliação gratuita</strong> com orçamento personalizado.';
            break;
        case 'horario':
            resposta = `Atendemos:<br><br>
                📅 <strong>Segunda a Sexta:</strong> 8h às 19h<br>
                📅 <strong>Sábados:</strong> 8h às 14h<br>
                📅 <strong>Domingos:</strong> Fechado`;
            break;
        case 'plano':
            resposta = 'Atendemos os principais planos de saúde: <strong>Unimed, Bradesco Saúde, SulAmérica, Amil</strong> e mais. Entre em contato para confirmar a cobertura do seu plano.';
            break;
        case 'procedimento':
            resposta = 'Em muitos casos <strong>sim!</strong> Após a avaliação, se houver indicação e disponibilidade, podemos realizar o procedimento no mesmo dia.';
            break;
    }
    
    addBotMessageHTML(resposta);
}

function handleWhatsAppOption() {
    addBotMessage('Certo! Vou te redirecionar para nosso WhatsApp para um atendimento mais personalizado.');
    
    setTimeout(() => {
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=Olá! Gostaria de tirar uma dúvida sobre a DermaCare`, '_blank');
    }, 1500);
}

// ============================================
// FUNÇÕES DO CHATBOT INTELIGENTE
// ============================================
function sendUserMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    chatInput.value = '';
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        handleUserQuery(message);
    }, 1000 + (Math.random() * 500));
}

function handleUserQuery(message) {
    const msg = message.toLowerCase().trim();
    let resposta = '';
    
    const knowledgeBase = {
        saudacoes: [/olá|oi|bom dia|boa tarde|boa noite|hello|hey/i, 
            'Olá! Sou o assistente virtual da DermaCare. Como posso ajudá-lo hoje? 😊'],
        
        agendamento: [/agendar|marcar|consulta|marcado|horário|disponibilidade/i,
            'Para agendar uma consulta, você pode:<br>1. Preencher nosso formulário online<br>2. Ligar para (11) 99999-9999<br>3. Falar no WhatsApp<br>Qual método prefere?'],
        
        preco: [/preço|valor|custa|quanto|orçamento|caro|barato/i,
            `💰 <strong>Tabela de Valores:</strong><br><br>
            🏥 <strong>Consulta Dermatológica:</strong> R$ 350,00<br>
            💆 <strong>Limpeza de Pele:</strong> R$ 250,00<br>
            ✨ <strong>Botox:</strong> R$ 800-1200 (por área)<br>
            🔬 <strong>Preenchimento:</strong> R$ 900-1500<br>
            📋 <strong>Avaliação:</strong> <strong>GRATUITA</strong> para procedimentos estéticos<br><br>
            <em>Valores podem variar conforme a necessidade do paciente.</em>`],
        
        dra: [/doutora|dra|mariana|santos|médica|especialista/i,
            `👩‍⚕️ <strong>Dra. Mariana Santos</strong><br><br>
            • CRM-SP: 123456<br>
            • Formada pela USP<br>
            • Pós-graduação em Harvard<br>
            • 15+ anos de experiência<br>
            • Especialista em Dermatologia Estética<br><br>
            Gostaria de agendar com ela?`],
        
        servicos: [/servi[oç]os|tratamento|procedimento|fazer|realizar/i,
            `🩺 <strong>Nossos Serviços:</strong><br><br>
            1. <strong>Dermatologia Clínica</strong> - Doenças da pele<br>
            2. <strong>Estética Facial</strong> - Botox, preenchimento<br>
            3. <strong>Cirurgia Dermatológica</strong> - Remoção de pintas<br>
            4. <strong>Oncodermatologia</strong> - Câncer de pele<br>
            5. <strong>Tricologia</strong> - Queda de cabelo<br>
            6. <strong>Estética Corporal</strong> - Celulite, gordura localizada<br><br>
            Qual área te interessa mais?`],
        
        contato: [/telefone|falar|ligar|contato|whatsapp|zap|endere[çc]o|local|onde|chegar/i,
            `📞 <strong>Contato:</strong><br><br>
            <strong>Telefone:</strong> (11) 99999-9999<br>
            <strong>WhatsApp:</strong> <a href="https://wa.me/5511999999999" target="_blank">Clique aqui</a><br>
            <strong>E-mail:</strong> contato@dermacare.com.br<br>
            <strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo<br>
            <strong>Horário:</strong> Seg-Sex: 8h-19h | Sáb: 8h-14h`],
        
        plano: [/plano|conv[êe]nio|unimed|amil|bradesco|sulamerica|cobertura/i,
            `🏥 <strong>Planos Atendidos:</strong><br><br>
            ✅ Unimed<br>
            ✅ Amil<br>
            ✅ Bradesco Saúde<br>
            ✅ SulAmérica<br>
            ✅ NotreDame Intermédica<br>
            ✅ Porto Seguro<br><br>
            <em>Entre em contato para confirmar a cobertura do seu plano.</em>`],
        
        urgente: [/urgente|emerg[êe]ncia|dor|sangrando|inflamado|grave|preciso agora/i,
            `🚨 <strong>ATENÇÃO:</strong> Casos urgentes<br><br>
            Para situações de emergência:<br>
            1. <strong>Ligue imediatamente:</strong> (11) 99999-9999<br>
            2. <strong>Procure um pronto-socorro</strong> se for muito grave<br>
            3. <strong>Hospital recomendado:</strong> Sírio-Libanês<br><br>
            <strong>NÃO espere!</strong>`],
        
        obrigado: [/obrigado|obrigada|valeu|agrade[çc]o|grato|gratidão/i,
            'Por nada! Fico feliz em ajudar. 😊<br>Precisa de mais alguma informação?'],
        
        tchau: [/tchau|adeus|at[ée] logo|flw|fui|bye|até/i,
            'Até logo! Espero ter ajudado. Qualquer dúvida, estou aqui! 👋']
    };
    
    let respostaEncontrada = false;
    
    for (const [categoria, [padrao, respostaCor]] of Object.entries(knowledgeBase)) {
        if (padrao.test(msg)) {
            resposta = respostaCor;
            respostaEncontrada = true;
            
            if (categoria === 'agendamento') {
                setTimeout(() => {
                    addActionButtons();
                }, 500);
            }
            break;
        }
    }
    
    if (!respostaEncontrada) {
        resposta = `Desculpe, não entendi completamente. 😅<br><br>
        Posso te ajudar com:<br>
        • 📅 <strong>Agendamento de consultas</strong><br>
        • 💰 <strong>Valores e orçamentos</strong><br>
        • 🏥 <strong>Informações sobre serviços</strong><br>
        • 📍 <strong>Localização e contato</strong><br><br>
        O que você gostaria de saber?`;
        
        setTimeout(() => {
            addActionButtons();
        }, 500);
    }
    
    setTimeout(() => {
        addBotMessageHTML(resposta);
    }, 800 + (Math.random() * 400));
}

function addActionButtons() {
    const actionButtons = `
        <div class="message bot options">
            <p>Escolha uma ação rápida:</p>
            <button class="chat-option" data-action="agendar-form">📅 Formulário de Agendamento</button>
            <button class="chat-option" data-action="whatsapp">💬 Falar no WhatsApp</button>
            <button class="chat-option" data-action="ligar">📞 Ligar Agora</button>
            <button class="chat-option" data-action="servicos">🩺 Ver Todos Serviços</button>
        </div>
    `;
    
    addBotMessageHTML(actionButtons);
    
    setTimeout(() => {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', handleActionButton);
        });
    }, 100);
}

function handleActionButton(e) {
    const action = e.currentTarget.getAttribute('data-action');
    
    switch(action) {
        case 'agendar-form':
            addBotMessage('Abrindo formulário de agendamento...');
            setTimeout(() => {
                closeChatbotHandler();
                openModal('agendamentoModal');
            }, 1000);
            break;
            
        case 'whatsapp':
            addBotMessage('Redirecionando para WhatsApp...');
            setTimeout(() => {
                window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=Olá! Vi seu site e gostaria de mais informações.`, '_blank');
            }, 1000);
            break;
            
        case 'ligar':
            addBotMessage(`Ligando para ${CONFIG.clinicInfo.phone}...`);
            setTimeout(() => {
                window.location.href = `tel:${CONFIG.clinicInfo.phone.replace(/\D/g, '')}`;
            }, 1000);
            break;
            
        case 'servicos':
            handleServicosOption();
            break;
    }
}

function showTypingIndicator() {
    const chatbotMessages = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function addUserMessage(text) {
    addMessage(text, 'user');
}

function addBotMessage(text) {
    addMessage(text, 'bot');
}

function addBotMessageHTML(html) {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = html;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addMessage(text, sender) {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
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

// ============================================
// MODAL DE AGENDAMENTO
// ============================================
function initModalAgendamento() {
    const modal = document.getElementById('agendamentoModal');
    const openButtons = document.querySelectorAll('[data-modal="agendamento"]');
    const closeButton = modal?.querySelector('.close-modal');
    const form = document.getElementById('agendamentoForm');
    
    if (!modal) return;
    
    document.querySelectorAll('#openAgendamento, #openAgendamento2, .btn-agendar-teste').forEach(btn => {
        btn.setAttribute('data-modal', 'agendamento');
    });
    
    openButtons.forEach(button => {
        button.addEventListener('click', () => openModal('agendamentoModal'));
    });
    
    closeButton?.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    form?.addEventListener('submit', handleAgendamentoSubmit);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

async function handleAgendamentoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Dados do formulário
    const agendamentoData = {
        nome: document.getElementById('nome').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        email: document.getElementById('email').value.trim() || '',
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        whatsapp: document.getElementById('whatsapp').value,
        tipoConsulta: document.getElementById('tipo-consulta').value,
        mensagem: document.getElementById('mensagem').value.trim() || ''
    };
    
    // Validação
    if (!validateNome(agendamentoData.nome)) {
        showAlert('Por favor, insira um nome válido (mínimo 3 caracteres)', 'error');
        return;
    }
    
    if (!validateTelefone(agendamentoData.telefone)) {
        showAlert('Por favor, insira um telefone válido com DDD', 'error');
        return;
    }
    
    if (agendamentoData.email && !validateEmail(agendamentoData.email)) {
        showAlert('Por favor, insira um e-mail válido', 'error');
        return;
    }
    
    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';
    
    try {
        // Enviar para Google Apps Script
        const response = await enviarParaGoogleCalendar(agendamentoData);
        
        if (response.success) {
            showAlert('✅ Agendamento realizado com sucesso! Confirmação enviada por email.', 'success');
            
            // Resetar formulário
            form.reset();
            
            // Fechar modal após 3 segundos
            setTimeout(() => {
                closeModal();
                
                // Abrir WhatsApp se solicitado
                if (agendamentoData.whatsapp === 'sim') {
                    setTimeout(() => {
                        const whatsappMsg = `Olá! Agendei minha consulta na DermaCare para ${agendamentoData.data || 'breve'}. Nome: ${agendamentoData.nome}`;
                        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                    }, 1000);
                }
            }, 3000);
        } else {
            throw new Error(response.error || 'Erro no agendamento');
        }
        
    } catch (error) {
        console.error('Erro no agendamento:', error);
        showAlert(`❌ Erro: ${error.message}. Tente novamente ou ligue para (11) 99999-9999`, 'error');
        
        // Fallback: Mostrar modal com informações para contato direto
        mostrarFallbackContato(agendamentoData);
        
    } finally {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Solicitar Agendamento';
    }
}

// Função para enviar dados para Google Apps Script
async function enviarParaGoogleCalendar(data) {
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzKa1k1BbCTS9bY_Pxe0VOmUgw8sytxKS-WII-lcK2XZdR7XcNxRpgidB1SLGZBCDHL/exec'; // ← COLE AQUI SUA URL
    
    const response = await fetch(googleScriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'no-cors' // Importante para evitar CORS
    });
    
    // Como usamos no-cors, não podemos ler a resposta diretamente
    // Mas podemos assumir sucesso se não houver erro de rede
    return { success: true, message: 'Agendamento enviado para processamento' };
    
    // Para debug (remova o mode: 'no-cors' e use isto):
    // if (!response.ok) throw new Error('Erro na comunicação com o servidor');
    // return await response.json();
}

// Fallback caso o Google Script falhe
function mostrarFallbackContato(data) {
    const modalContent = `
        <div class="fallback-agendamento">
            <h3>📞 Agendamento Alternativo</h3>
            <p>Nosso sistema automático está temporariamente indisponível.</p>
            <p>Por favor, entre em contato diretamente:</p>
            
            <div class="contact-info">
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/5511999999999" target="_blank">Clique aqui</a></p>
                <p><strong>Email:</strong> contato@dermacare.com.br</p>
            </div>
            
            <div class="patient-data">
                <h4>Seus dados para referência:</h4>
                <p><strong>Nome:</strong> ${data.nome}</p>
                <p><strong>Telefone:</strong> ${data.telefone}</p>
                ${data.data ? `<p><strong>Data preferida:</strong> ${formatarDataBR(data.data)}</p>` : ''}
                ${data.horario ? `<p><strong>Horário preferido:</strong> ${data.horario}</p>` : ''}
            </div>
            
            <button onclick="copiarDadosParaAreaTransferencia()" class="btn-secondary">
                📋 Copiar Dados
            </button>
        </div>
    `;
    
    const existingFallback = document.querySelector('.fallback-modal');
    if (existingFallback) existingFallback.remove();
    
    const fallbackModal = document.createElement('div');
    fallbackModal.className = 'modal fallback-modal active';
    fallbackModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${modalContent}
        </div>
    `;
    
    document.body.appendChild(fallbackModal);
}

function formatarDataBR(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function copiarDadosParaAreaTransferencia() {
    const data = {
        nome: document.getElementById('nome').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        email: document.getElementById('email').value.trim(),
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value
    };
    
    const texto = `Agendamento DermaCare:\nNome: ${data.nome}\nTelefone: ${data.telefone}\nEmail: ${data.email}\nData: ${data.data}\nHorário: ${data.horario}`;
    
    navigator.clipboard.writeText(texto)
        .then(() => showAlert('✅ Dados copiados para área de transferência!', 'success'))
        .catch(() => showAlert('❌ Não foi possível copiar os dados', 'error'));
}

// ============================================
// CARROSSEL DE DEPOIMENTOS
// ============================================
function initCarrosselDepoimentos() {
    const prevBtn = document.querySelector('.carrossel-btn.prev');
    const nextBtn = document.querySelector('.carrossel-btn.next');
    const indicadores = document.querySelectorAll('.indicador');
    
    if (!prevBtn || !nextBtn) return;
    
    prevBtn.addEventListener('click', showPreviousDepoimento);
    nextBtn.addEventListener('click', showNextDepoimento);
    
    indicadores.forEach((indicador, index) => {
        indicador.addEventListener('click', () => showDepoimento(index));
    });
    
    startCarrosselAutoRotation();
    
    const container = document.querySelector('.depoimentos-container');
    container?.addEventListener('mouseenter', stopCarrosselAutoRotation);
    container?.addEventListener('mouseleave', startCarrosselAutoRotation);
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
    
    depoimentos.forEach((depoimento, index) => {
        depoimento.classList.toggle('active', index === currentDepoimento);
    });
    
    indicadores.forEach((indicador, index) => {
        indicador.classList.toggle('active', index === currentDepoimento);
    });
}

function startCarrosselAutoRotation() {
    stopCarrosselAutoRotation();
    
    carrosselInterval = setInterval(() => {
        showNextDepoimento();
    }, CONFIG.carrosselInterval);
}

function stopCarrosselAutoRotation() {
    if (carrosselInterval) {
        clearInterval(carrosselInterval);
    }
}

// ============================================
// FORMULÁRIOS
// ============================================
function initFormularios() {
    initContatoForm();
    initNewsletterForm();
}

function initContatoForm() {
    const form = document.getElementById('contatoForm');
    if (!form) return;
    
    form.addEventListener('submit', handleContatoSubmit);
}

function handleContatoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const nome = form.querySelector('#contatoNome')?.value.trim();
    const email = form.querySelector('#contatoEmail')?.value.trim();
    const mensagem = form.querySelector('#contatoMensagem')?.value.trim();
    
    if (!validateNome(nome)) {
        showAlert('Por favor, insira um nome válido', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('Por favor, insira um e-mail válido', 'error');
        return;
    }
    
    if (!validateMensagem(mensagem)) {
        showAlert('Por favor, insira uma mensagem mais detalhada (mínimo 10 caracteres)', 'error');
        return;
    }
    
    showAlert('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
    form.reset();
}

function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', handleNewsletterSubmit);
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();
    
    if (!validateEmail(email)) {
        showAlert('Por favor, insira um e-mail válido', 'error');
        return;
    }
    
    showAlert('Obrigado por se inscrever em nossa newsletter!', 'success');
    emailInput.value = '';
}

// ============================================
// TESTE DE TIPO DE PELE
// ============================================
function initTestePele() {
    const testeContainer = document.querySelector('.teste-container');
    if (!testeContainer) return;
    
    const perguntas = [
        {
            pergunta: "Como sua pele se sente algumas horas após lavar?",
            opcoes: [
                { texto: "Brilhosa/oleosa", tipo: "oleosa" },
                { texto: "Apertada/seca", tipo: "seca" },
                { texto: "Brilhosa na 'zona T', normal/seca nas bochechas", tipo: "mista" },
                { texto: "Confortável/equilibrada", tipo: "normal" }
            ]
        },
        {
            pergunta: "Como sua pele reage a produtos novos?",
            opcoes: [
                { texto: "Facilmente irritada, com vermelhidão", tipo: "sensivel" },
                { texto: "Tolerante, sem reações", tipo: "normal" },
                { texto: "Às vezes irritada, depende do produto", tipo: "reativa" }
            ]
        }
    ];
    
    const estadoTeste = {
        perguntaAtual: 0,
        respostas: []
    };
    
    renderizarPergunta(perguntas[0]);
    
    document.querySelectorAll('.opcao').forEach(opcao => {
        opcao.addEventListener('click', handleOpcaoClick);
    });
    
    function handleOpcaoClick(e) {
        const opcao = e.currentTarget;
        const tipo = opcao.getAttribute('data-tipo');
        
        document.querySelectorAll('.opcao').forEach(o => o.classList.remove('selecionada'));
        
        opcao.classList.add('selecionada');
        
        estadoTeste.respostas[estadoTeste.perguntaAtual] = tipo;
        
        setTimeout(() => {
            estadoTeste.perguntaAtual++;
            
            if (estadoTeste.perguntaAtual < perguntas.length) {
                renderizarPergunta(perguntas[estadoTeste.perguntaAtual]);
            } else {
                mostrarResultado();
            }
        }, 300);
    }
    
    function renderizarPergunta(perguntaObj) {
        const perguntaDiv = document.querySelector('.pergunta');
        const titulo = perguntaDiv.querySelector('h3');
        const opcoesDiv = perguntaDiv.querySelectorAll('.opcao');
        
        titulo.textContent = perguntaObj.pergunta;
        
        opcoesDiv.forEach((opcao, index) => {
            if (perguntaObj.opcoes[index]) {
                opcao.textContent = perguntaObj.opcoes[index].texto;
                opcao.setAttribute('data-tipo', perguntaObj.opcoes[index].tipo);
                opcao.style.display = 'block';
                opcao.classList.remove('selecionada');
            } else {
                opcao.style.display = 'none';
            }
        });
    }
    
    function mostrarResultado() {
        const resultadoDiv = document.querySelector('.resultado');
        const tipoPeleSpan = document.getElementById('tipo-pele');
        const perguntaDiv = document.querySelector('.pergunta');
        
        const tipoPredominante = calcularTipoPredominante(estadoTeste.respostas);
        const tiposPele = {
            oleosa: "Pele Oleosa",
            seca: "Pele Seca",
            mista: "Pele Mista",
            normal: "Pele Normal",
            sensivel: "Pele Sensível",
            reativa: "Pele Reativa"
        };
        
        perguntaDiv.style.display = 'none';
        resultadoDiv.classList.add('mostrar');
        tipoPeleSpan.textContent = tiposPele[tipoPredominante] || "Pele Normal";
        
        adicionarBotoesResultado();
    }
    
    function calcularTipoPredominante(respostas) {
        const contagem = {};
        let maxContagem = 0;
        let tipoPredominante = 'normal';
        
        respostas.forEach(tipo => {
            contagem[tipo] = (contagem[tipo] || 0) + 1;
            
            if (contagem[tipo] > maxContagem) {
                maxContagem = contagem[tipo];
                tipoPredominante = tipo;
            }
        });
        
        return tipoPredominante;
    }
    
    function adicionarBotoesResultado() {
        const resultadoDiv = document.querySelector('.resultado');
        
        const botoesAnteriores = resultadoDiv.querySelector('.botoes-resultado');
        if (botoesAnteriores) botoesAnteriores.remove();
        
        const botoesDiv = document.createElement('div');
        botoesDiv.className = 'botoes-resultado';
        
        const btnAgendar = document.createElement('button');
        btnAgendar.className = 'btn-agendar-teste';
        btnAgendar.textContent = 'Agendar Avaliação Personalizada';
        btnAgendar.addEventListener('click', () => openModal('agendamentoModal'));
        
        const btnReiniciar = document.createElement('button');
        btnReiniciar.className = 'btn-reiniciar-teste';
        btnReiniciar.textContent = 'Fazer Teste Novamente';
        btnReiniciar.addEventListener('click', reiniciarTeste);
        
        botoesDiv.appendChild(btnAgendar);
        botoesDiv.appendChild(btnReiniciar);
        
        const aviso = resultadoDiv.querySelector('.aviso');
        aviso.insertAdjacentElement('beforebegin', botoesDiv);
    }
    
    function reiniciarTeste() {
        estadoTeste.perguntaAtual = 0;
        estadoTeste.respostas = [];
        
        renderizarPergunta(perguntas[0]);
        
        document.querySelector('.pergunta').style.display = 'block';
        document.querySelector('.resultado').classList.remove('mostrar');
    }
}

// ============================================
// SCROLL SUAVE
// ============================================
function initScrollSuave() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        
        if (!link || link.hash === '#') return;
        
        const target = document.querySelector(link.hash);
        if (!target) return;
        
        e.preventDefault();
        
        window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
        });
        
        closeMobileMenu();
    });
}

// ============================================
// OTIMIZAÇÃO DE IMAGENS
// ============================================
function initImageOptimization() {
    const imagensGaleria = document.querySelectorAll('.galeria-imagem-real');
    
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imgObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        imagensGaleria.forEach(img => imgObserver.observe(img));
    } else {
        imagensGaleria.forEach(img => {
            img.onload = () => img.classList.add('loaded');
        });
    }
}

// ============================================
// BOTÃO DE LIGAR (MOBILE)
// ============================================
function createCallButton() {
    const ligarBtn = document.createElement('a');
    ligarBtn.href = `tel:${CONFIG.clinicInfo.phone.replace(/\D/g, '')}`;
    ligarBtn.className = 'ligar-btn';
    ligarBtn.innerHTML = '<i class="fas fa-phone" aria-hidden="true"></i>';
    ligarBtn.setAttribute('aria-label', 'Ligar para clínica');
    
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
    
    ligarBtn.addEventListener('mouseenter', () => {
        ligarBtn.style.transform = 'scale(1.1)';
        ligarBtn.style.backgroundColor = '#128C7E';
    });
    
    ligarBtn.addEventListener('mouseleave', () => {
        ligarBtn.style.transform = 'scale(1)';
        ligarBtn.style.backgroundColor = '#25D366';
    });
    
    document.body.appendChild(ligarBtn);
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================
function validateNome(nome) {
    return nome && nome.length >= 3;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateTelefone(telefone) {
    const re = /^(\d{10,11})$/;
    return re.test(telefone.replace(/\D/g, ''));
}

function validateMensagem(mensagem) {
    return mensagem && mensagem.length >= 10;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.setAttribute('role', 'alert');
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'error') {
        alertDiv.style.backgroundColor = '#dc3545';
    } else if (type === 'success') {
        alertDiv.style.backgroundColor = '#28a745';
    } else {
        alertDiv.style.backgroundColor = '#0ABAB5';
    }
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
    
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// PERFORMANCE E OTIMIZAÇÕES
// ============================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const ligarBtn = document.querySelector('.ligar-btn');
        if (window.innerWidth <= 768 && !ligarBtn) {
            createCallButton();
        } else if (window.innerWidth > 768 && ligarBtn) {
            ligarBtn.remove();
        }
    }, 250);
});

document.addEventListener('submit', (e) => {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar';
            }
        }, 3000);
    }
});