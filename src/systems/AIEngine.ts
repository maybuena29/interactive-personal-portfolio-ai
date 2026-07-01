import { DataLoader } from '../loaders/DataLoader';
import { ConfigLoader } from '../loaders/ConfigLoader';
import type { QueryMap, PromptContext, AgentRules, Profile, Project, Experience, Education, Skills, Contact, Timeline } from '../types';

interface AIResponse {
  text: string;
  datasetsUsed: string[];
}

interface ExamplePattern {
  question: string;
  lookup: string[];
}

export class AIEngine {
  private dataLoader: DataLoader;
  private configLoader: ConfigLoader;
  private queryMap!: QueryMap;
  private promptContext!: PromptContext;
  private agentRules!: AgentRules;
  private examplePatterns: ExamplePattern[] = [];

  constructor(dataLoader: DataLoader, configLoader: ConfigLoader) {
    this.dataLoader = dataLoader;
    this.configLoader = configLoader;
  }

  async init(): Promise<void> {
    try {
      this.queryMap = await this.configLoader.loadQueryMap();
    } catch (err) {
      console.warn('AIEngine: failed to load query map', err);
      this.queryMap = { version: 1, description: '', lookupPriority: [], keywords: {}, intentMap: {}, responseStrategy: { maximumDatasets: 2, preferProjectExamples: false, preferRecentExperience: false, mergeDuplicateResults: false, includeTimelineWhenRelevant: false } };
    }
    try {
      this.promptContext = await this.configLoader.loadPromptContext();
    } catch (err) {
      console.warn('AIEngine: failed to load prompt context', err);
      this.promptContext = { version: 1, systemPrompt: [], conversation: { welcome: 'Hello! Ask me anything.', fallback: 'I\'m not sure about that.', goodbye: 'Goodbye!' }, examples: [] };
    }
    try {
      this.agentRules = await this.configLoader.loadAgentRules();
    } catch (err) {
      console.warn('AIEngine: failed to load agent rules', err);
      this.agentRules = { version: 1, identity: { name: 'Assistant', role: 'assistant' }, behavior: { tone: 'professional', friendly: true, concise: true, technicalDepth: 'moderate' }, rules: [], privacy: {}, capabilities: [], limitations: [] };
    }
    this.examplePatterns = (this.promptContext.examples || []).map((ex: any) => ({
      question: (ex.question || '').toLowerCase(),
      lookup: ex.lookup || [],
    }));
  }

  async processQuery(query: string): Promise<AIResponse> {
    const normalizedQuery = query.toLowerCase().trim();

    const datasetsToLoad = this.resolveDatasets(normalizedQuery);

    const loadedData = await this.dataLoader.loadDatasets(datasetsToLoad);

    if (loadedData.size === 0) {
      return {
        text: this.promptContext.conversation.fallback,
        datasetsUsed: [],
      };
    }

    const response = this.generateResponse(normalizedQuery, loadedData);

    return {
      text: response,
      datasetsUsed: Array.from(loadedData.keys()),
    };
  }

  private resolveDatasets(query: string): string[] {
    const matched = new Set<string>();

    for (const example of this.examplePatterns) {
      const words = example.question.split(/\s+/).filter(w => w.length > 3);
      const matchCount = words.filter(w => query.includes(w)).length;
      if (matchCount >= Math.ceil(words.length * 0.5)) {
        for (const ds of example.lookup) matched.add(ds);
      }
    }

    for (const [keyword, datasets] of Object.entries(this.queryMap.keywords)) {
      if (query.includes(keyword.toLowerCase())) {
        for (const ds of datasets) matched.add(ds);
      }
    }

    for (const [intent, datasets] of Object.entries(this.queryMap.intentMap)) {
      if (query.includes(intent.toLowerCase())) {
        for (const ds of datasets) matched.add(ds);
      }
    }

    if (matched.size === 0) {
      for (const ds of this.queryMap.lookupPriority.slice(0, 2)) {
        matched.add(ds);
      }
    }

    const strategy = this.queryMap.responseStrategy;
    return Array.from(matched).slice(0, strategy.maximumDatasets);
  }

