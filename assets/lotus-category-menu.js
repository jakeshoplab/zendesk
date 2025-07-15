document.addEventListener('alpine:init', () => {
  // @ts-check;
  const PROPERTIES = ['id', 'name', 'html_url', 'position'];

  const ENDPOINTS = {
    categories: `help_center/${LotusUtils.getLocale()}/categories.json`,
  };

  Alpine.data('categoryMenu', () => ({
    categories: [],
    init() {
      const MINUTE = 60;
      const key = `category_menu:categories:${LotusUtils.getLocale()}`;

      if (LotusUtils.getWithExpiry(key)) {
        this.categories = LotusUtils.getWithExpiry(key);
      } else {
        this.fetchCategories('categories').then((res) => {
          const categories = res
            .map((e) => LotusUtils.pick(e, PROPERTIES))
            .sort(LotusUtils.sortByPosition);
          LotusUtils.setWithExpiry(key, categories, MINUTE);
        });
      }
    },
    async fetchCategories(object, url) {
      const fetchUrl = url || `/api/v2/${ENDPOINTS[object]}?page[size]=100`;
      const response = await fetch(fetchUrl);

      if (!response.ok) throw new Error('HTTP error');

      const responseJSON = await response.json();
      return [
        ...responseJSON[object],
        ...(responseJSON.meta.has_more
          ? await this.fetchData(object, responseJSON.links.next)
          : []),
      ];
    },
  }));
});
