/**
 * Init drawer
 *
 * @param {string} selector The selector of drawer elements
 */
export const initDrawer = (selector = '.drawer'): void => {
  const drawers = document.querySelectorAll(selector);
  drawers.forEach((drawer) => {
    const header = drawer.querySelector('.drawer__header');

    header.addEventListener('click', () => {
      if (drawer.classList.contains('drawer--close')) {
        drawer.classList.remove('drawer--close');
        drawer.classList.add('drawer--open');
      } else {
        drawer.classList.remove('drawer--open');
        drawer.classList.add('drawer--close');
      }
    });
  });
};
