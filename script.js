// ============================================
// VARIÁVEIS GLOBAIS E CONSTANTES
// ============================================
const CONFIG = {
    whatsappNumber: '5511999999999',
    totalDepoimentos: 3,
    autoChatbotDelay: 3000, // 3 segundos
    carrosselInterval: 5000, // 5 segundos
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
    
    // Abrir chatbot automaticamente após delay
    setTimeout(openChatbot, CONFIG.autoChatbotDelay);
    
    // Botão de ligar para mobile
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
    
    // Fechar menu ao clicar em links
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Fechar menu ao clicar fora
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
    
    // Acessibilidade
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
// CHATBOT - Assistente Virtual
// ============================================
function initChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeChatbot = document.querySelector('.close-chatbot');
    const chatOptions = document.querySelectorAll('.chat-option');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    
    if (!chatbotToggle) return;
    
    // Event Listeners
    chatbotToggle.addEventListener('click', toggleChatbot);
    closeChatbot?.addEventListener('click', closeChatbotHandler);
    
    chatOptions.forEach(option => {
        option.addEventListener('click', handleChatOptionClick);
    });
    
    // Enviar mensagem
    sendMessageBtn?.addEventListener('click', sendUserMessage);
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });
}

function toggleChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    chatbotContainer?.classList.toggle('active');
    chatbotOpen = chatbotContainer?.classList.contains('active') || false;
    
    // Focar no input quando abrir
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
    
    // Adicionar eventos aos novos botões
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

function sendUserMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput?.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    chatInput.value = '';
    
    setTimeout(() => {
        handleUserQuery(message);
    }, 1000);
}

