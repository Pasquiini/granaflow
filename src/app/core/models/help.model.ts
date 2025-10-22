export type FaqItem = { q: string; a: string };
export type Step = { id: string; title: string; desc: string; route?: string };

export const FAQ: FaqItem[] = [
  { q: 'Como cadastrar minha primeira conta?', a: 'Vá em Contas → Novo, preencha o nome (ex.: “Banco X”) e salve.' },
  { q: 'Como importar transações do CSV?', a: 'Transações → Importar CSV. Baixe o modelo, preencha e envie.' },
  { q: 'Como criar um orçamento mensal?', a: 'Orçamentos → Novo. Escolha categoria, valor mensal e período.' },
  { q: 'Como cancelar minha assinatura?', a: 'Billing → Assinatura → Cancelar. Sua conta volta ao plano FREE.' },
  { q: 'Meu cartão não sincroniza, e agora?', a: 'Verifique a conexão e tente de novo. Persistindo, fale no WhatsApp.' },
];

export const ONBOARDING_STEPS: Step[] = [
  { id: 'acc', title: 'Crie sua primeira conta', desc: 'Defina onde seu dinheiro vive.', route: '/accounts' },
  { id: 'tx',  title: 'Adicione uma transação',   desc: 'Registre entrada ou saída.',     route: '/transactions' },
  { id: 'bdg', title: 'Defina um orçamento',      desc: 'Segure os gastos por categoria.', route: '/budgets' },
  { id: 'rep', title: 'Veja relatórios',          desc: 'Entenda para onde vai seu dinheiro.', route: '/reports' },
];
