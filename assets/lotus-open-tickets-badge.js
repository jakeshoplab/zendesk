/**
 * Open tickets badge Template Script
 * ------------------------------------------------------------------------------
 * Displays a number of open tickets
 *
 */

const OpenTicketsBadge = (function () {
  const LOCAL_STORAGE_KEY = 'lt:open_tickets';
  const TTL = 60; // Time to live in seconds.
  const elements = document.querySelectorAll('.js-open-tickets-badge');

  function getDefaultRequestConfig() {
    return JSON.parse(
      JSON.stringify({
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json;',
        },
      }),
    );
  }

  function fetchJSON(url, config) {
    return fetch(url, config).then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  function getTickets() {
    return fetchJSON('/api/v2/requests.json?status=new,open', getDefaultRequestConfig());
  }

  function getCount() {
    return getTickets().then((response) => response.count);
  }

  /**
   * @param {string} key - A key to identify the value.
   * @param {any} value - A value associated with the key.
   * @param {number} ttl - Time to live in seconds.
   */
  function setWithExpiry(key, value, ttl) {
    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
      value,
      ttl: Date.now() + ttl * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * @param {string} key - A key to identify the data.
   * @returns {any|null} returns the value associated with the key if its exists and is not expired.
   */
  function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    // if the item doesn't exist, return null
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    // compare the expiry time of the item with the current time
    if (Date.now() > item.ttl) {
      // If the item is expired, delete the item from storage
      // and return null
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  /**
   * @param {number} count - A number of opened tickets.
   */
  function render(count) {
    [...elements].forEach((element) => {
      if (elements.length && count > 0) {
        const currentEl = element;
        currentEl.innerText = count;
        currentEl.classList.add('is-active');
      }
    });
    if (count > 0) {
      const { title } = document;
      document.title = `(${count}) ${title}`;
    }
  }

  return {
    init() {
      const storedCount = getWithExpiry(LOCAL_STORAGE_KEY);
      if (window.localStorage && storedCount) {
        render(storedCount);
      } else {
        getCount().then((count) => {
          render(count);
          if (window.localStorage) {
            setWithExpiry(LOCAL_STORAGE_KEY, count, TTL);
          }
        });
      }
    },
  };
}());

if (LotusConfig.signedIn) {
  OpenTicketsBadge.init();
}
