//TODO: Remove or keep this file
// Don't forget to install the dependancies
// npm i -D downloadjs @types/downloadjs
import download from 'downloadjs';

/**
 * Download url on click
 *
 * @param {string} selector The selector of link elements
 * @returns {(void | boolean)} Return false on error
 */
export const downloadUrlOnClick = (selector: string): void | boolean => {
  selector = selector || '.js-download';
  const targets: NodeListOf<HTMLElement> =
    typeof selector === 'string' ? document.querySelectorAll(selector) : selector;

  if (!targets) return false;

  for (const el of Array.from(targets)) {
    el.addEventListener('click', (e: Event) => {
      e.preventDefault();

      const el = e.target as HTMLLinkElement;
      const url: string = el.href;
      const filename: string = el.dataset.filename;
      const contentType: string = el.dataset.contenttype;
      const progress: HTMLProgressElement = el.querySelector('progress');

      if (!url) return false;

      const x: XMLHttpRequest = new XMLHttpRequest();
      x.open('GET', url, true);
      if (progress) {
        x.onprogress = function (e): void {
          progress.value = (e.loaded / e.total) * 100;
        };
      }
      x.responseType = 'blob';
      x.onload = function (): void {
        download(x.response, filename, contentType);
      };
      x.send();
    });
  }
};
