/**
 * Hard - Internationalization & Localization Dictionary
 * Default: English (en-US), Extensible: Portuguese (pt-BR)
 * SPDX-License-Identifier: Apache-2.0
 */

export type SupportedLanguage = 'en' | 'pt-BR';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  // Nav
  navDashboard: string;
  navClean: string;
  navApps: string;
  navStartup: string;
  navDisk: string;
  navMaintenance: string;
  navMonitor: string;
  navSettings: string;
  navActivityLog: string;
  
  // Header
  searchPlaceholder: string;
  safeModeActive: string;
  safeModeOff: string;
  userElevation: string;
  adminElevation: string;
  moleCliConnected: string;
  moleCliDisconnected: string;

  // Actions
  smartClean: string;
  appCleanup: string;
  startupManager: string;
  diskAnalysis: string;
  systemMaintenance: string;
  dryRunMode: string;
  reviewAndDelete: string;
  cancel: string;
  confirm: string;
  recycleBinProtected: string;
  
  // Dashboard
  systemHealth: string;
  systemHealthSummary: string;
  attentionItems: string;
  diskSpace: string;
  memoryUsage: string;
  cpuUsage: string;
  gpuUsage: string;
  networkActivity: string;
  startupImpact: string;
  
  // Smart Clean
  scanReviewHeading: string;
  scanReviewSubheading: string;
  reclaimableTotal: string;
  selectedForRemoval: string;
  protectedItemsSkipped: string;
  mandatoryDryRunNote: string;
  
  // Common
  safe: string;
  lowRisk: string;
  moderateRisk: string;
  highRisk: string;
  criticalRisk: string;
  bytes: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'Hard',
    tagline: 'Clean, optimize, and understand your Windows PC.',
    navDashboard: 'Dashboard',
    navClean: 'Smart Clean',
    navApps: 'Applications',
    navStartup: 'Startup & Tasks',
    navDisk: 'Disk Analyzer',
    navMaintenance: 'Maintenance',
    navMonitor: 'Live Monitor',
    navSettings: 'Settings',
    navActivityLog: 'Activity Log',

    searchPlaceholder: 'Search actions or press Ctrl+K...',
    safeModeActive: 'Safe Mode Active',
    safeModeOff: 'Standard Mode',
    userElevation: 'User Mode',
    adminElevation: 'Administrator',
    moleCliConnected: 'Mole CLI Bridge Connected',
    moleCliDisconnected: 'Mole CLI Bridge Offline',

    smartClean: 'Smart Clean',
    appCleanup: 'App Cleanup',
    startupManager: 'Startup Manager',
    diskAnalysis: 'Disk Analysis',
    systemMaintenance: 'System Maintenance',
    dryRunMode: 'Dry Run Only',
    reviewAndDelete: 'Review & Delete Selected',
    cancel: 'Cancel',
    confirm: 'Confirm Deletion',
    recycleBinProtected: 'Files sent to Recycle Bin for safe recovery',

    systemHealth: 'System Health & Overview',
    systemHealthSummary: 'Hardware sensors and storage integrity are nominal. Non-destructive clean candidates identified.',
    attentionItems: 'Attention Summary',
    diskSpace: 'Storage & Drives',
    memoryUsage: 'Memory (RAM)',
    cpuUsage: 'CPU Utilization',
    gpuUsage: 'Graphics (GPU)',
    networkActivity: 'Network Throughput',
    startupImpact: 'Startup Impact',

    scanReviewHeading: 'Review Reclaimable Space',
    scanReviewSubheading: 'All candidates are verified with a mandatory dry run. No items are deleted without explicit confirmation.',
    reclaimableTotal: 'Total Reclaimable',
    selectedForRemoval: 'Selected for Clean',
    protectedItemsSkipped: 'Protected Items Skipped',
    mandatoryDryRunNote: 'Dry Run Guarantee: Zero bytes are removed until you confirm the exact file list.',

    safe: 'Safe',
    lowRisk: 'Low Risk',
    moderateRisk: 'Moderate Risk',
    highRisk: 'High Risk',
    criticalRisk: 'Critical System',
    bytes: 'Bytes',
  },
  'pt-BR': {
    appName: 'Hard',
    tagline: 'Limpe, otimize e compreenda o seu PC com Windows.',
    navDashboard: 'Painel',
    navClean: 'Limpeza Inteligente',
    navApps: 'Aplicativos',
    navStartup: 'Inicialização & Tarefas',
    navDisk: 'Analisador de Disco',
    navMaintenance: 'Manutenção',
    navMonitor: 'Monitor ao Vivo',
    navSettings: 'Configurações',
    navActivityLog: 'Registro de Atividades',

    searchPlaceholder: 'Pesquisar ações ou pressione Ctrl+K...',
    safeModeActive: 'Modo Seguro Ativo',
    safeModeOff: 'Modo Padrão',
    userElevation: 'Modo Usuário',
    adminElevation: 'Administrador',
    moleCliConnected: 'Ponte Mole CLI Conectada',
    moleCliDisconnected: 'Ponte Mole CLI Desconectada',

    smartClean: 'Limpeza Inteligente',
    appCleanup: 'Limpeza de Apps',
    startupManager: 'Gerenciador de Inicialização',
    diskAnalysis: 'Análise de Disco',
    systemMaintenance: 'Manutenção do Sistema',
    dryRunMode: 'Apenas Simulação',
    reviewAndDelete: 'Revisar e Excluir Seleção',
    cancel: 'Cancelar',
    confirm: 'Confirmar Exclusão',
    recycleBinProtected: 'Arquivos enviados para a Lixeira para recuperação segura',

    systemHealth: 'Saúde e Visão Geral do Sistema',
    systemHealthSummary: 'Sensores de hardware e integridade de armazenamento nominais. Candidatos a limpeza não-destrutiva encontrados.',
    attentionItems: 'Resumo de Atenção',
    diskSpace: 'Armazenamento & Discos',
    memoryUsage: 'Memória (RAM)',
    cpuUsage: 'Uso do Processador (CPU)',
    gpuUsage: 'Gráficos (GPU)',
    networkActivity: 'Taxa de Rede',
    startupImpact: 'Impacto na Inicialização',

    scanReviewHeading: 'Revisão de Espaço Recuperável',
    scanReviewSubheading: 'Todos os itens são validados por simulação obrigatória. Nada é excluído sem confirmação explícita.',
    reclaimableTotal: 'Total Recuperável',
    selectedForRemoval: 'Selecionado para Limpeza',
    protectedItemsSkipped: 'Itens Protegidos Ignorados',
    mandatoryDryRunNote: 'Garantia de Simulação: Zero bytes removidos até você aprovar a lista exata.',

    safe: 'Seguro',
    lowRisk: 'Baixo Risco',
    moderateRisk: 'Risco Moderado',
    highRisk: 'Alto Risco',
    criticalRisk: 'Sistema Crítico',
    bytes: 'Bytes',
  },
};
