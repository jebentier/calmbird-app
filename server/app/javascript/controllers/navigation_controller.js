import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['menuToggle', 'menu'];

  connect() {
    this.menuToggleTarget.addEventListener('click', () => { this.menuTarget.classList.toggle('hidden') });
    window.addEventListener('scroll', () => {
      setTimeout(() => this.menuTarget.classList.add('hidden'), 500);
    });
  }
}
