document.addEventListener('alpine:init', () => {
  Alpine.data('sectionArticles', ({ sectionId, limit = 6 }) => ({
    articles: [],
    isLoaded: false,
    limit: limit,
    count: 0,
    KEY: `lotus:section:${sectionId}:${LotusUtils.getLocale()}`,
    CACHE_TTL: 60,

    getArticles() {
      if (!sectionId) return;

      const cachedSection = LotusUtils.getWithExpiry(this.KEY);

      if (cachedSection) {
        this.articles = cachedSection.articles;
        this.count = cachedSection.count;
        this.isLoaded = true;
      } else {
        this.fetchArticles(sectionId);
      }
    },

    async fetchArticles(sectionId) {
      try {
        const response = await fetch(`/api/v2/help_center/sections/${sectionId}/articles`);
        const data = await response.json();

        if (data.articles) {
          const articles = data.articles.slice(0, this.limit);

          this.articles = articles;
          this.isLoaded = true;
          this.count = data.count;

          const sectionData = {
            articles: articles,
            count: data.count,
          };

          LotusUtils.setWithExpiry(this.KEY, sectionData, this.CACHE_TTL);
        }
      } catch (error) {
        console.error(`Error fetching section articles: ${error}`);
      }
    },
  }));
});