function handleUserQuery(message) {
    const msg = message.toLowerCase();
    let resposta;
    
    if (msg.match(/(olá|oi|bom dia|boa tarde|boa noite)/i)) {
        resposta = 'Olá! Como posso ajudá-lo hoje?';
    } else if (msg.match(/(consulta|marcar|agendar|marcado)/i)) {
        resposta = 'Para agendar uma consulta, clique no botão "Agendar Consulta" ou preencha o formulário de contato. Posso te ajudar com algo mais?';
    } else if (msg.match(/(preço|valor|custa|cobrança|quanto)/i)) {
        resposta = `O valor da consulta é <strong>R$ 350,00</strong>. Para procedimentos estéticos, o valor varia conforme o tratamento. Deseja ser encaminhado para nosso WhatsApp para um orçamento detalhado?`;
    } else if (msg.match(/(telefone|falar|ligar|contato)/i)) {
        resposta = `Nosso telefone é <strong>${CONFIG.clinicInfo.phone}</strong>. Também estamos disponíveis no WhatsApp. Gostaria de ser redirecionado?`;
    } else if (msg.match(/(endereço|local|onde|chegar)/i)) {
        resposta = `Estamos localizados em:<br><br>
            📍 <strong>${CONFIG.clinicInfo.address}</strong><br><br>
            ${CONFIG.clinicInfo.workingHours.weekdays}<br>
            ${CONFIG.clinicInfo.workingHours.saturday}<br>
            ${CONFIG.clinicInfo.workingHours.sunday}`;
    } else if (msg.match(/(doutora|dra|mariana)/i)) {
        resposta = 'A Dra. Mariana Santos é especialista em dermatologia com mais de 15 anos de experiência. Formada pela USP com pós-graduação em Harvard. Gostaria de saber mais sobre sua formação?';
    } else {
        resposta = 'Desculpe, não entendi completamente. Para questões mais específicas, recomendo que entre em contato por WhatsApp ou telefone. Posso te ajudar com agendamento ou informações básicas?';
    }
    
    addBotMessageHTML(resposta);
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
    
    // Adicionar atributo aos botões existentes
    document.querySelectorAll('#openAgendamento, #openAgendamento2, .btn-agendar-teste').forEach(btn => {
        btn.setAttribute('data-modal', 'agendamento');
    });
    
    // Abrir modal
    openButtons.forEach(button => {
        button.addEventListener('click', () => openModal('agendamentoModal'));
    });
    
    // Fechar modal
    closeButton?.addEventListener('click', closeModal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Enviar formulário
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

function handleAgendamentoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const nome = form.querySelector('#nome')?.value.trim();
    const telefone = form.querySelector('#telefone')?.value.trim();
    
    // Validação
    if (!validateNome(nome)) {
        showAlert('Por favor, insira um nome válido (mínimo 3 caracteres)', 'error');
        return;
    }
    
    if (!validateTelefone(telefone)) {
        showAlert('Por favor, insira um telefone válido com DDD', 'error');
        return;
    }
    
    // Simular envio
    showAlert('Solicitação de agendamento enviada com sucesso! Entraremos em contato em breve para confirmar.', 'success');
    
    // Resetar formulário
    form.reset();
    
    // Fechar modal após sucesso
    setTimeout(closeModal, 2000);
}

// ============================================
// CARROSSEL DE DEPOIMENTOS
// ============================================
function initCarrosselDepoimentos() {
    const prevBtn = document.querySelector('.carrossel-btn.prev');
    const nextBtn = document.querySelector('.carrossel-btn.next');
    const indicadores = document.querySelectorAll('.indicador');
    
    if (!prevBtn || !nextBtn) return;
    
    // Event Listeners
    prevBtn.addEventListener('click', showPreviousDepoimento);
    nextBtn.addEventListener('click', showNextDepoimento);
    
    indicadores.forEach((indicador, index) => {
        indicador.addEventListener('click', () => showDepoimento(index));
    });
    
    // Auto-rotacionar
    startCarrosselAutoRotation();
    
    // Pausar ao passar o mouse
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
    
    // Atualizar depoimentos
    depoimentos.forEach((depoimento, index) => {
        depoimento.classList.toggle('active', index === currentDepoimento);
    });
    
    // Atualizar indicadores
    indicadores.forEach((indicador, index) => {
        indicador.classList.toggle('active', index === currentDepoimento);
    });
}

function startCarrosselAutoRotation() {
    stopCarrosselAutoRotation(); // Limpar intervalo anterior
    
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
    
    // Validação
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
    
    // Simular envio
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
    
    // Simular inscrição
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
    
    // Inicializar
    renderizarPergunta(perguntas[0]);
    
    // Adicionar eventos
    document.querySelectorAll('.opcao').forEach(opcao => {
        opcao.addEventListener('click', handleOpcaoClick);
    });
    
    function handleOpcaoClick(e) {
        const opcao = e.currentTarget;
        const tipo = opcao.getAttribute('data-tipo');
        
        // Remover seleção anterior
        document.querySelectorAll('.opcao').forEach(o => o.classList.remove('selecionada'));
        
        // Selecionar opção atual
        opcao.classList.add('selecionada');
        
        // Armazenar resposta
        estadoTeste.respostas[estadoTeste.perguntaAtual] = tipo;
        
        // Próxima pergunta ou resultado
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
        
        // Atualizar pergunta
        titulo.textContent = perguntaObj.pergunta;
        
        // Atualizar opções
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
        
        // Calcular tipo predominante
        const tipoPredominante = calcularTipoPredominante(estadoTeste.respostas);
        const tiposPele = {
            oleosa: "Pele Oleosa",
            seca: "Pele Seca",
            mista: "Pele Mista",
            normal: "Pele Normal",
            sensivel: "Pele Sensível",
            reativa: "Pele Reativa"
        };
        
        // Atualizar UI
        perguntaDiv.style.display = 'none';
        resultadoDiv.classList.add('mostrar');
        tipoPeleSpan.textContent = tiposPele[tipoPredominante] || "Pele Normal";
        
        // Adicionar botões de ação
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
        
        // Limpar botões anteriores
        const botoesAnteriores = resultadoDiv.querySelector('.botoes-resultado');
        if (botoesAnteriores) botoesAnteriores.remove();
        
        // Criar novos botões
        const botoesDiv = document.createElement('div');
        botoesDiv.className = 'botoes-resultado';
        
        // Botão Agendar
        const btnAgendar = document.createElement('button');
        btnAgendar.className = 'btn-agendar-teste';
        btnAgendar.textContent = 'Agendar Avaliação Personalizada';
        btnAgendar.addEventListener('click', () => openModal('agendamentoModal'));
        
        // Botão Reiniciar
        const btnReiniciar = document.createElement('button');
        btnReiniciar.className = 'btn-reiniciar-teste';
        btnReiniciar.textContent = 'Fazer Teste Novamente';
        btnReiniciar.addEventListener('click', reiniciarTeste);
        
        // Adicionar botões
        botoesDiv.appendChild(btnAgendar);
        botoesDiv.appendChild(btnReiniciar);
        
        // Inserir antes do aviso
        const aviso = resultadoDiv.querySelector('.aviso');
        aviso.insertAdjacentElement('beforebegin', botoesDiv);
    }
    
    function reiniciarTeste() {
        estadoTeste.perguntaAtual = 0;
        estadoTeste.respostas = [];
        
        // Mostrar primeira pergunta
        renderizarPergunta(perguntas[0]);
        
        // Esconder resultado
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
        
        // Fechar menu mobile se aberto
        closeMobileMenu();
    });
}

// ============================================
// OTIMIZAÇÃO DE IMAGENS
// ============================================
function initImageOptimization() {
    // Carregamento lazy para imagens da galeria
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
        // Fallback para navegadores antigos
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
    
    // Estilos inline para performance
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
    // Criar elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.setAttribute('role', 'alert');
    
    // Estilos
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
    
    // Adicionar ao body
    document.body.appendChild(alertDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
    
    // Adicionar animação CSS
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
// Debounce para eventos de resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recriar botão de ligar se necessário
        const ligarBtn = document.querySelector('.ligar-btn');
        if (window.innerWidth <= 768 && !ligarBtn) {
            createCallButton();
        } else if (window.innerWidth > 768 && ligarBtn) {
            ligarBtn.remove();
        }
    }, 250);
});

// Prevenir múltiplas submissões de formulário
document.addEventListener('submit', (e) => {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        // Reativar após 3 segundos (simulação)
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar';
            }
        }, 3000);
    }
});