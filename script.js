// Configuração fixa do estudante (não permitir alteração pela página)
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 19,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Armazenamento em memória de sessão (PIN não é salvo no navegador)
let pinSessao = "";

// Dados brutos das 15 disciplinas do 9º Ano (Dados Locais / Fictícios Padrão)
const dadosDisciplinasPadrao = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Estado atual dos dados exibidos na tela
let dadosDisciplinasAtuais = [];

// Função obrigatória para ajustar e validar as notas na escala de 0 a 10 (DADOS ANTIGOS / LOCAIS)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null; // Nota ainda não lançada
  }

  // Converte texto com vírgula para número com ponto decimal
  let str = String(valor).replace(",", ".");
  let num = parseFloat(str);

  if (isNaN(num)) {
    return null; // Valor inválido
  }

  // Se o valor for entre 0 e 10
  if (num >= 0 && num <= 10) {
    return num;
  }

  // Se for maior que 10 e até 100 (ex: 82 vira 8.2, 100 vira 10.0)
  if (num > 10 && num <= 100) {
    return num / 10;
  }

  // Fora do padrão aceito
  return null;
}

// Função para formatar a nota para exibição na tabela
function formatarNotaExibicao(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  return Number(nota).toFixed(1).replace(".", ",");
}

// Função principal que processa os dados e preenche a página
function carregarBoletim() {
  const tabelaCorpo = document.getElementById("tabela-boletim");
  tabelaCorpo.innerHTML = ""; // Limpa a tabela antes de preencher

  let somaMedias = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosDisciplinasAtuais.forEach((item) => {
    // Normaliza as notas de cada trimestre
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média das notas disponíveis (ignorando nulas)
    let somaNotas = 0;
    let qtdNotas = 0;

    if (n1 !== null) { somaNotas += n1; qtdNotas++; }
    if (n2 !== null) { somaNotas += n2; qtdNotas++; }
    if (n3 !== null) { somaNotas += n3; qtdNotas++; }

    let media = null;
    let situacaoTexto = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (qtdNotas > 0) {
      media = somaNotas / qtdNotas;
      somaMedias += media;
      totalDisciplinasComMedia++;

      if (media >= 6.0) {
        situacaoTexto = "Bom desempenho";
        classeSituacao = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacaoTexto = "Atenção";
        classeSituacao = "situacao-atencao";
        qtdAtencao++;
      }
    }

    // Trata e soma as faltas dos trimestres
    let totalFaltasDisc = 0;
    if (Array.isArray(item.faltas)) {
      totalFaltasDisc = item.faltas.reduce((a, b) => a + (Number(b) || 0), 0);
    } else if (typeof item.faltas === "number") {
      totalFaltasDisc = item.faltas;
    }
    totalFaltasGeral += totalFaltasDisc;

    // Cria a linha da tabela via DOM (Segurança contra XSS usando textContent)
    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    const strongDisc = document.createElement("strong");
    strongDisc.textContent = item.disciplina;
    tdDisc.appendChild(strongDisc);

    const tdN1 = document.createElement("td");
    tdN1.textContent = formatarNotaExibicao(n1);

    const tdN2 = document.createElement("td");
    tdN2.textContent = formatarNotaExibicao(n2);

    const tdN3 = document.createElement("td");
    tdN3.textContent = formatarNotaExibicao(n3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNotaExibicao(media);
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasDisc;

    const tdSit = document.createElement("td");
    tdSit.className = classeSituacao;
    tdSit.textContent = situacaoTexto;

    tr.appendChild(tdDisc);
    tr.appendChild(tdN1);
    tr.appendChild(tdN2);
    tr.appendChild(tdN3);
    tr.appendChild(tdMedia);
    tr.appendChild(tdFaltas);
    tr.appendChild(tdSit);

    tabelaCorpo.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo/lateral
  const mediaGeralCalculada = totalDisciplinasComMedia > 0 ? (somaMedias / totalDisciplinasComMedia) : 0;
  
  document.getElementById("card-media").textContent = mediaGeralCalculada.toFixed(1).replace(".", ",");
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;
}

// --- INTEGRAÇÃO COM A API ---

// Função de Login / Abrir Boletim
async function fazerLogin() {
  const pinInput = document.getElementById("pin-input");
  const msgLogin = document.getElementById("login-mensagem");
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite seu PIN.";
    msgLogin.className = "mensagem-status status-erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status status-info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status status-erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status status-erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status status-erro";
      return;
    }

    const resDados = await resposta.json();

    // Login com sucesso: guarda o PIN estritamente em memória de sessão
    pinSessao = pinDigitado;
    pinInput.value = ""; // Limpa a senha do campo de texto

    // Regra: Se dados da API existirem (não for null), usa dados da API. Se for null/novo, usa dados locais.
    if (resDados && resDados.dados && Array.isArray(resDados.dados.disciplinas) && resDados.dados.disciplinas.length > 0) {
      dadosDisciplinasAtuais = resDados.dados.disciplinas;
    } else {
      dadosDisciplinasAtuais = JSON.parse(JSON.stringify(dadosDisciplinasPadrao));
    }

    // Oculta tela de login e exibe conteúdo do boletim
    document.getElementById("area-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";

    carregarBoletim();

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status status-erro";
  }
}

// --- EDIÇÃO E SALVAMENTO ---

// Função para abrir o formulário de edição
function abrirEdicao() {
  const containerDisciplinas = document.getElementById("lista-edicao-disciplinas");
  containerDisciplinas.innerHTML = "";
  document.getElementById("erro-edicao").textContent = "";

  dadosDisciplinasAtuais.forEach((item, idx) => {
    const divItem = document.createElement("div");
    divItem.className = "item-edicao";

    const titulo = document.createElement("h4");
    titulo.textContent = item.disciplina;
    divItem.appendChild(titulo);

    const grid = document.createElement("div");
    grid.className = "campos-grid";

    // Pega notas normalizadas ou originais para exibição no campo
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    let f1 = 0, f2 = 0, f3 = 0;
    if (Array.isArray(item.faltas)) {
      f1 = item.faltas[0] ?? 0;
      f2 = item.faltas[1] ?? 0;
      f3 = item.faltas[2] ?? 0;
    }

    grid.innerHTML = `
      <div class="campo-box">
        <label>1º Tri (Nota)</label>
        <input type="text" id="edit-n1-${idx}" value="${n1 !== null ? String(n1).replace('.', ',') : ''}" placeholder="0 - 10">
      </div>
      <div class="campo-box">
        <label>2º Tri (Nota)</label>
        <input type="text" id="edit-n2-${idx}" value="${n2 !== null ? String(n2).replace('.', ',') : ''}" placeholder="0 - 10">
      </div>
      <div class="campo-box">
        <label>3º Tri (Nota)</label>
        <input type="text" id="edit-n3-${idx}" value="${n3 !== null ? String(n3).replace('.', ',') : ''}" placeholder="0 - 10">
      </div>
      <div class="campo-box">
        <label>1º Tri (Faltas)</label>
        <input type="number" id="edit-f1-${idx}" value="${f1}" min="0">
      </div>
      <div class="campo-box">
        <label>2º Tri (Faltas)</label>
        <input type="number" id="edit-f2-${idx}" value="${f2}" min="0">
      </div>
      <div class="campo-box">
        <label>3º Tri (Faltas)</label>
        <input type="number" id="edit-f3-${idx}" value="${f3}" min="0">
      </div>
    `;

    divItem.appendChild(grid);
    containerDisciplinas.appendChild(divItem);
  });

  document.getElementById("area-edicao").style.display = "block";
}

// Função de validação rigorosa das NOTAS digitadas pelo aluno (0 a 10, ponto/vírgula ou vazio)
function validarNotaDigitada(str) {
  if (str === null || str === undefined) return { ok: true, valor: null };
  const texto = String(str).trim();
  if (texto === "") return { ok: true, valor: null };

  const textoComPonto = texto.replace(",", ".");
  const num = Number(textoComPonto);

  if (isNaN(num) || num < 0 || num > 10) {
    return { ok: false, valor: null };
  }

  return { ok: true, valor: num };
}

// Função de validação das FALTAS digitadas pelo aluno (inteiro >= 0)
function validarFaltaDigitada(str) {
  if (str === null || str === undefined) return { ok: false, valor: null };
  const texto = String(str).trim();
  if (texto === "") return { ok: false, valor: null };

  const num = Number(texto);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { ok: false, valor: null };
  }

  return { ok: true, valor: num };
}

// Função para Salvar Alterações na API
async function salvarAlteracoes() {
  const msgErro = document.getElementById("erro-edicao");
  const msgStatusGlobal = document.getElementById("status-mensagem");
  msgErro.textContent = "";

  const novasDisciplinas = [];

  // Loop de validação de todos os campos
  for (let idx = 0; idx < dadosDisciplinasAtuais.length; idx++) {
    const discNome = dadosDisciplinasAtuais[idx].disciplina;

    const valN1 = document.getElementById(`edit-n1-${idx}`).value;
    const valN2 = document.getElementById(`edit-n2-${idx}`).value;
    const valN3 = document.getElementById(`edit-n3-${idx}`).value;

    const valF1 = document.getElementById(`edit-f1-${idx}`).value;
    const valF2 = document.getElementById(`edit-f2-${idx}`).value;
    const valF3 = document.getElementById(`edit-f3-${idx}`).value;

    const resN1 = validarNotaDigitada(valN1);
    const resN2 = validarNotaDigitada(valN2);
    const resN3 = validarNotaDigitada(valN3);

    const resF1 = validarFaltaDigitada(valF1);
    const resF2 = validarFaltaDigitada(valF2);
    const resF3 = validarFaltaDigitada(valF3);

    if (!resN1.ok || !resN2.ok || !resN3.ok) {
      msgErro.textContent = `Nota inválida na matéria "${discNome}". Digite apenas valores de 0 a 10.`;
      return;
    }

    if (!resF1.ok || !resF2.ok || !resF3.ok) {
      msgErro.textContent = `Falta inválida na matéria "${discNome}". Digite apenas números inteiros maiores ou iguais a 0.`;
      return;
    }

    novasDisciplinas.push({
      disciplina: discNome,
      tri1: resN1.valor,
      tri2: resN2.valor,
      tri3: resN3.valor,
      faltas: [resF1.valor, resF2.valor, resF3.valor]
    });
  }

  msgStatusGlobal.textContent = "Salvando...";
  msgStatusGlobal.className = "mensagem-status status-info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgStatusGlobal.textContent = "Falha ao salvar as alterações. Tente novamente.";
      msgStatusGlobal.className = "mensagem-status status-erro";
      return;
    }

    // Sucesso ao salvar na API
    dadosDisciplinasAtuais = novasDisciplinas;
    carregarBoletim();

    document.getElementById("area-edicao").style.display = "none";
    msgStatusGlobal.textContent = "Dados salvos com sucesso.";
    msgStatusGlobal.className = "mensagem-status status-sucesso";

  } catch (erro) {
    msgStatusGlobal.textContent = "Não foi possível conectar ao servidor para salvar. Tente novamente.";
    msgStatusGlobal.className = "mensagem-status status-erro";
  }
}

// Event Listeners (Conectar botões com as funções)
document.getElementById("btn-entrar").addEventListener("click", fazerLogin);

document.getElementById("pin-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") fazerLogin();
});

document.getElementById("btn-editar").addEventListener("click", abrirEdicao);
document.getElementById("btn-salvar").addEventListener("click", salvarAlteracoes);

document.getElementById("btn-cancelar").addEventListener("click", () => {
  document.getElementById("area-edicao").style.display = "none";
});