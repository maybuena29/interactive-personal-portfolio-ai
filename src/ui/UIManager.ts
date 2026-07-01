import { AIEngine } from '../systems/AIEngine';
import { InteractionSystem } from '../systems/InteractionSystem';
import { DataLoader } from '../loaders/DataLoader';
import { ConfigLoader } from '../loaders/ConfigLoader';
import { AnimationManager } from '../animations';

export class UIManager {
  private aiEngine: AIEngine;
  private interactionSystem: InteractionSystem;
  private dataLoader: DataLoader;
  private animationManager: AnimationManager;
  private container: HTMLDivElement;
  private overlay: HTMLDivElement;
  private initialized = false;
  private crosshair: HTMLDivElement;
  private interactPrompt: HTMLDivElement;
  private hudText: HTMLDivElement;
  private toastContainer: HTMLDivElement;
  private isMobile = false;

  constructor(aiEngine: AIEngine, interactionSystem: InteractionSystem, configLoader: ConfigLoader, animationManager: AnimationManager) {
    this.aiEngine = aiEngine;
    this.interactionSystem = interactionSystem;
    this.dataLoader = new DataLoader(configLoader);
    this.animationManager = animationManager;

    this.overlay = document.createElement('div');
    this.overlay.id = 'ui-overlay';
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 100; font-family: 'Courier New', monospace;
    `;
    document.body.appendChild(this.overlay);

    this.crosshair = document.createElement('div');
    this.crosshair.id = 'crosshair';
    this.crosshair.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 20px; height: 20px; z-index: 150; pointer-events: none;
      display: none;
    `;
    this.crosshair.innerHTML = `
      <div style="position:absolute;top:50%;left:0;width:100%;height:1px;background:rgba(255,255,255,0.5);"></div>
      <div style="position:absolute;top:0;left:50%;width:1px;height:100%;background:rgba(255,255,255,0.5);"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.7);"></div>
    `;
    document.body.appendChild(this.crosshair);

    this.interactPrompt = document.createElement('div');
    this.interactPrompt.id = 'interact-prompt';
    this.interactPrompt.style.cssText = `
      position: fixed; bottom: 15%; left: 50%; transform: translateX(-50%);
      color: #66ccff; font-size: 13px; z-index: 150; pointer-events: none;
      text-align: center; opacity: 0; transition: opacity 0.2s ease;
      text-shadow: 0 0 8px rgba(102,204,255,0.3);
    `;
    document.body.appendChild(this.interactPrompt);

    this.container = document.createElement('div');
    this.container.id = 'ui-panels';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 200;
    `;
    document.body.appendChild(this.container);

    this.hudText = document.createElement('div');
    this.hudText.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.5); font-family: 'Courier New', monospace;
      font-size: 12px; text-align: center; pointer-events: none; z-index: 50;
    `;
    this.overlay.appendChild(this.hudText);

    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 1000; pointer-events: none; display: flex;
      flex-direction: column; align-items: center; gap: 8px;
    `;
    document.body.appendChild(this.toastContainer);
  }

  showToast(message: string, type: 'info' | 'unlock' | 'success' = 'info'): void {
    const colors = { info: '#66ccff', unlock: '#ffcc44', success: '#33ff33' };
    const color = colors[type];

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(0,0,0,0.85); border: 1px solid ${color};
      color: ${color}; padding: 10px 20px; border-radius: 4px;
      font-family: 'Courier New', monospace; font-size: 13px;
      pointer-events: auto; box-shadow: 0 0 20px rgba(0,0,0,0.5);
      opacity: 0; transform: translateY(-10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      text-align: center;
    `;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    await this.dataLoader.init();
    await this.aiEngine.init();

    this.createStyles();

    this.interactionSystem.onInteract((state) => {
      this.handleInteraction(state);
    });

    this.interactionSystem.onInteractionEnd(() => {
      this.clearPanels();
    });

    this.updateHUDText();
  }

