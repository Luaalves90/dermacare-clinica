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
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwIujv6emf2BD9lqlQMJgq42Zidl0DNkjD6C38puvEuadu3hZD28mxZ-4sRnaKrknfG/exec'
};

let currentDepoimento = 0;
let carrosselInterval;
let chatbotOpen = false;
let horarioSelecionado = null;
let dataSelecionada = null;

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
    
    // Inicializar sistema de horários
    initSistemaHorarios();
    
    setTimeout(openChatbot, CONFIG.autoChatbotDelay);
    
    if (window.innerWidth <= 768) {
        createCallButton();
    }
    
    console.log('✅ Aplicação inicializada com sucesso!');
}

// ============================================
// SISTEMA DE HORÁRIOS FIXOS COM BLOQUEIO
// ============================================
function initSistemaHorarios() {
    const dataInput = document.getElementById('data-escolhida');
    
    if (!dataInput) return;
    
    // Configurar data mínima (amanhã)
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    dataInput.min = amanha.toISOString().split('T')[0];
    
    // Configurar data padrão (3 dias à frente)
    const dataPadrao = new Date();
    dataPadrao.setDate(dataPadrao.getDate() + 3);
    dataInput.value = dataPadrao.toISOString().split('T')[0];
    
    // Event listener para mudança de data
    dataInput.addEventListener('change', function(e) {
        dataSelecionada = e.target.value;
        if (dataSelecionada) {
            carregarHorariosDisponiveis(dataSelecionada);
        }
    });
    
    // Carregar horários para a data padrão inicialmente
    dataSelecionada = dataInput.value;
    carregarHorariosDisponiveis(dataSelecionada);
}

async function carregarHorariosDisponiveis(data) {
    console.log('📅 Carregando horários para:', data);
    
    const container = document.getElementById('horarios-disponiveis');
    const campoHorario = document.getElementById('horario-escolhido');
    
    if (!container) return;
    
    // Mostrar loading
    container.innerHTML = `
        <div class="loading-horarios">
            <i class="fas fa-spinner fa-spin"></i>
            Carregando horários disponíveis...
        </div>
    `;
    
    // Resetar horário selecionado
    horarioSelecionado = null;
    if (campoHorario) campoHorario.value = '';
    
    try {
        // Buscar horários ocupados no Google Calendar
        const horariosOcupados = await buscarHorariosOcupados(data);
        
        // Gerar botões de horário
        gerarBotoesHorario(container, data, horariosOcupados);
        
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        container.innerHTML = `
            <div class="no-horarios">
                <i class="fas fa-exclamation-triangle"></i>
                Não foi possível carregar os horários disponíveis.
                <p style="font-size: 0.9rem; margin-top: 10px; color: #666;">
                    Tente novamente ou entre em contato: (11) 99999-9999
                </p>
            </div>
        `;
    }
}

async function buscarHorariosOcupados(data) {
    try {
        // Formatar data para o formato brasileiro
        const [ano, mes, dia] = data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        
        // Chamar o Google Apps Script para verificar horários ocupados
        const response = await fetch(CONFIG.googleScriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'buscarHorariosDisponiveis',
                data: dataFormatada
            }),
            mode: 'no-cors'
        });
        
        // Em produção, você processaria a resposta do Google Script
        // Para demonstração, retornamos um array vazio
        return [];
        
    } catch (error) {
        console.error('Erro ao buscar horários ocupados:', error);
        return [];
    }
}

