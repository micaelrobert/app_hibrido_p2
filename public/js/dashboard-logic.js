// public/js/dashboard-logic.js

let cacheTarefas = null;
let cacheProjetos = null;
let chartTarefasInstance = null;
let chartProjetosInstance = null;

// Dados globais para alternância
let dadosGlobais = {
  tarefas: null,
  projetos: null,
  tPrioridades: null,
  pPrioridades: null
};

document.addEventListener('DOMContentLoaded', async () => {
  const statusElement = document.getElementById('dashboard-status');
  
  try {
    const response = await fetch('/api/dashboard-stats');
    if (!response.ok) throw new Error('Falha na API');
    
    const json = await response.json();
    if (!json.success || !json.data) throw new Error('Dados inválidos');
    
    const { tarefas, projetos, tarefasPorProjeto } = json.data;

    // Processamento inicial dos dados
    dadosGlobais.tarefas = tarefas;
    dadosGlobais.projetos = projetos;
    
    // Normaliza Prioridades (Tarefa 5 retorna array, Projetos objeto)
    dadosGlobais.tPrioridades = normalizarPrioridades(tarefas.porPrioridade, true);
    dadosGlobais.pPrioridades = projetos.prioridades || { Alta: 0, Media: 0, Baixa: 0 };

    // --- CORREÇÃO DO BUG DOS TOTAIS ZERADOS NO GRÁFICO DE TAREFAS ---
    // Se a API retornou estrutura nova (porPrioridade), calculamos totais manualmente
    if (tarefas.porPrioridade && Array.isArray(tarefas.porPrioridade)) {
        let calcConcluidas = 0;
        let calcPendentes = 0;
        tarefas.porPrioridade.forEach(p => {
            calcConcluidas += p.concluidas || 0;
            calcPendentes += p.pendentes || 0;
        });
        // Atualiza o objeto global para o gráfico ler corretamente
        dadosGlobais.tarefas.concluidas = calcConcluidas;
        dadosGlobais.tarefas.pendentes = calcPendentes;
    }

    // Renderiza Textos
    renderizarTextos();
    renderizarListaProjetos(tarefasPorProjeto);

    // Renderiza Gráficos Iniciais (Modo 'total' padrão)
    atualizarGraficoTarefas();
    atualizarGraficoProjetos();

    statusElement.textContent = "C:\\> Dashboard_Online. Pronto.";
    statusElement.style.color = '#00ff00';

  } catch (error) {
    console.error(error);
    if(statusElement) {
        statusElement.textContent = `ERRO: ${error.message}`;
        statusElement.style.color = '#ff0000';
    }
  }
});

// --- FUNÇÕES DE CONTROLE DOS GRÁFICOS ---

function atualizarGraficoTarefas() {
  const modo = document.getElementById('view-tarefas').value; // 'total' ou 'prioridade'
  const ctx = document.getElementById('chartTarefas').getContext('2d');
  const dados = dadosGlobais.tarefas;
  const prioridades = dadosGlobais.tPrioridades;

  if (chartTarefasInstance) chartTarefasInstance.destroy();

  if (modo === 'total') {
    // Exibe Pendentes vs Concluídas
    chartTarefasInstance = criarGraficoRosca(ctx, 
      ['Pendentes', 'Concluídas'], 
      [dados.pendentes, dados.concluidas], 
      ['rgba(255, 0, 0, 0.7)', 'rgba(0, 255, 0, 0.7)'],
      ['#ff0000', '#00ff00']
    );
  } else {
    // Exibe Alta, Média, Baixa
    chartTarefasInstance = criarGraficoRosca(ctx,
      ['Alta', 'Média', 'Baixa'],
      [prioridades.Alta, prioridades.Media, prioridades.Baixa],
      ['rgba(255, 0, 0, 0.8)', 'rgba(255, 255, 0, 0.8)', 'rgba(0, 255, 0, 0.8)'],
      ['#ff0000', '#ffff00', '#00ff00']
    );
  }
}

function atualizarGraficoProjetos() {
  const modo = document.getElementById('view-projetos').value;
  const ctx = document.getElementById('chartProjetos').getContext('2d');
  const dados = dadosGlobais.projetos;
  const prioridades = dadosGlobais.pPrioridades;

  if (chartProjetosInstance) chartProjetosInstance.destroy();

  if (modo === 'total') {
    chartProjetosInstance = criarGraficoRosca(ctx,
      ['Pendentes', 'Concluídos'],
      [dados.pendentes, dados.concluidas],
      ['rgba(255, 0, 255, 0.7)', 'rgba(0, 255, 255, 0.7)'], // Roxo e Ciano para projetos
      ['#ff00ff', '#00ffff']
    );
  } else {
    chartProjetosInstance = criarGraficoRosca(ctx,
      ['Alta', 'Média', 'Baixa'],
      [prioridades.Alta, prioridades.Media, prioridades.Baixa],
      ['rgba(255, 0, 0, 0.8)', 'rgba(255, 255, 0, 0.8)', 'rgba(0, 255, 0, 0.8)'],
      ['#ff0000', '#ffff00', '#00ff00']
    );
  }
}

