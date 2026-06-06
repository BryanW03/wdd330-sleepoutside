export default class Alert {
  constructor(jsonPath, containerId) {
    this.jsonPath = jsonPath;
    this.containerId = containerId;
  }

  async init() {
    try {
      const res = await fetch(this.jsonPath);
      if (!res.ok) return;
      const alerts = await res.json();
      this.render(alerts);
    } catch (e) {
      // No alerts.json — silently skip
    }
  }

  render(alerts) {
    if (!alerts || !alerts.length) return;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const section = document.createElement('section');
    section.className = 'alert-list';

    alerts.forEach(alert => {
      const p = document.createElement('p');
      p.className = 'alert-item';
      p.textContent = alert.message;
      p.style.backgroundColor = alert.background || '#333';
      p.style.color = alert.color || 'white';
      section.appendChild(p);
    });

    container.prepend(section);
  }
}