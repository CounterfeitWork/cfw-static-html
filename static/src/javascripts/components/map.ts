import GoogleMapsConfig from '@config/googlemaps.config.js';
import LoadGoogleMapsApi from 'load-google-maps-api';

//TODO: Remove or keep this file
// Don't forget to install the dependancies
// npm i -D load-google-maps-api @types/load-google-maps-api

/**
 * Render a google map
 * You need to set a .js-map element
 * Example in pug: .js-map(data-lat='24' data-lng='12' style='padding-bottom: 66%;')
 *
 * @param {HTMLElement[]} maps Maps elements
 */
export const renderMap = function (maps: NodeListOf<HTMLElement>): void {
  LoadGoogleMapsApi({
    key: GoogleMapsConfig.key,
    language: document.documentElement.lang,
  })
    .then(function (googleMaps) {
      [].forEach.call(maps, function (_map: HTMLElement) {
        const latLng = {
          lat: parseFloat(_map.dataset.lat),
          lng: parseFloat(_map.dataset.lng),
        };

        let mapConfig = {
          center: latLng,
        };

        mapConfig = Object.assign(GoogleMapsConfig, mapConfig);

        const map = new googleMaps.Map(_map, mapConfig);

        new googleMaps.Marker({
          position: latLng,
          map: map,
        });
      });
    })
    .catch(function (error: string) {
      console.error(error);
    });
};
