// Transcrito de .specs/features/landing-mentoria/content.md §3
// (cabeçalho, bio longa, bio curta, stat tiles, credenciais, link do LinkedIn).

export interface AboutStat {
  value: string;
  label: string;
}

export const ABOUT_MENTOR = {
  name: "Ramon Lummertz",
  jobTitle: "Gerente de Tecnologia na Betha Sistemas · Professor na PUCRS",
  location: "Torres, RS - atendimento 100% online",
  // Fallback textual mantido para usos que precisem de uma identificação curta
  // além da foto local em public/mentor.jpg.
  photoInitials: "RL",
  bioLong: [
    "Comecei como estagiário de TI em 2002. Passei por infraestrutura, segurança da informação, projetos, produto e liderança de times — hoje sou Gerente de Tecnologia na Betha Sistemas, onde lidero squads que constroem software para prefeituras de todo o Brasil. Ou seja: estou todos os dias do lado de quem contrata.",
    "Em paralelo, são mais de 14 anos em sala de aula. Na ULBRA Torres, coordenei o curso de Análise e Desenvolvimento de Sistemas, onde 80% dos formandos de 2022 a 2025 saíram empregados. Hoje sou professor na PUCRS. Ao longo desse tempo, a parte do trabalho que mais gerou resultado sempre foi a mesma: revisar currículo, preparar para entrevista e fazer a ponte com o mercado.",
    "A mentoria nasceu para fazer exatamente isso, com tempo dedicado e acompanhamento individual. E ela não é um curso: conteúdo bom já existe de sobra por aí. O que eu entrego é o que nenhum conteúdo genérico entrega — olhar para o seu currículo, o seu código e a sua situação, e te dizer exatamente o que ajustar.",
  ],
  bioShort:
    "Ramon Lummertz é Gerente de Tecnologia na Betha Sistemas e professor na PUCRS. Com mais de 20 anos em TI e 14 em sala de aula, coordenou o melhor curso de ADS do RS no ENADE 2021 e levou 80% dos formandos ao mercado.",
  stats: [
    { value: "80%", label: "de empregabilidade dos formandos que coordenei (2022-2025)" },
    { value: "20+ anos", label: "em tecnologia, de estagiário a Gerente de Tecnologia" },
    { value: "67", label: "projetos de alunos orientados" },
    { value: "12", label: "trilhas coordenadas no TDC" },
  ] satisfies AboutStat[],
  credentials: [
    "Mestre em Ensino de Ciências e Matemática",
    "Bacharel em Sistemas de Informação",
    "Pós-graduação em Ciência de Dados e IA (PUCRS), Governança de TI e Tecnologia Educacional",
    "Certificações: Product Owner, Scrum Master e Advanced Scrum Master (A-CSM)",
    // content.md §3.5 marca a nomenclatura exata como pendente de
    // confirmação ("BASis/INEP") - mantido o texto de content.md como
    // default, sem inventar uma nomenclatura alternativa.
    "Avaliador do INEP/MEC (cursos superiores)",
    "Coordenador de 12 trilhas no TDC – The Developer's Conference (2016–2020)",
    "Liderou a implantação do Google Workspace na rede estadual de ensino do RS (2 milhões de alunos)",
  ],
  linkedinUrl: "https://www.linkedin.com/in/ramonsl/",
  linkedinLabel: "Ver perfil no LinkedIn",
};
