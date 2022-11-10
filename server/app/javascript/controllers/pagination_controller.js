import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() { }

  click(event) {
    event.preventDefault()
    const nextUrl = event.currentTarget.href;
    this.loadMore(nextUrl);
  }

  async loadMore(url) {
    const response = await fetch(url, { headers: { Accept: "text/vnd.turbo-stream.html" } });
    const html = await response.text();

    Turbo.renderStreamMessage(html);
  }
}
