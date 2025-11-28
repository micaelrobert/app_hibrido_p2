// public/js/dashboard-logic.js

// Variáveis de Cache
let cacheTarefas = null;
let cacheProjetos = null;

document.addEventListener('DOMContentLoaded', async () => {
  const statusElement = document.getElementById('dashboard-status');
  
  try {
    // 1. Carregar Estatísticas
    const response = await fetch('/api/dashboard-stats');
    if (!response.ok) throw new Error(`Falha API: ${response.statusText}`);
    
    const json = await response.json();
    if (!json.success || !json.data) throw new Error('Dados inválidos');
    
    const { tarefas: t, projetos: p, tarefasPorProjeto: tpp } = json.data;

    // Trata os objetos de prioridade
    const tPrioridades = formatarPrioridades(t);
    const pPrioridades = p.prioridades || { Alta: 0, Media: 0, Baixa: 0 };

    // 2. Preencher Números na Tela
    renderizarTextos(t, p, tPrioridades, pPrioridades);
    renderizarListaProjetos(tpp);

    // 3. Renderizar Gráficos (Com verificações de segurança)
    renderizarGraficoTarefas(t);
    renderizarGraficoProjetos(p);

    statusElement.textContent = "C:\\> Sistema_Dashboard_Online.";
    statusElement.style.color = '#00ff00';

  } catch (error) {
    console.error("Erro Dashboard:", error);
    if(statusElement) {
        statusElement.textContent = `ERRO: ${error.message}`;
        statusElement.style.color = '#ff0000';
    }
  }
});

// --- GRÁFICOS (FUNÇÕES SEPARADAS) ---

function renderizarGraficoTarefas(t) {
    const canvas = document.getElementById('chartTarefas');
    if (!canvas) return console.error("Canvas chartTarefas não encontrado");
    
    // Se não houver dados, usa 0 para evitar erro
    const pend = t.pendentes || 0;
    const conc = t.concluidas || 0;
    // Se tudo for 0, coloca 1 no 'pendentes' só para aparecer algo cinza (opcional), ou deixa zerado
    const dataValues = (pend === 0 && conc === 0) ? [0, 0] : [pend, conc];

    new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Concluídas'],
            datasets: [{
                label: 'Tarefas',
                data: dataValues,
                backgroundColor: ['rgba(255, 0, 0, 0.7)', 'rgba(0, 255, 0, 0.7)'],
                borderColor: '#000',
                borderWidth: 1
            }]
        },
        options: getChartOptions()
    });
}

function renderizarGraficoProjetos(p) {
    const canvas = document.getElementById('chartProjetos');
    if (!canvas) return console.error("Canvas chartProjetos não encontrado");

    const pend = p.pendentes || 0;
    const conc = p.concluidas || 0;

    new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Concluídas'],
            datasets: [{
                label: 'Projetos',
                data: [pend, conc],
                backgroundColor: ['rgba(255, 255, 0, 0.7)', 'rgba(0, 255, 255, 0.7)'],
                borderColor: '#000',
                borderWidth: 1
            }]
        },
        options: getChartOptions()
    });
}

function getChartOptions() {
    Chart.defaults.color = '#00ff00';
    Chart.defaults.borderColor = 'rgba(0, 255, 0, 0.1)';
    return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { 
            legend: { 
                position: 'bottom', 
                labels: { font: { family: "'Courier New'" }, boxWidth: 12 } 
            } 
        }
    };
}

// --- TEXTOS E LISTAS ---

function renderizarTextos(t, p, tPrio, pPrio) {
  setText('tarefas-total', t.total);
  setText('tarefas-concluidas', t.concluidas);
  setText('tarefas-pendentes', t.pendentes);
  setText('tarefas-prio-alta', tPrio.Alta);
  setText('tarefas-prio-media', tPrio.Media);
  setText('tarefas-prio-baixa', tPrio.Baixa);

  setText('projetos-total', p.total);
  setText('projetos-concluidos', p.concluidas);
  setText('projetos-pendentes', p.pendentes);
  setText('projetos-prio-alta', pPrio.Alta);
  setText('projetos-prio-media', pPrio.Media);
  setText('projetos-prio-baixa', pPrio.Baixa);
}

function renderizarListaProjetos(tpp) {
  const lista = document.getElementById('tarefas-por-projeto-lista');
  if (!lista) return;

  if (tpp && tpp.length > 0) {
    lista.innerHTML = '';
    tpp.forEach(item => {
      const cor = item.projetoNome === 'Sem Projeto' ? '#ff0000' : '#00ffff';
      lista.innerHTML += `<p>${item.projetoNome}: <span class="stat-value" style="color: ${cor};">${item.count}</span></p>`;
    });
  } else {
    lista.innerHTML = '<p class="console-text" style="color: #888;">>> Nada pendente.</p>';
  }
}

