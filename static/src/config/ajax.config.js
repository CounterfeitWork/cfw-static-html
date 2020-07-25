// TODO: Edit or delete this file

const debug = false;

const updatePassive = [
  {
    name: 'updateIsActive',
    args: [null, 'payload'],
    path: 'components/ajax-callback',
  },
  {
    name: 'handleRouteChangeOnClick',
    args: ['a[href^="/"]:not([class*=js-ajax-])', debug],
    path: 'components/ajax',
  },
];

// define the routes, then define the main callback (handleRouteChange, handlePagination...)
// then define the callback of the callback
// args available:
// - 'payload', see the AjaxPayload type
// - 'direction', see the AjaxDirection type
// - custom args related to the function you target
export default {
  goToUrlOnError: true,
  routes: {
    home: {
      callback: {
        handleRouteChange: [
          {
            name: 'insertMainContentHtml',
            args: ['payload'],
            path: 'components/ajax',
            callback: [
              {
                name: 'updateTitleTag',
                args: ['payload'],
                path: 'components/ajax-callback',
              },
            ],
          },
          ...updatePassive,
        ],
      },
    },
  },
};