  private updateHUDText(): void {
    if (this.isMobile) {
      this.hudText.textContent = 'Tap objects to explore';
    } else {
      this.hudText.textContent = 'Click to move | E to interact | ESC to close';
    }
  }

  showCrosshair(): void {
    this.crosshair.style.display = 'block';
  }

  hideCrosshair(): void {
    this.crosshair.style.display = 'none';
  }

  showInteractPrompt(objectName: string): void {
    const key = this.isMobile ? 'Tap' : 'Press E';
    this.interactPrompt.textContent = `${key} to interact with ${objectName}`;
    this.interactPrompt.style.opacity = '1';
  }

  hideInteractPrompt(): void {
    this.interactPrompt.style.opacity = '0';
  }

  private createStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .ui-terminal { position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
        width: 600px; max-width: 90vw; max-height: 70vh; background: rgba(0,0,0,0.85);
        border: 1px solid #33ff33; border-radius: 4px;
        color: #33ff33; font-family: 'Courier New', monospace; font-size: 14px;
        pointer-events: auto; z-index: 300;
        display: flex; flex-direction: column; overflow: hidden; }
      .ui-terminal .modal-header { flex-shrink: 0; padding: 16px 16px 0 16px; }
      .ui-terminal .modal-body { flex: 1; overflow-y: auto; min-height: 0;
        padding: 12px 16px 16px 16px; }
      .ui-terminal .modal-footer { flex-shrink: 0; padding: 0 16px 16px 16px; }
      .ui-terminal .prompt { color: #33ff33; }
      .ui-terminal .output { white-space: pre-wrap; margin-bottom: 10px; overflow-wrap: break-word; }
      .ui-terminal input { background: transparent; border: none; color: #33ff33;
        font-family: inherit; font-size: 14px; outline: none; width: 80%; }
      .ui-computer { position: fixed; top: 5%; left: 50%; transform: translateX(-50%);
        width: 700px; max-width: 90vw; max-height: 85vh; background: rgba(0,0,0,0.9);
        border: 1px solid #4488ff; border-radius: 6px;
        color: #ccc; font-family: 'Segoe UI', sans-serif; pointer-events: auto; z-index: 300;
        display: flex; flex-direction: column; overflow: hidden; }
      .ui-computer .modal-header { flex-shrink: 0; padding: 24px 24px 0 24px; }
      .ui-computer .modal-header h2 { color: #4488ff; margin: 0; }
      .ui-computer .modal-body { flex: 1; overflow-y: auto; min-height: 0;
        padding: 16px 24px 24px 24px; }
      .ui-computer .section { margin-bottom: 16px; }
      .ui-computer .label { color: #888; font-size: 12px; text-transform: uppercase; }
      .ui-computer .value { color: #fff; font-size: 16px; }
      .ui-panel { position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
        min-width: 300px; max-width: 90vw; max-height: 85vh;
        background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        color: #ddd; font-family: 'Segoe UI', sans-serif;
        pointer-events: auto; z-index: 300;
        display: flex; flex-direction: column; overflow: hidden; }
      .ui-panel .modal-header { flex-shrink: 0; padding: 24px 24px 0 24px; }
      .ui-panel .modal-header h2 { color: #fff; margin: 0;
        border-bottom: 1px solid #333; padding-bottom: 8px; }
      .ui-panel .modal-body { flex: 1; overflow-y: auto; min-height: 0;
        padding: 8px 24px 24px 24px; }
      .ui-panel .item { padding: 8px 0; border-bottom: 1px solid #222; }
      .ui-panel .item:last-child { border-bottom: none; }
      .ui-panel .item h3 { color: #66ccff; margin: 4px 0; font-size: 16px; }
      .ui-panel .item p { margin: 2px 0; font-size: 13px; color: #aaa; }
      .ui-close-btn { position: absolute; top: 8px; right: 12px;
        background: none; border: none; color: #666; font-size: 20px;
        cursor: pointer; pointer-events: auto; }
      .ui-close-btn:hover { color: #fff; }
      .ai-chat { position: fixed; bottom: 80px; right: 20px;
        width: 320px; max-height: 400px; background: rgba(0,0,0,0.85);
        border: 1px solid #66ffcc; border-radius: 8px; padding: 16px;
        color: #ddd; font-family: 'Courier New', monospace; font-size: 13px;
        pointer-events: auto; z-index: 300; display: flex; flex-direction: column; }
      .ai-chat .messages { flex: 1; overflow-y: auto; margin-bottom: 8px; max-height: 280px; }
      .ai-chat .msg { margin: 4px 0; padding: 6px 8px; border-radius: 4px; }
      .ai-chat .msg.user { background: rgba(102,255,204,0.1); color: #66ffcc; }
      .ai-chat .msg.ai { background: rgba(255,255,255,0.05); }
      .ai-chat input { background: rgba(255,255,255,0.1); border: 1px solid #66ffcc;
        border-radius: 4px; color: #fff; padding: 8px; font-family: inherit; font-size: 13px;
        outline: none; width: calc(100% - 16px); }
    `;
    document.head.appendChild(style);
  }

  private async handleInteraction(state: any): Promise<void> {
    const interaction = state.interaction;
    const dataSource = interaction.dataSource;

    this.clearPanels();

    if (interaction.animation && state.mesh) {
      this.animationManager.play(interaction.animation, state.mesh);
    }

    if (interaction.type === 'assistant') {
      this.openAIChat();
      return;
    }

    if (interaction.type === 'terminal' || interaction.type === 'computer') {
      const data = dataSource === 'all'
        ? await this.loadAllPortfolio()
        : await this.dataLoader.loadDataset(dataSource);
      if (data) this.showComputerPanel(dataSource, data);
      else this.showTerminal('No data available for this source.');
      return;
    }

    if (dataSource) {
      const data = await this.dataLoader.loadDataset(dataSource);
      if (data) this.showDataPanel(dataSource, data);
      else this.showTerminal(`No data for "${dataSource}"`);
    }
  }

  private async loadAllPortfolio(): Promise<Record<string, any>> {
    const keys = ['profile', 'projects', 'experience', 'education', 'skills', 'contact', 'timeline'];
    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = await this.dataLoader.loadDataset(key);
    }
    return result;
  }

  private showComputerPanel(source: string, data: any): void {
    const panel = document.createElement('div');
    panel.className = 'ui-computer';
    panel.id = 'active-panel';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ui-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close panel');
    closeBtn.tabIndex = 0;

    if (source === 'all') {
      let html = `<div class="modal-header"><h2>Portfolio Overview</h2></div><div class="modal-body">`;
      if (data.profile?.personal) {
        html += `<div class="section"><span class="label">Profile</span><div class="value">${data.profile.personal.displayName} — ${data.profile.personal.title}</div></div>`;
      }
      if (Array.isArray(data.projects)) {
        html += `<div class="section"><span class="label">Projects (${data.projects.length})</span><div class="value">${data.projects.slice(0, 5).map((p: any) => p.title).join(', ')}${data.projects.length > 5 ? '...' : ''}</div></div>`;
      }
      if (Array.isArray(data.experience)) {
        const sortedExperience = [...data.experience].sort((a: any, b: any) => b.start.localeCompare(a.start));
        html += `<div class="section"><span class="label">Experience</span><div class="value">${sortedExperience.map((e: any) => `${e.position} at ${e.company}`).join(', ')}</div></div>`;
      }
      if (Array.isArray(data.education)) {
        const sortedEducation = [...data.education].sort((a: any, b: any) => b.startYear - a.startYear);
        html += `<div class="section"><span class="label">Education</span><div class="value">${sortedEducation.map((e: any) => `${e.program} — ${e.institution}`).join(', ')}</div></div>`;
      }
      if (data.skills?.categories) {
        const allSkills = data.skills.categories.flatMap((c: any) => c.skills || []);
        html += `<div class="section"><span class="label">Skills</span><div class="value">${allSkills.slice(0, 15).join(', ')}${allSkills.length > 15 ? '...' : ''}</div></div>`;
      }
      if (Array.isArray(data.timeline)) {
        html += `<div class="section"><span class="label">Timeline</span><div class="value">${data.timeline.length} milestones</div></div>`;
      }
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'profile' && data.personal) {
      panel.innerHTML = `
        <div class="modal-header"><h2>${data.personal.displayName}</h2></div>
        <div class="modal-body">
          <div class="section"><span class="label">Role</span><div class="value">${data.personal.title}</div></div>
          <div class="section"><span class="label">Current</span><div class="value">${data.professionalProfile.currentRole} at ${data.professionalProfile.currentCompany}</div></div>
          <div class="section"><span class="label">Summary</span><div class="value">${data.about?.summary || ''}</div></div>
          <div class="section"><span class="label">Location</span><div class="value">${data.personal.location.country}</div></div>
          <div class="section"><span class="label">Strengths</span><div class="value">${(data.strengths || []).join(', ')}</div></div>
        </div>
      `;
    } else if (source === 'projects' && Array.isArray(data)) {
      let html = `<div class="modal-header"><h2>Projects (${data.length})</h2></div><div class="modal-body">`;
      data.slice(0, 10).forEach((p: any) => {
        html += `
          <div class="section">
            <span class="label">${p.category || 'Project'}</span>
            <div class="value">${p.title}</div>
            <div style="color:#888;font-size:13px">${p.summary || ''}</div>
            <div style="color:#66ccff;font-size:12px;margin-top:4px">${(p.technologies || []).join(', ')}</div>
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'experience' && Array.isArray(data)) {
      let html = `<div class="modal-header"><h2>Experience</h2></div><div class="modal-body">`;
      [...data].sort((a: any, b: any) => b.start.localeCompare(a.start)).forEach((e: any) => {
        html += `
          <div class="section">
            <span class="label">${e.position}</span>
            <div class="value">${e.company}</div>
            <div style="color:#888;font-size:13px">${e.start} - ${e.end || 'Present'}</div>
            <div style="color:#aaa;font-size:13px">${e.summary || ''}</div>
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'skills' && data.categories) {
      let html = `<div class="modal-header"><h2>Skills</h2></div><div class="modal-body">`;
      data.categories.forEach((cat: any) => {
        html += `
          <div class="section">
            <span class="label">${cat.title}</span>
            <div class="value">${cat.description}</div>
            <div style="color:#66ccff;font-size:12px;margin-top:4px">${(cat.skills || []).join(', ')}</div>
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'education' && Array.isArray(data)) {
      let html = `<div class="modal-header"><h2>Education</h2></div><div class="modal-body">`;
      [...data].sort((a: any, b: any) => b.startYear - a.startYear).forEach((e: any) => {
        html += `
          <div class="section">
            <span class="label">${e.institution}</span>
            <div class="value">${e.program}</div>
            <div style="color:#888;font-size:13px">${e.startYear} - ${e.endYear}</div>
            ${e.honors ? `<div style="color:#ffcc44;font-size:12px">${e.honors.join(', ')}</div>` : ''}
            ${e.thesis ? `<div style="color:#888;font-size:12px">Thesis: ${e.thesis.title}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'contact') {
      panel.innerHTML = `
        <div class="modal-header"><h2>Contact</h2></div>
        <div class="modal-body">
          <div class="section"><span class="label">Email</span><div class="value">${data.email || ''}</div></div>
          <div class="section"><span class="label">GitHub</span><div class="value">${data.github?.url || ''}</div></div>
          <div class="section"><span class="label">Website</span><div class="value">${data.website || ''}</div></div>
        </div>
      `;
    } else if (source === 'timeline' && Array.isArray(data)) {
      let html = `<div class="modal-header"><h2>Timeline</h2></div><div class="modal-body">`;
      [...data].sort((a: any, b: any) => b.year - a.year).forEach((t: any) => {
        html += `
          <div class="section">
            <span class="label">${t.year}</span>
            <div class="value">${t.title}</div>
            <div style="color:#888;font-size:13px">${t.description || ''}</div>
            ${t.organization ? `<div style="color:#666;font-size:12px">${t.organization}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else {
      const displayName = source.charAt(0).toUpperCase() + source.slice(1);
      panel.innerHTML = `<div class="modal-header"><h2>${displayName}</h2></div><div class="modal-body"><div style="color:#888;font-size:13px">Data loaded (${typeof data === 'object' ? Object.keys(data).length + ' fields' : 'available'})</div></div>`;
    }

    closeBtn.onclick = () => this.closeAllPanels();
    closeBtn.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') this.closeAllPanels();
    };
    const header = panel.querySelector('.modal-header');
    if (header) header.appendChild(closeBtn);

    this.container.appendChild(panel);
  }

  private showTerminal(text: string): void {
    const panel = document.createElement('div');
    panel.className = 'ui-terminal';
    panel.id = 'active-panel';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ui-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close panel');
    closeBtn.tabIndex = 0;
    closeBtn.onclick = () => this.closeAllPanels();
    closeBtn.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') this.closeAllPanels();
    };

    panel.innerHTML = `
      <div class="modal-header"></div>
      <div class="modal-body"><div class="output">${text.replace(/</g, '&lt;')}</div></div>
      <div class="modal-footer"><span class="prompt">$ </span><input type="text" autofocus></div>
    `;
    const header = panel.querySelector('.modal-header');
    if (header) header.appendChild(closeBtn);

    this.container.appendChild(panel);
  }

  private showDataPanel(source: string, data: any): void {
    const panel = document.createElement('div');
    panel.className = 'ui-panel';
    panel.id = 'active-panel';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ui-close-btn';
    closeBtn.textContent = '✕';

    if (source === 'education' && Array.isArray(data)) {
      let html = `<div class="modal-header"><h2>Education</h2></div><div class="modal-body">`;
      [...data].sort((a: any, b: any) => b.startYear - a.startYear).forEach((e: any) => {
        html += `
          <div class="item">
            <h3>${e.institution}</h3>
            <p>${e.program} (${e.startYear} - ${e.endYear})</p>
            ${e.honors ? `<p style="color:#ffcc44">🏆 ${e.honors.join(', ')}</p>` : ''}
            ${e.thesis ? `<p style="color:#888;font-size:12px">Thesis: ${e.thesis.title}</p>` : ''}
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'skills' && data.categories) {
      let html = `<div class="modal-header"><h2>Skills</h2></div><div class="modal-body">`;
      data.categories.forEach((cat: any) => {
        html += `
          <div class="item">
            <h3>${cat.title}</h3>
            <p>${cat.description}</p>
            <p style="color:#66ccff;font-size:12px">${(cat.skills || []).join(', ')}</p>
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'contact') {
      panel.innerHTML = `
        <div class="modal-header"><h2>Contact</h2></div>
        <div class="modal-body">
          <div class="item"><p>Email: ${data.email || ''}</p></div>
          <div class="item"><p>GitHub: ${data.github?.url || ''}</p></div>
          <div class="item"><p>Website: ${data.website || ''}</p></div>
        </div>
      `;
    } else if (source === 'timeline' && Array.isArray(data)) {
      let html = `<div class="modal-header"><h2>Timeline</h2></div><div class="modal-body">`;
      [...data].sort((a: any, b: any) => b.year - a.year).forEach((t: any) => {
        html += `
          <div class="item">
            <h3>${t.year} - ${t.title}</h3>
            <p>${t.description}</p>
            ${t.organization ? `<p style="color:#888">${t.organization}</p>` : ''}
          </div>
        `;
      });
      html += `</div>`;
      panel.innerHTML = html;
    } else if (source === 'profile' && data.personal) {
      panel.innerHTML = `
        <div class="modal-header"><h2>${data.personal.displayName}</h2></div>
        <div class="modal-body">
          <div class="item"><p>${data.personal.title}</p></div>
          <div class="item"><p>${data.about?.summary || ''}</p></div>
          <div class="item"><p>${data.professionalProfile.currentRole} at ${data.professionalProfile.currentCompany}</p></div>
        </div>
      `;
    } else {
      const displayName = source.charAt(0).toUpperCase() + source.slice(1);
      panel.innerHTML = `<div class="modal-header"><h2>${displayName}</h2></div><div class="modal-body"><div style="color:#888;font-size:13px">Data loaded (${typeof data === 'object' ? Object.keys(data).length + ' fields' : 'available'})</div></div>`;
    }

    closeBtn.onclick = () => this.closeAllPanels();
    const header = panel.querySelector('.modal-header');
    if (header) header.appendChild(closeBtn);

    this.container.appendChild(panel);
  }

  showLockedPrompt(_conditionName: string): void {
    this.interactPrompt.textContent = `🔒 Locked — discover its secret elsewhere`;
    this.interactPrompt.style.opacity = '1';
    this.interactPrompt.style.color = '#ff4444';
    this.interactPrompt.style.textShadow = '0 0 8px rgba(255,68,68,0.3)';
  }

  showDefaultPrompt(): void {
    this.interactPrompt.style.color = '#66ccff';
    this.interactPrompt.style.textShadow = '0 0 8px rgba(102,204,255,0.3)';
  }

  private async openAIChat(): Promise<void> {
    const chat = document.createElement('div');
    chat.className = 'ai-chat';
    chat.id = 'active-panel';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ui-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close panel');
    closeBtn.tabIndex = 0;
    closeBtn.onclick = () => this.closeAllPanels();
    closeBtn.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') this.closeAllPanels();
    };
    chat.appendChild(closeBtn);

    const messages = document.createElement('div');
    messages.className = 'messages';
    messages.innerHTML = `<div class="msg ai">${this.aiEngine.getWelcomeMessage()}</div>`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask about projects, skills, experience...';
    input.onkeydown = async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        messages.innerHTML += `<div class="msg user">${input.value}</div>`;
        const query = input.value;
        input.value = '';
        const response = await this.aiEngine.processQuery(query);
        messages.innerHTML += `<div class="msg ai">${response.text}</div>`;
        messages.scrollTop = messages.scrollHeight;
      }
    };

    chat.appendChild(messages);
    chat.appendChild(input);
    this.container.appendChild(chat);
    input.focus();
  }

  private clearPanels(): void {
    const active = document.getElementById('active-panel');
    if (active) active.remove();
    const panels = this.container.querySelectorAll('.ui-terminal, .ui-computer, .ui-panel, .ai-chat');
    panels.forEach(p => p.remove());
    this.animationManager.stopAll();
  }

  private closeAllPanels(): void {
    this.clearPanels();
    this.interactionSystem.endInteraction();
  }

  update(_delta: number): void {
    const activePanel = document.getElementById('active-panel');
    if (activePanel) {
      const input = activePanel.querySelector('input');
      if (input && document.activeElement !== input) {
        input.focus();
      }
      return;
    }

    const hoveredId = this.interactionSystem.hoveredObjectId;
    const isLocked = this.interactionSystem.hoveredObjectLocked;

    if (hoveredId && isLocked) {
      const condition = this.interactionSystem.lockedCondition || 'unknown';
      this.showLockedPrompt(condition);
    } else if (hoveredId) {
      this.showDefaultPrompt();
      const objName = hoveredId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      this.showInteractPrompt(objName);
    } else {
      this.hideInteractPrompt();
    }
  }
}