function criarGraficoRosca(ctx, labels, data, bgColors, borderColors) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#00ff00', font: { family: "'Courier New'" }, boxWidth: 12 }
        }
      }
    }
  });
}

// --- HELPERS E OUTRAS FUNÇÕES (Modal, Busca, Texto) ---

function normalizarPrioridades(dados, isArray) {
    const mapa = { Alta: 0, Media: 0, Baixa: 0 };
    if (isArray && Array.isArray(dados)) {
        dados.forEach(item => {
            // Soma apenas pendentes para o gráfico de prioridade, ou total se preferir.
            // Aqui usaremos o total daquela prioridade (pendente + concluida) para mostrar volume?
            // O requisito diz "exibe apenas as prioridades". Geralmente em status, vê-se o que está ativo (Pendente).
            // Vou somar os pendentes para consistência com o texto "Prioridades (Pendentes)".
            if (mapa[item._id] !== undefined) {
                mapa[item._id] = item.pendentes; 
            }
        });
    } else if (dados) {
        return dados;
    }
    return mapa;
}

function renderizarTextos() {
  const t = dadosGlobais.tarefas;
  const p = dadosGlobais.projetos;
  const tp = dadosGlobais.tPrioridades;
  const pp = dadosGlobais.pPrioridades;

  setText('tarefas-total', (t.pendentes + t.concluidas));
  setText('tarefas-concluidas', t.concluidas);
  setText('tarefas-pendentes', t.pendentes);
  setText('tarefas-prio-alta', tp.Alta);
  setText('tarefas-prio-media', tp.Media);
  setText('tarefas-prio-baixa', tp.Baixa);

  setText('projetos-total', p.total);
  setText('projetos-concluidos', p.concluidas);
  setText('projetos-pendentes', p.pendentes);
  setText('projetos-prio-alta', pp.Alta);
  setText('projetos-prio-media', pp.Media);
  setText('projetos-prio-baixa', pp.Baixa);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || 0;
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

// --- MODAL ---
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
  const titulo = document.getElementById('modal-titulo');

  modal.style.display = 'flex';
  titulo.innerText = `>> ${tipo.toUpperCase()} [${prioridade.toUpperCase()}]`;
  lista.innerHTML = '<p class="console-text blink">Acessando banco de dados...</p>';

  try {
    let dados = await getDados(tipo);
    const filtrados = dados.filter(item => 
        item.prioridade === prioridade && item.concluido === false
    );

    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="console-text" style="color: #ffff00;">>> Nenhum registro pendente.</p>';
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
  const lista = document.getElementById('lista-resultados');
  const container = document.getElementById('resultado-busca-container');

  if (!inicio || !fim) return alert('Defina as datas de início e fim.');
  
  container.style.display = 'block';
  lista.innerHTML = '<li class="console-text blink">Buscando...</li>';

  try {
    let resultados = [];
    if (tipo === 'tarefas') {
      const res = await fetch(`/api/mongodb/tarefas/filtro/data?inicio=${inicio}&fim=${fim}`);
      if (!res.ok) throw new Error('Erro na API');
      resultados = await res.json();
    } else {
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

    lista.innerHTML = resultsToHTML(resultados, tipo);
  } catch (error) {
    console.error(error);
    lista.innerHTML = '<li style="color: red;">Falha na busca.</li>';
  }
}

function resultsToHTML(dados, tipo) {
    const cor = tipo === 'tarefas' ? '#00ff00' : '#00ffff';
    const sigla = tipo === 'tarefas' ? 'TSK' : 'PRJ';
    return dados.map(item => `
      <li style="border-bottom: 1px dashed #333; padding: 5px 0; display: flex; justify-content: space-between;">
        <span><span style="color: ${cor}; font-weight: bold;">[${sigla}]</span> ${item.nome}</span>
        <span style="font-size: 0.8em; color: #666;">${new Date(item.dataCriacao).toLocaleDateString('pt-BR')}</span>
      </li>
    `).join('');
}

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