function gerarBotoesHorario(container, data, horariosOcupados) {
    const hoje = new Date().toISOString().split('T')[0];
    const dataSelecionadaObj = new Date(data);
    const diaSemana = dataSelecionadaObj.getDay();
    
    // Verificar se é final de semana
    const ehFinalDeSemana = diaSemana === 0 || diaSemana === 6;
    
    let html = '';
    let horariosDisponiveisCount = 0;
    
    // Para cada horário fixo
    CONFIG.horariosFixos.forEach(horario => {
        const [hora, minuto] = horario.split(':').map(Number);
        
        // Criar objeto Date para verificação
        const dataHora = new Date(dataSelecionadaObj);
        dataHora.setHours(hora, minuto, 0, 0);
        
        // Verificar status do horário
        const status = verificarStatusHorario(
            data, 
            horario, 
            horariosOcupados, 
            dataSelecionadaObj,
            ehFinalDeSemana
        );
        
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
                    Selecione outra data ou entre em contato.
                </p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function verificarStatusHorario(data, horario, horariosOcupados, dataSelecionadaObj, ehFinalDeSemana) {
    const hoje = new Date();
    const [hora, minuto] = horario.split(':').map(Number);
    
    // Criar objeto Date completo
    const dataHoraCompleta = new Date(dataSelecionadaObj);
    dataHoraCompleta.setHours(hora, minuto, 0, 0);
    
    // Verificar se é passado
    if (dataHoraCompleta < hoje) {
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
    if ((hora >= 12 && hora < 14) || (horario === '11:00' && CONFIG.duracaoConsulta > 60)) {
        return {
            classe: 'almoço',
            texto: 'Horário de almoço',
            disponivel: false
        };
    }
    
    // Verificar se já está ocupado (simulação)
    const estaOcupado = horariosOcupados.some(ocupado => ocupado === horario);
    
    if (estaOcupado) {
        return {
            classe: 'indisponivel',
            texto: 'Horário já agendado',
            disponivel: false
        };
    }
    
    return {
        classe: 'disponivel',
        texto: 'Horário disponível',
        disponivel: true
    };
}

// ============================================
// FUNÇÃO PARA SELECIONAR HORÁRIO (EXPORTADA)
// ============================================
function selecionarHorario(horario, elemento) {
    // Desselecionar horário anterior
    document.querySelectorAll('.horario-btn').forEach(btn => {
        btn.classList.remove('selecionado');
    });
    
    // Selecionar novo horário
    elemento.classList.add('selecionado');
    horarioSelecionado = horario;
    
    // Atualizar campo oculto
    const campoHorario = document.getElementById('horario-escolhido');
    if (campoHorario) {
        campoHorario.value = horario;
        campoHorario.dispatchEvent(new Event('change'));
    }
    
    console.log('⏰ Horário selecionado:', horario, 'para', dataSelecionada);
}

// ============================================
// MENU MOBILE (CORRIGIDO)
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
// MODAL DE AGENDAMENTO (CORRIGIDO)
// ============================================
function initModalAgendamento() {
    const modal = document.getElementById('agendamentoModal');
    const closeButton = modal?.querySelector('.close-modal');
    
    if (!modal) {
        console.error('❌ Modal não encontrado! Verifique se o ID está correto.');
        return;
    }
    
    // Adicionar evento de abertura para TODOS os botões de agendamento
    document.addEventListener('click', function(e) {
        // Verificar se clicou em algum botão de agendamento
        if (e.target.closest('#openAgendamento') || 
            e.target.closest('#openAgendamento2') ||
            e.target.closest('#openAgendamento3') ||
            e.target.closest('.btn-agendar-teste') ||
            (e.target.closest('.chat-option') && e.target.closest('.chat-option').getAttribute('data-option') === 'agendar') ||
            (e.target.closest('.chat-option') && e.target.closest('.chat-option').getAttribute('data-action') === 'agendar-form')) {
            
            e.preventDefault();
            openModal('agendamentoModal');
        }
    });
    
    closeButton?.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Formulário
    const form = document.getElementById('agendamentoForm');
    form?.addEventListener('submit', handleAgendamentoSubmit);
    
    // Máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} não encontrado!`);
        return;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    console.log('✅ Modal aberto:', modalId);
}

function closeModal() {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.body.classList.remove('modal-open');
    
    // Resetar mensagem de sucesso se estiver visível
    const successDiv = document.getElementById('successMessage');
    const form = document.getElementById('agendamentoForm');
    if (successDiv && form) {
        successDiv.style.display = 'none';
        form.style.display = 'block';
    }
}

// ============================================
// CHATBOT INTELIGENTE (CORRIGIDO)
// ============================================
function initChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeChatbot = document.querySelector('.close-chatbot');
    const chatOptions = document.querySelectorAll('.chat-option');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    
    if (!chatbotToggle) {
        console.error('❌ Botão do chatbot não encontrado!');
        return;
    }
    
    // Botão de toggle do chatbot
    chatbotToggle.addEventListener('click', toggleChatbot);
    
    // Botão de fechar chatbot
    closeChatbot?.addEventListener('click', closeChatbotHandler);
    
    // Opções do chatbot
    chatOptions.forEach(option => {
        option.addEventListener('click', handleChatOptionClick);
    });
    
    // Enviar mensagem
    sendMessageBtn?.addEventListener('click', sendUserMessage);
    
    // Enviar mensagem com Enter
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });
    
    console.log('✅ Chatbot inicializado!');
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
        setTimeout(() => {
            document.getElementById('chatInput')?.focus();
        }, 300);
    }
    
    console.log('🤖 Chatbot:', chatbotOpen ? 'Aberto' : 'Fechado');
}

function openChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    if (chatbotContainer && !chatbotOpen) {
        chatbotContainer.classList.add('active');
        chatbotOpen = true;
        
        setTimeout(() => {
            document.getElementById('chatInput')?.focus();
        }, 300);
    }
}

function closeChatbotHandler() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    chatbotContainer?.classList.remove('active');
    chatbotOpen = false;
}