  private generateResponse(query: string, data: Map<string, any>): string {
    const parts: string[] = [];
    const isConcise = this.agentRules.behavior.concise;
    const maxItems = isConcise ? 3 : 5;

    if (data.has('profile')) {
      const p = data.get('profile') as Profile;
      if (query.includes('introduce') || query.includes('who') || query.includes('about') || query.includes('summary')) {
        parts.push(`${p.personal.displayName} — ${p.personal.title}`);
        parts.push(`Current: ${p.professionalProfile.currentRole} at ${p.professionalProfile.currentCompany}`);
        parts.push(`Specialties: ${p.professionalProfile.specialization.slice(0, 4).join(', ')}`);
        parts.push(`\n${p.about.summary || ''}`);
      } else {
        parts.push(`${p.personal.displayName} - ${p.personal.title}`);
        parts.push(`Role: ${p.professionalProfile.currentRole} @ ${p.professionalProfile.currentCompany}`);
        parts.push(`Strengths: ${p.strengths.slice(0, maxItems).join(', ')}`);
        if (query.includes('location') || query.includes('country')) {
          parts.push(`Location: ${p.personal.location.country}`);
        }
      }
    }

    if (data.has('skills')) {
      const s = data.get('skills') as Skills;
      if (query.includes('backend') || query.includes('framework') || query.includes('laravel')) {
        const backendCat = s.categories.find(c => c.id === 'backend' || c.title.toLowerCase().includes('backend'));
        if (backendCat) {
          parts.push(`\nBackend: ${backendCat.skills.slice(0, maxItems).join(', ')}`);
        }
      }
      if (query.includes('frontend') || query.includes('react') || query.includes('ui')) {
        const frontendCat = s.categories.find(c => c.id === 'frontend' || c.title.toLowerCase().includes('frontend'));
        if (frontendCat) {
          parts.push(`\nFrontend: ${frontendCat.skills.slice(0, maxItems).join(', ')}`);
        }
      }
      if (query.includes('database') || query.includes('sql') || query.includes('mysql')) {
        const dbCat = s.categories.find(c => c.id === 'database' || c.title.toLowerCase().includes('database'));
        if (dbCat) {
          parts.push(`\nDatabases: ${dbCat.skills.slice(0, maxItems).join(', ')}`);
        }
      }
      if (query.includes('devops') || query.includes('ci') || query.includes('deploy')) {
        const devopsCat = s.categories.find(c => c.id === 'devops' || c.title.toLowerCase().includes('devops'));
        if (devopsCat) {
          parts.push(`\nDevOps: ${devopsCat.skills.slice(0, maxItems).join(', ')}`);
        }
      }
      if (!parts.some(p => p.includes('Backend') || p.includes('Frontend') || p.includes('Database') || p.includes('DevOps'))) {
        const featured = s.featuredSkills?.slice(0, maxItems) || [];
        if (featured.length > 0) {
          parts.push(`\nKey skills: ${featured.join(', ')}`);
        }
        for (const cat of s.categories) {
          parts.push(`\n${cat.title}: ${cat.skills.slice(0, 3).join(', ')}`);
        }
      }
    }

    if (data.has('experience')) {
      const exps = data.get('experience') as Experience[];
      const sortedExps = [...exps].sort((a, b) => b.start.localeCompare(a.start));
      if (query.includes('company') || query.includes('companies') || query.includes('worked')) {
        const companies = sortedExps.map(e => `${e.company} (${e.position})`);
        parts.push(`\nCompanies: ${companies.join(', ')}`);
      } else {
        for (const exp of sortedExps) {
          const techs = exp.technologies?.slice(0, maxItems).join(', ') || '';
          parts.push(`\n${exp.position} @ ${exp.company} (${exp.start} - ${exp.end || 'Present'})`);
          if (exp.summary) parts.push(`  ${exp.summary.slice(0, 150)}`);
          if (techs) parts.push(`  Tech: ${techs}`);
        }
      }
    }

    if (data.has('projects')) {
      const projs = data.get('projects') as Project[];
      const needFiltered = projs;

      for (const proj of needFiltered.slice(0, maxItems)) {
        const techs = proj.technologies?.slice(0, maxItems).join(', ') || '';
        parts.push(`\n${proj.title} (${proj.category || 'Project'})`);
        if (proj.summary) parts.push(`  ${proj.summary.slice(0, 150)}`);
        if (techs) parts.push(`  Tech: ${techs}`);
      }

      if (projs.length > maxItems) {
        parts.push(`\n... and ${projs.length - maxItems} more ${query.includes('all') ? '' : '(ask for all)'}`);
      }
    }

    if (data.has('education')) {
      const edus = data.get('education') as Education[];
      const sortedEdus = [...edus].sort((a, b) => b.startYear - a.startYear);
      for (const edu of sortedEdus) {
        const honors = edu.honors?.length ? ` — ${edu.honors.join(', ')}` : '';
        parts.push(`\n${edu.institution} (${edu.startYear} - ${edu.endYear})${honors}`);
        parts.push(`  ${edu.program}${edu.specialization ? ` — ${edu.specialization}` : ''}`);
        if (edu.thesis) parts.push(`  Thesis: ${edu.thesis.title}`);
      }
    }

    if (data.has('contact')) {
      const c = data.get('contact') as Contact;
      if (query.includes('email')) parts.push(`\nEmail: ${c.email}`);
      if (query.includes('github')) parts.push(`\nGitHub: ${c.github?.url || ''}`);
      if (query.includes('resume') || query.includes('cv')) {
        parts.push(`\nResume available for download.`);
      }
      if (!query.includes('email') && !query.includes('github') && !query.includes('resume') && !query.includes('cv')) {
        parts.push(`\nContact: ${c.email} | GitHub: ${c.github?.username || ''}`);
      }
    }

    if (data.has('timeline')) {
      const tl = data.get('timeline') as Timeline[];
      const sortedTl = [...tl].sort((a, b) => b.year - a.year);
      if (query.includes('timeline') || query.includes('journey') || query.includes('history') || query.includes('milestone')) {
        for (const t of sortedTl) {
          parts.push(`\n${t.year} — ${t.title}`);
          if (t.description) parts.push(`  ${t.description.slice(0, 100)}`);
        }
      }
    }

    if (parts.length === 0) {
      return this.promptContext.conversation.fallback;
    }

    if (parts.length > 8 && isConcise) {
      return parts.slice(0, 6).join('\n').slice(0, 500) + '\n\nAsk for details on any topic.';
    }

    return parts.join('\n').slice(0, 1000);
  }

  getWelcomeMessage(): string {
    return this.promptContext.conversation.welcome;
  }

  getGoodbyeMessage(): string {
    return this.promptContext.conversation.goodbye;
  }

  getAgentRules(): AgentRules {
    return this.agentRules;
  }
}