// --- LÓGICA DO MODAL ---

function fecharModal() {
  const m = document.getElementById('modal-detalhes');
  if(m) m.style.display = 'none';
}

window.onclick = (e) => {
  const m = document.getElementById('modal-detalhes');
  if (e.target == m) fecharModal();
}

async function abrirModal(tipo, prioridade) {
  const modal = document.getElementById('modal-detalhes');
  const lista = document.getElementById('modal-lista');
  
  if(!modal) return alert('Modal não encontrado no HTML');

  modal.style.display = 'flex';
  document.getElementById('modal-titulo').innerText = `>> ${tipo.toUpperCase()} [${prioridade}]`;
  lista.innerHTML = '<p class="console-text blink">Acessando banco de dados...</p>';

  try {
    let dados = await getDados(tipo);
    
    const filtrados = dados.filter(item => 
      item.prioridade === prioridade && item.concluido === false
    );

    if (filtrados.length === 0) {
      lista.innerHTML = '<p class="console-text" style="color: #ffff00;">>> Nenhum registro encontrado.</p>';
      return;
    }

    lista.innerHTML = filtrados.map(item => `
      <div class="modal-item">
        <span style="color: #fff; font-weight: bold;">[ ${item.nome} ]</span>
        <span class="item-date">${new Date(item.dataCriacao).toLocaleDateString('pt-BR')}</span>
      </div>
    `).join('');

  } catch (e) {
    lista.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
  }
}

// --- BUSCA POR DATA ---

async function buscarPorData(tipo) {
  const inicio = document.getElementById('busca-inicio').value;
  const fim = document.getElementById('busca-fim').value;
  const container = document.getElementById('resultado-busca-container');
  const lista = document.getElementById('lista-resultados');

  if (!inicio || !fim) return alert('Defina as datas de início e fim.');
  
  container.style.display = 'block';
  lista.innerHTML = '<li class="console-text blink">Buscando...</li>';

  try {
    let resultados = [];

    if (tipo === 'tarefas') {
      // Usa Rota Backend (Tarefa 3 da Prova)
      const res = await fetch(`/api/mongodb/tarefas/filtro/data?inicio=${inicio}&fim=${fim}`);
      if (!res.ok) throw new Error('Erro na API');
      resultados = await res.json();
    } else {
      // Projetos: Filtro Client-Side (para manter compatibilidade se não houver rota)
      const todos = await getDados('projetos');
      const dI = new Date(inicio); const dF = new Date(fim); dF.setHours(23,59,59);
      resultados = todos.filter(p => {
        const d = new Date(p.dataCriacao);
        return d >= dI && d <= dF;
      });
    }

    if (!resultados || resultados.length === 0) {
      lista.innerHTML = '<li class="console-text" style="color: #888;">>> Nenhum resultado.</li>';
      return;
    }

    lista.innerHTML = resultados.map(item => `
      <li style="border-bottom: 1px dashed #333; padding: 5px 0; display: flex; justify-content: space-between;">
        <span><span style="color: ${tipo === 'tarefas' ? '#00ff00' : '#00ffff'};">[${tipo === 'tarefas' ? 'T' : 'P'}]</span> ${item.nome}</span>
        <span style="font-size: 0.8em; color: #666;">${new Date(item.dataCriacao).toLocaleDateString('pt-BR')}</span>
      </li>
    `).join('');

  } catch (error) {
    console.error(error);
    lista.innerHTML = '<li style="color: red;">Falha na busca.</li>';
  }
}

// --- UTILITÁRIOS ---

async function getDados(tipo) {
  if (tipo === 'tarefas') {
    if (!cacheTarefas) {
      const r = await fetch('/api/mongodb/tarefas');
      cacheTarefas = await r.json();
    }
    return cacheTarefas;
  } else {
    if (!cacheProjetos) {
      const r = await fetch('/api/projetos');
      cacheProjetos = await r.json();
    }
    return cacheProjetos;
  }
}

function formatarPrioridades(dados) {
  const mapa = { Alta: 0, Media: 0, Baixa: 0 };
  if (dados.porPrioridade && Array.isArray(dados.porPrioridade)) {
    dados.porPrioridade.forEach(item => {
      if (mapa[item._id] !== undefined) mapa[item._id] = item.pendentes;
    });
  } else if (dados.prioridades) {
    return dados.prioridades;
  }
  return mapa;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || 0;
}