function handleChatOptionClick(e) {
    const optionType = e.currentTarget.getAttribute('data-option') || 
                       e.currentTarget.getAttribute('data-action') ||
                       e.currentTarget.getAttribute('data-faq');
    
    console.log('🤖 Opção selecionada:', optionType);
    
    switch(optionType) {
        case 'agendar':
        case 'agendar-form':
            addBotMessage('Ótimo! Vou te ajudar a agendar uma consulta. Por favor, preencha o formulário que será aberto.');
            setTimeout(() => {
                closeChatbotHandler();
                openModal('agendamentoModal');
            }, 1500);
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
            
        case 'consulta':
        case 'horario':
        case 'plano':
        case 'procedimento':
            handleFaqClick(e);
            break;
            
        default:
            addBotMessage('Desculpe, não entendi. Pode reformular?');
    }
}

// ... (MANTENHA TODAS AS OUTRAS FUNÇÕES DO CHATBOT DO SEU CÓDIGO ORIGINAL AQUI)
// Inclua: handleServicosOption, handleDuvidasOption, handleFaqClick, 
// handleWhatsAppOption, sendUserMessage, etc...

// ============================================
// FORMULÁRIO DE AGENDAMENTO
// ============================================
async function handleAgendamentoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validar campos obrigatórios
    if (!validarFormularioAgendamento()) {
        return;
    }
    
    // Coletar dados
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
    
    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando...';
    
    try {
        const response = await enviarParaGoogleCalendar(agendamentoData);
        
        if (response.success) {
            mostrarMensagemSucesso(agendamentoData);
            
            // Resetar
            form.reset();
            horarioSelecionado = null;
            
            // Recarregar horários
            if (dataSelecionada) {
                setTimeout(() => carregarHorariosDisponiveis(dataSelecionada), 2000);
            }
            
        } else {
            throw new Error(response.message);
        }
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert(`❌ Erro: ${error.message}`, 'error');
        mostrarFallbackContato(agendamentoData);
        
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Confirmar Agendamento';
    }
}

function validarFormularioAgendamento() {
    const campos = [
        { id: 'nome', nome: 'Nome Completo' },
        { id: 'telefone', nome: 'Telefone' },
        { id: 'email', nome: 'E-mail' },
        { id: 'tipo-consulta', nome: 'Tipo de Consulta' }
    ];
    
    for (const campo of campos) {
        const elemento = document.getElementById(campo.id);
        if (!elemento || !elemento.value.trim()) {
            showAlert(`Por favor, preencha o campo "${campo.nome}"`, 'error');
            elemento?.focus();
            return false;
        }
    }
    
    if (!validateNome(document.getElementById('nome').value.trim())) {
        showAlert('Por favor, insira um nome válido (mínimo 3 caracteres)', 'error');
        return false;
    }
    
    if (!validateTelefone(document.getElementById('telefone').value.trim())) {
        showAlert('Por favor, insira um telefone válido com DDD', 'error');
        return false;
    }
    
    if (!validateEmail(document.getElementById('email').value.trim())) {
        showAlert('Por favor, insira um e-mail válido', 'error');
        return false;
    }
    
    if (!horarioSelecionado) {
        showAlert('Por favor, selecione um horário disponível', 'error');
        return false;
    }
    
    return true;
}

async function enviarParaGoogleCalendar(data) {
    try {
        const response = await fetch(CONFIG.googleScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            mode: 'no-cors'
        });
        
        return { 
            success: true, 
            message: 'Agendamento enviado para confirmação' 
        };
        
    } catch (error) {
        throw new Error('Não foi possível conectar ao sistema de agendamento');
    }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================
function formatarTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.slice(0, 11);
    
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

function mostrarMensagemSucesso(data) {
    const form = document.getElementById('agendamentoForm');
    const successDiv = document.getElementById('successMessage');
    const successDetails = document.getElementById('successDetails');
    
    if (!form || !successDiv || !successDetails) return;
    
    const dataFormatada = formatarDataParaExibicao(data.data);
    
    successDetails.innerHTML = `
        <strong>Consulta agendada para:</strong><br>
        📅 <strong>Data:</strong> ${dataFormatada}<br>
        ⏰ <strong>Horário:</strong> ${data.horario}<br>
        👤 <strong>Paciente:</strong> ${data.nome}<br>
        📞 <strong>Contato:</strong> ${data.telefone}
    `;
    
    form.style.display = 'none';
    successDiv.style.display = 'block';
}

function formatarDataParaExibicao(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

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

function showAlert(message, type = 'info') {
    // ... (mantenha a função showAlert do seu código original)
}

// ============================================
// FUNÇÕES RESTANTES (MANTENHA DO SEU CÓDIGO)
// ============================================
// Inclua aqui:
// - initCarrosselDepoimentos()
// - initFormularios()
// - initTestePele()
// - initScrollSuave()
// - initImageOptimization()
// - createCallButton()
// - E todas as outras funções do chatbot que não coloquei acima

// ============================================
// EXPORTAÇÕES PARA HTML
// ============================================
window.selecionarHorario = selecionarHorario;
window.closeModal = closeModal;
window.openModal = openModal;
window.toggleChatbot = toggleChatbot;
window.closeChatbotHandler = closeChatbotHandler;