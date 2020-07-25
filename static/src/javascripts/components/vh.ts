/**
 * Set vh-type unit based on window height
 */
export const setVh = (): void => {
  const iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  calculateVh();

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      calculateVh();
    }, 200);
  });

  window.addEventListener('resize', () => {
    if (!iOS) {
      calculateVh();
    }
  });
};

/**
 * Calculate vh-type unit based on window height
 */
function calculateVh(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
