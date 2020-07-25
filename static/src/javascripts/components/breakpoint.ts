/**
 * Return the current grid breakpoint
 *
 * @returns {number} current breakpoint
 */
export const getCurrentBreakpoint = (): number => {
  return parseInt(
    window
      .getComputedStyle(document.querySelector('body'), ':before')
      .getPropertyValue('content')
      .replace(/"/g, '')
      .replace(/'/g, '')
  );
};
