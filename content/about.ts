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
  // content.md §3.1 marca a foto real (public/mentor.jpg) como pendência do
  // mentor (⚠️) - o componente que lê este módulo (T32) usa um placeholder
  // de iniciais "RL" enquanto o arquivo não existir (default já registrado
  // em content.md §14 item 2). Este módulo não referencia o arquivo de
  // imagem porque ele ainda não existe.
  photoInitials: "RL",
  bioLong: [
    "Comecei como estagiário de TI em 2002. De lá para cá, passei por infraestrutura e segurança da informação, gestão de projetos, produto e liderança de times - hoje sou Gerente de Tecnologia na Betha Sistemas, onde lidero squads que constroem software usado por prefeituras de todo o Brasil, incluindo iniciativas de inteligência artificial aplicada à gestão pública.",
    "Em paralelo, passei mais de 14 anos em sala de aula. Na ULBRA Torres, coordenei o curso de Análise e Desenvolvimento de Sistemas: assumi em 2019 com 80 alunos e o curso em processo de extinção, e entreguei em 2026 com 288 alunos, o melhor curso de ADS do Rio Grande do Sul no ENADE 2021 e 80% de empregabilidade entre os formandos de 2022 a 2025. Orientei 67 projetos de alunos, da definição do problema à entrega. Hoje sigo como professor na Graduação Online da PUCRS.",
    "Também coordenei 12 trilhas no TDC - The Developer's Conference (Educação, Android, Mobile, Blockchain e TDC4Kids) entre 2016 e 2020, e liderei a implantação do Google Workspace na rede estadual de ensino do RS, que atendeu 2 milhões de alunos.",
    "Ou seja: eu sei o que um recrutador procura, porque estou do lado de quem contrata - e sei como transformar o que você já sabe em algo que ele consiga enxergar, porque passei a carreira ensinando gente a dar esse passo.",
  ],
  bioShort:
    "Ramon Lummertz é Gerente de Tecnologia na Betha Sistemas e professor na PUCRS. Com mais de 20 anos em TI e 14 em sala de aula, coordenou o melhor curso de ADS do RS no ENADE 2021 e levou 80% dos formandos ao mercado.",
  stats: [
    { value: "20+ anos", label: "em tecnologia, de estagiário a Gerente de Tecnologia" },
    { value: "80%", label: "de empregabilidade dos formandos que coordenei (2022-2025)" },
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
  ],
  linkedinUrl: "https://www.linkedin.com/in/ramonsl/",
  linkedinLabel: "Ver perfil no LinkedIn",
};
