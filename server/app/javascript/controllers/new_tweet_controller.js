import { Controller } from "@hotwired/stimulus"

const MAX_TWEET_LENGTH = 280;

export default class extends Controller {
  static targets = ['contentWrapper', 'contentWrapperTemplate', 'addThread'];

  connect() {
    this.addThreadTarget.addEventListener('click', () => this.addThread());
  }

  addThread() {
    const lastContentWrapper = this.contentWrapperTargets[this.contentWrapperTargets.length - 1];
    const newContentWrapper  = this.contentWrapperTemplateTarget.content.cloneNode(true);
    lastContentWrapper.parentNode.insertBefore(newContentWrapper, lastContentWrapper.nextSibling);
  }

  removeThread(event) {
    const contentWrapper = event.target.parentNode.parentNode;
    contentWrapper.parentNode.removeChild(contentWrapper);
  }

  handleChangeEvent(event) {
    const eventType       = event.type;
    const currentLength   = event.target.value.length + (eventType == 'keypress' ? 1 : 0);
    const progressBarFill = event.target.parentNode.querySelector('.progress-bar-fill');
    const progressCounter = event.target.parentNode.querySelector('.progress-counter');

    if (currentLength <= MAX_TWEET_LENGTH) {
      progressCounter.textContent = `${currentLength}/${MAX_TWEET_LENGTH}`;
    }

    progressBarFill.style.width = `${(currentLength / MAX_TWEET_LENGTH) * 100}%`;
    progressBarFill.classList.remove('bg-blue-300');
    progressBarFill.classList.remove('bg-orange-300');
    progressBarFill.classList.remove('bg-yellow-300');
    progressBarFill.classList.remove('bg-red-300');
    if (currentLength >= MAX_TWEET_LENGTH) {
      progressBarFill.classList.add('bg-red-300');
      if (currentLength == MAX_TWEET_LENGTH) {
        this.addThread();
        this.contentWrapperTargets[this.contentWrapperTargets.length - 1].getElementsByTagName('textarea')[0].focus();
      }
    } else if (currentLength >= 240) {
      progressBarFill.classList.add('bg-orange-300');
    } else if (currentLength >= 200) {
      progressBarFill.classList.add('bg-yellow-300');
    } else {
      progressBarFill.classList.add('bg-blue-300');
    }
  }
}
