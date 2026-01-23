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
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwIujv6emf2BD9lqlQMJgq42Zidl0DNkjD6C38puvEuadu3hZD28mxZ-4sRnaKrknfG/exec' // ← ATUALIZE COM SUA URL
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
    const diaSemana = dataSelecionadaObj.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Verificar se é final de semana
    const ehFinalDeSemana = diaSemana === 0 || diaSemana === 6; // Domingo ou Sábado
    
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
    // Em produção, você usaria a lista horariosOcupados do Google Calendar
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
        
        // Disparar evento de validação
        campoHorario.dispatchEvent(new Event('change'));
    }
    
    console.log('⏰ Horário selecionado:', horario, 'para', dataSelecionada);
}

// ============================================
// MENU MOBILE (MANTIDO)
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
// MODAL DE AGENDAMENTO ATUALIZADO
// ============================================
function initModalAgendamento() {
    const modal = document.getElementById('agendamentoModal');
    const openButtons = document.querySelectorAll('#openAgendamento, #openAgendamento2, #openAgendamento3');
    const closeButton = modal?.querySelector('.close-modal');
    const form = document.getElementById('agendamentoForm');
    
    if (!modal) return;
    
    // Adicionar evento de abertura para todos os botões
    openButtons.forEach(button => {
        button.addEventListener('click', () => openModal('agendamentoModal'));
    });
    
    // Adicionar também para botões do chatbot
    document.addEventListener('click', (e) => {
        if (e.target.closest('.chat-option[data-action="agendar-form"]')) {
            closeChatbotHandler();
            setTimeout(() => openModal('agendamentoModal'), 300);
        }
    });
    
    closeButton?.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    form?.addEventListener('submit', handleAgendamentoSubmit);
    
    // Adicionar máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatarTelefone);
    }
}

async function handleAgendamentoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validar campos obrigatórios
    if (!validarFormularioAgendamento()) {
        return;
    }
    
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
        // Campos para integração com Google Calendar
        action: 'agendarConsulta',
        appointmentDuration: CONFIG.duracaoConsulta,
        clinicName: 'DermaCare'
    };
    
    // Validar horário selecionado
    if (!horarioSelecionado) {
        showAlert('Por favor, selecione um horário disponível', 'error');
        return;
    }
    
    // Validar data selecionada
    if (!dataSelecionada) {
        showAlert('Por favor, selecione uma data', 'error');
        return;
    }
    
    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando Agendamento...';
    
    try {
        // Enviar para Google Apps Script
        const response = await enviarParaGoogleCalendar(agendamentoData);
        
        if (response.success) {
            // Mostrar mensagem de sucesso
            mostrarMensagemSucesso(agendamentoData);
            
            // Resetar formulário
            form.reset();
            horarioSelecionado = null;
            dataSelecionada = null;
            
            // Recarregar horários para a mesma data (para bloquear o horário)
            setTimeout(() => {
                if (dataSelecionada) {
                    carregarHorariosDisponiveis(dataSelecionada);
                }
            }, 2000);
            
        } else {
            throw new Error(response.message || 'Erro no agendamento');
        }
        
    } catch (error) {
        console.error('Erro no agendamento:', error);
        showAlert(`❌ Erro: ${error.message}. Tente novamente ou ligue para (11) 99999-9999`, 'error');
        
        // Mostrar fallback de contato
        mostrarFallbackContato(agendamentoData);
        
    } finally {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Confirmar Agendamento';
    }
}

function validarFormularioAgendamento() {
    const camposObrigatorios = [
        { id: 'nome', nome: 'Nome Completo' },
        { id: 'telefone', nome: 'Telefone' },
        { id: 'email', nome: 'E-mail' },
        { id: 'tipo-consulta', nome: 'Tipo de Consulta' }
    ];
    
    for (const campo of camposObrigatorios) {
        const elemento = document.getElementById(campo.id);
        if (!elemento || !elemento.value.trim()) {
            showAlert(`Por favor, preencha o campo "${campo.nome}"`, 'error');
            elemento?.focus();
            return false;
        }
    }
    
    // Validações específicas
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'no-cors'
        });
        
        // Em modo no-cors, não podemos ler a resposta
        // Assumimos sucesso se não houver erro de rede
        return { 
            success: true, 
            message: 'Agendamento enviado para confirmação' 
        };
        
    } catch (error) {
        console.error('Erro ao enviar para Google Calendar:', error);
        throw new Error('Não foi possível conectar ao sistema de agendamento');
    }
}

