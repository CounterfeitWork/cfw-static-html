/**
 * Initiate spinning logos
 *
 * @param {NodeList} els Logos elements
 */
export const spinLogos = (els: NodeListOf<HTMLElement>): void => {
  if (!els) return;
  const iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  for (const el of els) {
    const perspecive = `${el.offsetWidth * 1.5}px`;
    el.style.perspective = perspecive;

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        el.style.perspective = perspecive;
      }, 200);
    });

    window.addEventListener('resize', () => {
      if (!iOS) {
        el.style.perspective = perspecive;
      }
    });

    el.addEventListener(
      'animationend',
      () => {
        const group: HTMLElement = el.querySelector('.js-logos-group');

        if (!group) return;

        switchLogo.bind(el)();
        group.style.animationDuration = '3s';
        group.style.animationIterationCount = 'infinite';
        group.style.animationDelay = '0ms';
        group.style.animationName = 'rotateY2';
      },
      false
    );

    el.addEventListener('animationiteration', switchLogo, false);
  }
};

function switchLogo() {
  const activeLogo: HTMLElement = this.querySelector('.is-active');
  const activeNum = parseInt(activeLogo.dataset.num);
  const switchNum = activeNum + 1;
  let switchLogo = this.querySelector(`[data-num='${switchNum}']`);

  activeLogo.classList.remove('is-active');

  if (switchLogo) {
    switchLogo.classList.add('is-active');
  } else {
    switchLogo = this.querySelector(`[data-num='1']`);
    switchLogo.classList.add('is-active');
  }
}
