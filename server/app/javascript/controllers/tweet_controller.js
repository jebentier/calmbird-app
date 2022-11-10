import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['tweet'];

  connect() {
    this.tweetTargets.forEach(tweet => {
      tweet.innerHTML = tweet.textContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    });
  }
}
