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
      'animationiteration',
      () => {
        const activeLogo: HTMLElement = el.querySelector('.is-active');
        const activeNum = parseInt(activeLogo.dataset.num);
        const switchNum = activeNum + 1;
        let switchLogo = el.querySelector(`[data-num='${switchNum}']`);

        activeLogo.classList.remove('is-active');

        if (switchLogo) {
          switchLogo.classList.add('is-active');
        } else {
          switchLogo = el.querySelector(`[data-num='1']`);
          switchLogo.classList.add('is-active');
        }
      },
      false
    );
  }
};
