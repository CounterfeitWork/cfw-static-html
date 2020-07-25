/**
 * Applies specified method to modify docmument.body classList on element click
 *
 * @param {string} btnSelector Selector of element to click
 * @param {string} bodyClassName Class name to apply to body
 * @param {string} method classList method to use
 * @returns {boolean} True on success, false on error
 */
export const modifyBodyClassListOnClick = function (
  btnSelector: string,
  bodyClassName: string,
  method: string
): boolean {
  const btn: Element = document.querySelector(btnSelector);
  method = method || 'add';

  if (!btn) return false;

  btn.addEventListener('click', () => {
    document.body.classList[method](bodyClassName);
  });

  return true;
};
