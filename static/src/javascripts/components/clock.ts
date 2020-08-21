/**
 * Run the provided clocks
 *
 * @param {NodeList} els Clocks
 */
export const initClocks = (els: NodeListOf<HTMLElement>): void => {
  if (!els) return;

  for (const el of els) {
    const date: HTMLElement = el.querySelector('.js-clock-date');
    const time: HTMLElement = el.querySelector('.js-clock-time');

    if (date && time) {
      setTheme();
      setClock(date, time);

      setInterval(() => {
        setTheme();
        setClock(date, time);
      }, 1000);
    }
  }
};

/**
 * Get current date
 *
 * @returns {string} Current date formatted
 */
function getDate(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  return `${yyyy}.${mm}.${dd}`;
}

/**
 * Get current time
 *
 * @returns {string} Current time formatted
 */
function getTime(): string {
  const now = new Date();

  return now.toLocaleTimeString(['fr-FR'], {
    // hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Set current theme based of time
 */
function setTheme(): void {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 12) {
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');
  } else {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  }
}

/**
 * Set clock date, time and theme
 *
 * @param {HTMLElement} date HTML element to display date
 * @param {HTMLElement} time HTML element to display time
 */
function setClock(date: HTMLElement, time: HTMLElement): void {
  const dateStr = getDate();
  const timeStr = getTime();

  if (date && date.innerText !== dateStr) {
    date.innerText = dateStr;
  }

  if (time) {
    time.innerText = timeStr;
  }
}
