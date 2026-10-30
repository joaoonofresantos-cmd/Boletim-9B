// Dados brutos das 15 disciplinas do 9º Ano
const dadosDisciplinas = [
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

// Função obrigatória para ajustar e validar as notas na escala de 0 a 10
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
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
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

  // NOTA SOBRE A FREQUÊNCIA:
  // A frequência de 92% exibida no card é APENAS DEMONSTRATIVA/FICTÍCIA para esta primeira versão.
  // Ela não é calculada a partir do total de faltas nesta etapa.

  dadosDisciplinas.forEach((item) => {
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

    // Soma as faltas dos trimestres
    const totalFaltasDisc = item.faltas.reduce((a, b) => a + b, 0);
    totalFaltasGeral += totalFaltasDisc;

    // Cria a linha da tabela via DOM
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarNotaExibicao(n1)}</td>
      <td>${formatarNotaExibicao(n2)}</td>
      <td>${formatarNotaExibicao(n3)}</td>
      <td><strong>${formatarNotaExibicao(media)}</strong></td>
      <td>${totalFaltasDisc}</td>
      <td class="${classeSituacao}">${situacaoTexto}</td>
    `;
    tabelaCorpo.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo/lateral
  const mediaGeralCalculada = totalDisciplinasComMedia > 0 ? (somaMedias / totalDisciplinasComMedia) : 0;
  
  document.getElementById("card-media").textContent = mediaGeralCalculada.toFixed(1).replace(".", ",");
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;
}

// Executa a função quando a página carrega
carregarBoletim();