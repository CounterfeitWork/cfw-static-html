//TODO: Remove or keep this file
// Don't forget to install the dependancies
// npm install -D flickity @types/flickity
import 'flickity/dist/flickity.min.css';
import Flickity, { FlickityEvents } from 'flickity';
require('flickity-imagesloaded');
type FlickityEventsFix = FlickityEvents & 'change';

// Helpers
/**
 * Get flickity instance thanks to the element
 *
 * @param {Element} carousel The carousel element
 * @returns {Flickity} The flickity instance
 */
const getFlickity = (carousel: Element): Flickity => {
  return Flickity.data(carousel.querySelector('.carousel__main'));
};

/**
 * Init carousel
 *
 * @param {string} [selector] The carousel selector
 */
export const initCarousel = (selector = '.carousel'): void => {
  if (document.querySelector(selector)) {
    //Init carousel
    document.querySelectorAll(`${selector}:not(.is-enabled)`).forEach(function (carousel) {
      const carouselMain: Element = carousel.querySelector('.carousel__main');
      const carouselPrev: Element = carousel.querySelector('.carousel__arrow--prev');
      const carouselNext: Element = carousel.querySelector('.carousel__arrow--next');

      const flickity = new Flickity(carouselMain, {
        pageDots: false,
        prevNextButtons: false,
        adaptiveHeight: false,
        setGallerySize: false,
        imagesLoaded: true,
        draggable: false,
        wrapAround: true,
        cellSelector: '.carousel__slide',
      });

      flickity.on('change' as FlickityEventsFix, function () {
        const caption: HTMLElement = carousel.querySelector('.carousel__caption');
        if (caption) {
          const el = flickity.selectedElement as HTMLElement;
          caption.innerText = el.dataset.caption;
        }
      });

      // Bind controls for all carousels
      carouselPrev.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          const carousel: Element = this.closest('.carousel');
          const flickity = getFlickity(carousel);

          flickity.previous();
        },
        false
      );

      carouselNext.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          const carousel: Element = this.closest('.carousel');
          const flickity = getFlickity(carousel);
          flickity.next();
        },
        false
      );
    });
  }
};