function mostrarMensagemSucesso(data) {
    // Mostrar a div de sucesso
    const form = document.getElementById('agendamentoForm');
    const successDiv = document.getElementById('successMessage');
    const successDetails = document.getElementById('successDetails');
    
    if (!form || !successDiv || !successDetails) return;
    
    // Formatar data para exibição
    const dataFormatada = formatarDataParaExibicao(data.data);
    
    // Atualizar mensagem de sucesso
    successDetails.innerHTML = `
        <strong>Consulta agendada para:</strong><br>
        📅 <strong>Data:</strong> ${dataFormatada}<br>
        ⏰ <strong>Horário:</strong> ${data.horario}<br>
        👤 <strong>Paciente:</strong> ${data.nome}<br>
        📞 <strong>Contato:</strong> ${data.telefone}
    `;
    
    // Mostrar div de sucesso e esconder formulário
    form.style.display = 'none';
    successDiv.style.display = 'block';
    
    // Adicionar funcionalidade para imprimir
    const btnImprimir = successDiv.querySelector('.btn-secondary');
    if (btnImprimir) {
        btnImprimir.onclick = () => imprimirComprovante(data);
    }
}

function formatarDataParaExibicao(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function imprimirComprovante(data) {
    const dataFormatada = formatarDataParaExibicao(data.data);
    const conteudo = `
        <html>
            <head>
                <title>Comprovante de Agendamento - DermaCare</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #0a3d62; }
                    .title { color: #0ABAB5; margin: 20px 0; }
                    .details { border: 2px solid #0ABAB5; padding: 20px; border-radius: 10px; }
                    .detail-row { margin: 10px 0; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
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
                </div>
            </body>
        </html>
    `;
    
    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
}

// ============================================
// FUNÇÕES DO CHATBOT (MANTIDAS COM PEQUENOS AJUSTES)
// ============================================
function initChatbot() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeChatbot = document.querySelector('.close-chatbot');
    
    if (!chatbotToggle) return;
    
    chatbotToggle.addEventListener('click', toggleChatbot);
    closeChatbot?.addEventListener('click', closeChatbotHandler);
    
    // Atualizar opções do chatbot
    atualizarOpcoesChatbot();
}

function atualizarOpcoesChatbot() {
    const chatOptions = document.querySelectorAll('.chat-option');
    
    chatOptions.forEach(option => {
        option.addEventListener('click', handleChatOptionClick);
    });
}

// ... (restante das funções do chatbot mantidas igual)

// ============================================
// FUNÇÕES UTILITÁRIAS ADICIONAIS
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

// ============================================
// CARROSSEL DE DEPOIMENTOS (MANTIDO)
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
// FORMULÁRIOS (MANTIDO COM AJUSTES)
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
// TESTE DE TIPO DE PELE (MANTIDO)
// ============================================
function initTestePele() {
    // ... (código mantido igual)
}

// ============================================
// SCROLL SUAVE (MANTIDO)
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
// OTIMIZAÇÃO DE IMAGENS (MANTIDO)
// ============================================
function initImageOptimization() {
    // ... (código mantido igual)
}

// ============================================
// BOTÃO DE LIGAR (MOBILE) (MANTIDO)
// ============================================
function createCallButton() {
    // ... (código mantido igual)
}

// ============================================
// FUNÇÕES UTILITÁRIAS (MANTIDAS)
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
    // ... (código mantido igual)
}

// ============================================
// PERFORMANCE E OTIMIZAÇÕES (MANTIDO)
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

// ============================================
// EXPORTAÇÕES PARA USO NO HTML
// ============================================
// Exportar funções que são chamadas diretamente do HTML
window.selecionarHorario = selecionarHorario;
window.closeModal = closeModal;
window.openModal = openModal;
window.imprimirComprovante = imprimirComprovante;

// Fallback functions
window.mostrarFallbackContato = mostrarFallbackContato;
window.copiarDadosParaAreaTransferencia = copiarDadosParaAreaTransferencia;

// Chatbot functions
window.toggleChatbot = toggleChatbot;
window.closeChatbotHandler = closeChatbotHandler;

console.log('✅ Sistema de agendamento com horários fixos carregado!');