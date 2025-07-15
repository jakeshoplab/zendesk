class ArticleAccordion extends HTMLElement {
  connectedCallback() {
    const MINUTE = 60;
    this.CACHE_TTL = MINUTE;

    const detailsAccordion = this.querySelector('details-accordion');

    if (!detailsAccordion) return;

    this.articleId = detailsAccordion.getAttribute('data-id');

    if (!this.articleId) return;

    this.ARTICLE_KEY = `lotus:article:${this.articleId}:${LotusUtils.getLocale()}`;

    const summaryEl = detailsAccordion.querySelector('summary');

    this.contentEl = detailsAccordion.querySelector('[data-accordion-content]');

    summaryEl.addEventListener('click', async (e) => this.handleAccordionClick(), {
      once: true,
    });
  }

  async handleAccordionClick() {
    try {
      const articleBody = await this.getArticleBody(this.articleId);
      if (articleBody) {
        this.insertBody(articleBody);
      }
    } catch (error) {
      console.error(`Error inserting article body: ${error}`);
    }
  }

  async loadArticle(articleId) {
    if (!articleId) return null;

    const cachedArticle = LotusUtils.getWithExpiry(this.ARTICLE_KEY);
    if (cachedArticle) {
      return cachedArticle;
    }

    try {
      const res = await fetch(
        `/api/v2/help_center/${LotusUtils.getLocale()}/articles/${articleId}`,
      );
      const data = await res.json();
      const article = data.article;

      if (article) {
        LotusUtils.setWithExpiry(this.ARTICLE_KEY, article, this.CACHE_TTL);
      }

      return article || null;
    } catch (error) {
      console.error(`Error fetching article: ${error}`);
      return null;
    }
  }

  async getArticleBody(articleId) {
    const article = await this.loadArticle(articleId);
    return article ? article.body : null;
  }

  insertBody(articleBody) {
    if (this.contentEl) {
      this.contentEl.innerHTML = DOMPurify.sanitize(articleBody);
    }
    initComponents();
  }
}

customElements.define('article-accordion', ArticleAccordion);
