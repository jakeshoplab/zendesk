/**
 * Replace SVG image to inline SVG code
 */
function inlineSVGImages() {
  [...document.querySelectorAll('img.custom-block__image, [data-svg]')].forEach(
    (image) => {
      const src = image.getAttribute('src');
      if (!src) return;
      fetch(src).then((response) => {
        response.text().then((data) => {
          if (!data.includes('svg')) return;
          // Parse the SVG as HTML
          const parser = new DOMParser();
          const svg = parser.parseFromString(
            data,
            'image/svg+xml'
          ).documentElement;

          // Add the classes from the original image to the SVG.
          svg.classList = image.classList;
          svg.removeAttribute('xmlns:a');
          image.insertAdjacentHTML('beforebegin', svg.outerHTML);
          image.hidden = true;
        });
      });
    }
  );
}

/**
 * Fix animate Font Awesome icons SVG
 */
function initFixForAnimatedIcons() {
  const animatedIcons = document.querySelectorAll('.fa-spin');
  if (!animatedIcons.length) return;
  animatedIcons.forEach((el) => {
    el.textContent = '';
  });
}

function initAccordions() {
  /* Create accordions from the old markup for the backwards compatibility */
  let accordionCounter = 0;

  function getSlug(string) {
    return string
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/[\s]+/g, '-');
  }

  function getAccordionTemplate(item, i) {
    const id = Math.random().toString(16).slice(2);
    const slug = `${getSlug(item.title)}-${i}`;
    const accordion = document.createElement('details-accordion');
    accordion.classList.add('accordion__item');
    accordion.setAttribute('slug', slug);
    accordion.setAttribute('id', `Accordion-${id}`);
    accordion.innerHTML = DOMPurify.sanitize(`
        <details>
           <summary class="accordion__summary" aria-expanded="false" id="Accordion-${slug}">
           <span class="accordion__summary-wrapper">
            ${item.title}
            <svg class="lt-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M13 5.5L8 10.5L3 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
           </summary>
           <div class="accordion__content" id="AccordionContent-${id}" role="region" aria-labelledby="AccordionSummary--${id}">${item.content}</div>
         </details>
      `);
    return accordion;
  }

  const oldAccordionElements = document.querySelectorAll('.accordion__item');
  if (oldAccordionElements.length) {
    oldAccordionElements.forEach((el) => {
      accordionCounter++;
      const title = el.querySelector('.accordion__item-title').textContent;
      const content = el.querySelector('.accordion__item-content').innerHTML;

      const item = {
        title,
        content,
      };

      el.replaceWith(getAccordionTemplate(item, accordionCounter));
    });
  }

  const accordionElements = document.querySelectorAll('.js-accordions');

  if (!accordionElements.length) return;
  accordionElements.forEach((el) => {
    const container = document.createElement('div');
    container.classList.add('accordion');
    if (el.classList.contains('colored')) container.classList.add('colored');
    if (el.classList.contains('stroke')) container.classList.add('stroke');
    if (el.classList.contains('neutral')) container.classList.add('neutral');
    if (el.classList.contains('colored-title'))
      container.classList.add('colored-title');

    Array.from(el.children).forEach((child, i) => {
      accordionCounter++;
      const item = {
        content: child.innerHTML,
        title: child.getAttribute('title') || `Toggle ${i}`,
      };
      container.appendChild(getAccordionTemplate(item, accordionCounter));
    });
    el.replaceWith(container);
  });
}

function initTabs() {
  function getTabTemplate(item) {
    return `
      <tab-item class="tabs-link" role="heading" slot="tab">${item.title}</tab-item>
      <tab-panel class="tab" role="region" slot="panel">${item.content}</tab-panel>
   `;
  }

  /* Create tabs from the old markup for the backwards compatibility */
  const oldTabElements = document.querySelectorAll('.tabs');
  if (oldTabElements.length) {
    oldTabElements.forEach((el) => {
      const tabsComponent = document.createElement('tabs-component');
      tabsComponent.classList.add('tabs');

      const tabMenuItems = el.querySelectorAll('.tabs-link');
      const tabPanels = el.querySelectorAll('.tab');
      const tabData = [];
      tabMenuItems.forEach((tabMenuItem, i) => {
        const tabDataElement = {
          title: DOMPurify.sanitize(tabMenuItem.innerHTML),
          content: DOMPurify.sanitize(tabPanels[i].innerHTML),
        };
        tabData.push(tabDataElement);
      });

      const tabTemplate = tabData.map((item) => getTabTemplate(item)).join('');
      tabsComponent.innerHTML = tabTemplate;
      el.replaceWith(tabsComponent);
    });
  }

  const tabElements = document.querySelectorAll('.js-tabs');

  if (!tabElements.length) return;
  tabElements.forEach((el) => {
    const tabsComponent = document.createElement('tabs-component');
    const tabContent = [].slice
      .call(el.children)
      .map((child, i) => ({
        content: child.innerHTML,
        title: child.getAttribute('title') || `Toggle ${i}`,
      }))
      .map((item) => getTabTemplate(item))
      .join('');
    tabsComponent.innerHTML = DOMPurify.sanitize(tabContent);
    if (el.classList.contains('underline'))
      tabsComponent.classList.add('underline');
    if (el.classList.contains('background'))
      tabsComponent.classList.add('background');
    tabsComponent.classList.add('tabs');
    el.replaceWith(tabsComponent);
  });
}

function initCallouts() {
  const callouts = document.querySelectorAll(
    'ul.note, ul.warning, ul.danger, ul.success'
  );

  // Add existing classes of the ul to a new div
  function addClasses(classes, element) {
    classes.split(' ').forEach((className) => element.classList.add(className));
  }

  // Replace <li> with <p>
  function getContentWithReplaceTagNames(ulElement) {
    const clonedUl = ulElement.cloneNode(true);
    const topLevelLiElements = Array.from(
      clonedUl.querySelectorAll(':scope > li')
    );

    topLevelLiElements.forEach((topLevelLi) => {
      const pElement = document.createElement('p');
      pElement.innerHTML = DOMPurify.sanitize(topLevelLi.innerHTML);
      topLevelLi.replaceWith(pElement);
    });

    return clonedUl.innerHTML;
  }

  // Title for the Default callout
  function getTitle(item) {
    const classValues = {
      note: LotusConfig.infoTitle,
      warning: LotusConfig.warningTitle,
      success: LotusConfig.successTitle,
      danger: LotusConfig.dangerTitle,
    };
    return (
      classValues[
        Array.from(item.classList).find((className) => classValues[className])
      ] || ''
    );
  }

  // Creating and adding callout to the DOM
  function createCallout(callout, html) {
    const calloutWrapper = document.createElement('div');

    addClasses(callout.classList.value, calloutWrapper);

    calloutWrapper.insertAdjacentHTML('afterbegin', html);
    callout.replaceWith(calloutWrapper);
  }

  callouts.forEach((callout) => {
    // Default callout
    if (
      !callout.classList.contains('custom-title') &&
      !callout.classList.contains('no-title')
    ) {
      const html = `
        <h4>${getTitle(callout)}</h4>
        <div>${getContentWithReplaceTagNames(callout)}</div>
        `;

      createCallout(callout, html);
    }

    // Callout with Custom Title
    if (callout.classList.contains('custom-title')) {
      const customTitle = callout.querySelector('li').innerHTML;

      if (callout.children.length > 0) {
        callout.removeChild(callout.children[0]);
      }

      const html = `
      <h4>${customTitle}</h4>
      <div>${getContentWithReplaceTagNames(callout)}</div>
      `;

      createCallout(callout, html);
    }

    // Callout with no Title
    if (callout.classList.contains('no-title')) {
      createCallout(callout, getContentWithReplaceTagNames(callout));
    }
  });
}

function initMagnifier() {
  const articleImages = document.querySelectorAll('.magnifier');
  const wrapP = (el) => {
    const wrapper = document.createElement('div');
    el.parentNode.appendChild(wrapper);
    return wrapper.appendChild(el);
  };

  function magnify(img, zoom) {
    const glass = document.createElement('div');
    glass.setAttribute('class', 'img-magnifier-glass');

    /* Insert magnifier glass: */
    img.parentElement.insertBefore(glass, img);

    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = `url('${img.src}')`;
    glass.style.backgroundRepeat = 'no-repeat';
    glass.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`;
    const bw = 3;
    const w = glass.offsetWidth / 2;
    const h = glass.offsetHeight / 2;
    function getCursorPos(e) {
      let x = 0;
      let y = 0;
      e = e || window.event;
      /* Get the x and y positions of the image: */
      const a = img.getBoundingClientRect();
      /* Calculate the cursor's x and y coordinates, relative to the image: */
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      /* Consider any page scrolling: */
      x -= window.pageXOffset;
      y -= window.pageYOffset;
      return { x, y };
    }
    function moveMagnifier(e) {
      /* Prevent any other actions that may occur when moving over the image */
      e.preventDefault();
      /* Get the cursor's x and y positions: */
      const pos = getCursorPos(e);
      let { x } = pos;
      let { y } = pos;
      /* Prevent the magnifier glass from being positioned outside the image: */
      if (x > img.width - w / zoom) {
        x = img.width - w / zoom;
      }
      if (x < w / zoom) {
        x = w / zoom;
      }
      if (y > img.height - h / zoom) {
        y = img.height - h / zoom;
      }
      if (y < h / zoom) {
        y = h / zoom;
      }
      /* Set the position of the magnifier glass: */
      glass.style.left = `${x - w}px`;
      glass.style.top = `${y - h}px`;
      /* Display what the magnifier glass "sees": */
      glass.style.backgroundPosition = `-${x * zoom - w + bw}px -${
        y * zoom - h + bw
      }px`;
    }

    // let w, h, bw;

    /* Create magnifier glass: */

    /* Execute a function when someone moves the magnifier glass over the image: */
    glass.addEventListener('mousemove', moveMagnifier);
    img.addEventListener('mousemove', moveMagnifier);

    glass.addEventListener('touchmove', moveMagnifier);
    img.addEventListener('touchmove', moveMagnifier);
  }

  if (!articleImages) return;
  articleImages.forEach((el) => {
    wrapP(el);
    const closest = el.closest('a');
    if (!closest || !closest.classList.contains('image-with-video-icon')) {
      const parent = el.parentElement;
      parent.style.position = 'relative';
      parent.style.display = 'block';

      parent.addEventListener('mouseenter', () => {
        magnify(el, 3);
      });

      parent.addEventListener('mouseleave', () => {
        const magnif = el.previousElementSibling;
        if (magnif) {
          magnif.remove();
        }
      });
    }
  });
}

function initTaskLists() {
  const listTaskElements = document.querySelectorAll('.list-task');

  const restoreCheckboxState = (id) => localStorage.getItem(id);
  const hasNestedList = (list) =>
    list
      ? [...list.querySelectorAll('li')].some((li) => li.querySelector('ul'))
      : false;

  const isNestedList = (list) =>
    list ? list.parentElement.tagName.toLowerCase() === 'li' : false;
  const handleCheckboxChange = (e) => {
    const { target } = e;
    if (target.checked) {
      localStorage.setItem(`${target.id}`, `${target.checked}`);
    } else {
      localStorage.removeItem(`${target.id}`);
    }
  };

  const getHeadingId = (element) => element.previousElementSibling?.id;

  const createCheckbox = (li, listIndex, index, listTaskElement) => {
    let id;
    if (getHeadingId(listTaskElement)) {
      id = `${getHeadingId(listTaskElement)}-${listIndex}-${index}`;
    } else {
      return;
    }

    const html = `
    <input type="checkbox" id="${id}" ${
  restoreCheckboxState(id) ? 'checked' : ''
}/>
    <label for="${id}">${li.textContent}</label>
    `;
    const wrapper = document.createElement('div');
    wrapper.classList.add('task-wrapper');
    wrapper.innerHTML = DOMPurify.sanitize(html);
    li.replaceWith(wrapper);

    wrapper
      .querySelector('input')
      .addEventListener('change', handleCheckboxChange);
  };

  const hasChanged = (list, elements) => {
    const savedLiNumber = localStorage.getItem(`${getHeadingId(list)}`);
    const currentLiNumber = elements.length;

    return +savedLiNumber !== currentLiNumber;
  };

  const clearList = (list) => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${getHeadingId(list)}`)) {
        localStorage.removeItem(key);
      }
    });
  };

  listTaskElements.forEach((listTaskElement, listIndex) => {
    if (hasNestedList(listTaskElement)) return;
    if (isNestedList(listTaskElement)) return;

    const liElements = listTaskElement.querySelectorAll(':scope > li');

    if (hasChanged(listTaskElement, liElements)) clearList(listTaskElement);

    localStorage.setItem(
      `${getHeadingId(listTaskElement)}`,
      `${liElements.length}`
    );

    liElements.forEach((li, index) => {
      createCheckbox(li, listIndex, index, listTaskElement);
    });
  });
}

function initCopyCodeButton() {
  function addCopyCodeButton() {
    const codeElements = document.querySelectorAll('code.hljs');

    codeElements.forEach((el) => {
      const codeHeader = document.createElement('div');
      codeHeader.classList.add('lt-code-header');

      const buttonElement = document.createElement('button');
      buttonElement.classList.add('lt-copy-code');
      buttonElement.setAttribute('data-copy-code', '');
      buttonElement.setAttribute('aria-label', 'Copy code to clipboard');
      buttonElement.innerHTML = `
        <svg height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 0.5C1.7835 0.5 1 1.2835 1 2.25V9.75C1 10.7165 1.7835 11.5 2.75 11.5H3.75H4.5V10H3.75H2.75C2.61193 10 2.5 9.88807 2.5 9.75V2.25C2.5 2.11193 2.61193 2 2.75 2H8.25C8.38807 2 8.5 2.11193 8.5 2.25V3H10V2.25C10 1.2835 9.2165 0.5 8.25 0.5H2.75ZM7.75 4.5C6.7835 4.5 6 5.2835 6 6.25V13.75C6 14.7165 6.7835 15.5 7.75 15.5H13.25C14.2165 15.5 15 14.7165 15 13.75V6.25C15 5.2835 14.2165 4.5 13.25 4.5H7.75ZM7.5 6.25C7.5 6.11193 7.61193 6 7.75 6H13.25C13.3881 6 13.5 6.11193 13.5 6.25V13.75C13.5 13.8881 13.3881 14 13.25 14H7.75C7.61193 14 7.5 13.8881 7.5 13.75V6.25Z" fill="currentColor"></path></svg>
        <svg height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5607 3.99999L15.0303 4.53032L6.23744 13.3232C5.55403 14.0066 4.44599 14.0066 3.76257 13.3232L4.2929 12.7929L3.76257 13.3232L0.969676 10.5303L0.439346 9.99999L1.50001 8.93933L2.03034 9.46966L4.82323 12.2626C4.92086 12.3602 5.07915 12.3602 5.17678 12.2626L13.9697 3.46966L14.5 2.93933L15.5607 3.99999Z" fill="currentColor"></path></svg>`;

      codeHeader.appendChild(buttonElement);

      el.parentElement.prepend(codeHeader);
    });
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    document.body.removeChild(textArea);
  }

  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text);
  }

  function restoreTextContent(currentEl) {
    const copyButtons = document.querySelectorAll('[data-copy-code]');
    copyButtons.forEach((el) => {
      el.classList.remove('lt-copy-code--copied');
    });

    currentEl.classList.add('lt-copy-code--copied');

    setTimeout(() => {
      currentEl.classList.remove('lt-copy-code--copied');
    }, 3000);
  }

  function handleClick() {
    const target = this;

    restoreTextContent(target);

    const codeHtmlEl = target.parentElement.nextElementSibling;

    if (codeHtmlEl && codeHtmlEl.classList.contains('hljs')) {
      const { textContent } = codeHtmlEl;
      copyTextToClipboard(textContent);
    }
  }

  function bindEvents() {
    const copyButtons = document.querySelectorAll('[data-copy-code]');
    copyButtons.forEach((el) => {
      el.addEventListener('click', handleClick);
    });
  }

  (() => {
    addCopyCodeButton();
    bindEvents();
  })();
}

(function initSlider() {
  const allSliders = document.querySelectorAll('.js-slider');
  function addClasses(classes, element) {
    classes.split(' ').forEach((className) => element.classList.add(className));
  }

  allSliders.forEach((slider, index) => {
    const slides = slider.querySelectorAll(':scope > li');

    const sliderComponent = document.createElement('slider-component');
    const sliderList = document.createElement('ul');

    const defaultListClasses = `slider-grid slider slider--tablet${
      slider.classList.contains('smooth') ? ' smooth' : ''
    }`;

    addClasses(defaultListClasses, sliderList);

    sliderList.setAttribute('role', 'list');
    sliderList.setAttribute('id', `Slider-${index}`);

    const footerButtons = `
    <div class="slider-buttons ">
    <button type="button" class="lt-btn lt-btn--primary slider-button slider-button--prev" name="previous" aria-label="Slide left" disabled="disabled">
      <svg aria-hidden="true" focusable="false" class="icon icon-caret" viewBox="0 0 10 6">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor">
</path></svg>

    </button>
    <div class="slider-counter caption">
      <span class="slider-counter--current">1</span>
      <span aria-hidden="true"> / </span>
      <span class="slider-counter--total">${slides.length}</span>
    </div>
    <button type="button" class="lt-btn lt-btn--primary slider-button slider-button--next" name="next" aria-label="Slide right">
      <svg aria-hidden="true" focusable="false" class="icon icon-caret" viewBox="0 0 10 6">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor">
</path></svg>

    </button>
  </div>
    `;

    slides.forEach((slide, i) => {
      const slideTemplate = `
        <li id="Slide-${index}-${i}" class="slider-grid__item slider__slide slider__slide--full-width" style="--animation-order: ${
    i + 1
  };">
          ${slide.innerHTML}
        </li>
      `;
      sliderList.insertAdjacentHTML('beforeend', slideTemplate);
    });

    sliderComponent.insertAdjacentHTML('beforeend', footerButtons);
    sliderComponent.insertAdjacentElement('afterbegin', sliderList);

    slider.replaceWith(sliderComponent);
  });
})();

function initComponents() {
  initAccordions();
  initTabs();
  initFixForAnimatedIcons();
  initCallouts();
  inlineSVGImages();
  initTaskLists();
  initMagnifier();

  if (window.hljs) {
    document.querySelectorAll('pre').forEach((el) => {
      if (el.querySelector('code')) return;
      const codeElement = '<code>' + el.innerHTML + '</div>';
      el.innerHTML = DOMPurify.sanitize(codeElement);
    });
    hljs.highlightAll();
    initCopyCodeButton();
  }
  if (Fancybox) {
    Fancybox.bind(
      '.rte-enhanced.lt-article__body img, .image-with-lightbox, .image-with-video-icon'
    );
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initComponents();
});

(function () {
  class DetailsAccordion extends HTMLElement {
    connectedCallback() {
      this.duration = {
        open: 400,
        close: 150,
      };
      this.details = this.querySelector('details');
      this.summary = this.querySelector('summary');

      if (!this.content) {
        this.content = this.summary.nextElementSibling;
      }
      if (!this.content) {
        throw new Error(
          'For now <details-animated> requires a child element for animation.'
        );
      }

      this.setAttributes();
      this.bindEvents();
    }

    bindEvents() {
      this.summary.addEventListener('click', this.onClick.bind(this));

      window.addEventListener(
        'hashchange',
        this.onHashChange.bind(this),
        false
      );
      window.addEventListener('load', this.onHashChange.bind(this));
    }

    parseAnimationFrames(property, ...frames) {
      const keyframes = [];
      for (const frame of frames) {
        const obj = {};
        obj[property] = frame;
        keyframes.push(obj);
      }
      return keyframes;
    }

    changeHashWithoutScrolling(newHash) {
      if (window.history.replaceState) {
        window.history.replaceState(null, null, `#${newHash}`);
      } else {
        window.location.replace(`#${newHash}`);
      }
    }

    getKeyframes(open) {
      const frames = this.parseAnimationFrames(
        'maxHeight',
        '0px',
        `${this.getContentHeight()}px`
      );
      if (!open) {
        return frames.filter(() => true).reverse();
      }
      return frames;
    }

    getContentHeight() {
      // make sure it’s open before we measure otherwise it will be 0

      const contentHeight = this.details.open
        ? this.content.offsetHeight
        : this.contentHeight;
      return contentHeight;
    }

    animate(open, duration) {
      this.isPending = true;
      const frames = this.getKeyframes(open);
      this.animation = this.content.animate(frames, {
        duration,
        easing: 'ease-out',
      });
      this.details.classList.add('details-animating');

      this.animation.finished
        .catch(() => {})
        .finally(() => {
          this.isPending = false;
          this.details.classList.remove('details-animating');
        });

      // close() has to wait to remove the [open] attribute manually until after the animation runs
      // open() doesn’t have to wait, it needs [open] added before it animates
      if (!open) {
        this.animation.finished
          .catch(() => {})
          .finally(() => {
            this.details.removeAttribute('open');
          });
      } else {
        this.details.setAttribute('open', '');
      }
    }

    open() {
      if (this.contentHeight) {
        this.animate(true, this.duration.open);
      } else {
        // must wait a frame if we haven’t cached the contentHeight
        requestAnimationFrame(() => this.animate(true, this.duration.open));
      }
    }

    close() {
      this.animate(false, this.duration.close);
    }

    useAnimation() {
      return (
        'matchMedia' in window &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    }

    get slug() {
      return this.getAttribute('slug') || '';
    }

    setAttributes() {
      this.summary.setAttribute('role', 'button');
      this.summary.setAttribute(
        'aria-expanded',
        this.summary.parentNode.hasAttribute('open')
      );

      if (this.summary.nextElementSibling.getAttribute('id')) {
        this.summary.setAttribute(
          'aria-controls',
          this.summary.nextElementSibling.id
        );
      }
    }

    onClick(event) {
      event.currentTarget.setAttribute(
        'aria-expanded',
        !event.currentTarget.closest('details').hasAttribute('open')
      );

      if (event.target.closest('a[href]') || !this.useAnimation()) {
        return;
      }

      if (this.isPending) {
        if (this.animation) {
          this.animation.cancel();
        }
      } else if (this.details.open) {
        // cancel the click because we want to wait to remove [open] until after the animation
        event.preventDefault();
        this.close();
      } else {
        this.changeHashWithoutScrolling(event.currentTarget.id);
        this.open();
      }
    }

    onHashChange() {
      const elementId = window.location.hash.substring(1);
      if (!elementId) return;
      const targetElement = document.getElementById(elementId);
      if (!targetElement) return;
      if (
        elementId === this.slug ||
        (targetElement && this.contains(targetElement))
      ) {
        this.open();
      }
    }
  }

  customElements.define('details-accordion', DetailsAccordion);
})();

(function () {
  const KEYCODE = {
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    HOME: 36,
    END: 35,
  };

  // To avoid invoking the parser with `.innerHTML` for every new instance, a
  // template for the contents of the shadow DOM is shared by all
  // `<tabs-component>` instances.
  const template = document.createElement('template');
  template.innerHTML = `
   <slot name="tab"></slot>
   <slot name="panel"></slot>
 `;

  /**
   * `TabsComponent` is a container element for tabs and panels.
   *
   * All children of `<tabs-component>` should be either `<tab-item>` or
   * `<tab-itempanel>`. This element is stateless, meaning that no values are
   * cached and therefore, changes during runtime work.
   */
  class TabsComponent extends HTMLElement {
    constructor() {
      super();

      this.onSlotChange = this.onSlotChange.bind(this);

      this.attachShadow({ mode: 'open' });

      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this.tabSlot = this.shadowRoot.querySelector('slot[name=tab]');
      this.panelSlot = this.shadowRoot.querySelector('slot[name=panel]');

      this.tabSlot.addEventListener('slotchange', this.onSlotChange);
      this.panelSlot.addEventListener('slotchange', this.onSlotChange);
    }

    connectedCallback() {
      this.addEventListener('keydown', this.onKeyDown);
      this.addEventListener('click', this.onClick);

      if (!this.hasAttribute('role')) {
        this.setAttribute('role', 'tablist');
      }

      Promise.all([
        customElements.whenDefined('tab-item'),
        customElements.whenDefined('tab-panel'),
      ]).then(() => {
        this.linkPanels();
      });
      window.addEventListener(
        'hashchange',
        this.onHashChange.bind(this),
        false
      );
      window.addEventListener('load', this.onHashChange.bind(this));
    }

    onHashChange() {
      const elementId = window.location.hash;

      if (!elementId) return;
      const targetElement = this.querySelector(elementId);
      if (!targetElement) return;
      if (targetElement && targetElement.tagName.toLowerCase() === 'tab-item') {
        this.selectTab(targetElement);
      } else {
        const parentPanel = targetElement.closest('tab-panel');

        if (!parentPanel) return;
        const parentTab = parentPanel.previousElementSibling;
        this.selectTab(parentTab);
      }
    }

    disconnectedCallback() {
      this.removeEventListener('keydown', this.onKeyDown);
      this.removeEventListener('click', this.onClick);
    }

    onSlotChange() {
      this.linkPanels();
    }

    /**
     * `linkPanels()` links up tabs with their adjacent panels using
     * `aria-controls` and `aria-labelledby`. Additionally, the method makes
     * sure only one tab is active.
     */
    linkPanels() {
      const tabs = this.getAllTabs();
      // Give each panel a `aria-labelledby` attribute that refers to the tab
      // that controls it.
      tabs.forEach((tab) => {
        const panel = tab.nextElementSibling;
        if (panel.tagName.toLowerCase() !== 'tab-panel') {
          console.error(`Tab #${tab.id} is not a sibling of a <tab-panel>`);
          return;
        }

        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
      });

      // The element checks if any of the tabs have been marked as selected.
      // If not, the first tab is now selected.
      const selectedTab = tabs.find((tab) => tab.selected) || tabs[0];

      // Next, switch to the selected tab. `selectTab()` takes care of
      // marking all other tabs as deselected and hiding all other panels.
      this.selectTab(selectedTab, false);
    }

    getAllPanels() {
      return Array.from(this.querySelectorAll('tab-panel'));
    }

    getAllTabs() {
      return Array.from(this.querySelectorAll('tab-item'));
    }

    getPanelForTab(tab) {
      const panelId = tab.getAttribute('aria-controls');
      return this.querySelector(`#${panelId}`);
    }

    getPrevTab() {
      const tabs = this.getAllTabs();
      const newIdx = tabs.findIndex((tab) => tab.selected) - 1;
      // Add `tabs.length` to make sure the index is a positive number
      // and get the modulus to wrap around if necessary.
      return tabs[(newIdx + tabs.length) % tabs.length];
    }

    getFirstTab() {
      const tabs = this.getAllTabs();
      return tabs[0];
    }

    getLastTab() {
      const tabs = this.getAllTabs();
      return tabs[tabs.length - 1];
    }

    getNextTab() {
      const tabs = this.getAllTabs();
      const newIdx = tabs.findIndex((tab) => tab.selected) + 1;
      return tabs[newIdx % tabs.length];
    }

    /**
     * `reset()` marks all tabs as deselected and hides all the panels.
     */
    reset() {
      const tabs = this.getAllTabs();
      const panels = this.getAllPanels();

      tabs.forEach((tab) => {
        tab.selected = false;
      });
      panels.forEach((panel) => {
        panel.hidden = true;
      });
    }

    changeHashWithoutScrolling(newHash) {
      if (window.history.replaceState) {
        window.history.replaceState(null, null, `#${newHash}`);
      } else {
        // For browsers that do not support history.replaceState
        window.location.replace(`#${newHash}`);
      }
    }

    selectTab(newTab, focus = true) {
      // Deselect all tabs and hide all panels.
      this.reset();

      // Get the panel that the `newTab` is associated with.
      const newPanel = this.getPanelForTab(newTab);

      // If that panel doesn’t exist, abort.
      if (!newPanel) return;
      newTab.selected = true;
      newPanel.hidden = false;
      if (focus) {
        this.changeHashWithoutScrolling(newTab.id);
        newTab.focus();
      }
    }

    onKeyDown(event) {
      // If the keypress did not originate from a tab element itself,
      // it was a keypress inside the a panel or on empty space. Nothing to do.
      if (event.target.getAttribute('role') !== 'tab') {
        return;
      }
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) {
        return;
      }

      let newTab;
      switch (event.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        newTab = this.getPrevTab();
        break;

      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
        newTab = this.getNextTab();
        break;

      case KEYCODE.HOME:
        newTab = this.getFirstTab();
        break;

      case KEYCODE.END:
        newTab = this.getLastTab();
        break;
      default:
        return;
      }

      event.preventDefault();
      this.selectTab(newTab);
    }

    onClick(event) {
      if (event.target.getAttribute('role') !== 'tab') {
        return;
      }
      this.selectTab(event.target);
    }
  }
  customElements.define('tabs-component', TabsComponent);

  // Counts the number of `<tab-item>`  and `<tab-panel>` instances created. The
  // number is used to generated new, unique IDs.
  let tabItemCounter = 0;
  let tabPanelCounter = 0;

  /**
   * `TabItem` is a tab for a `<tabs-component>` tab panel. `<tab-item>`
   * should always be used with `role=heading` in the markup so that the
   * semantics remain useable when JavaScript is failing.
   *
   * A `<tab-item>` will automatically generate a unique ID if none
   * is specified.
   */
  class TabItem extends HTMLElement {
    static get observedAttributes() {
      return ['selected'];
    }

    connectedCallback() {
      // If this is executed, JavaScript is working and the element
      // changes its role to `tab`.
      this.setAttribute('role', 'tab');
      if (!this.id) {
        this.id = `tab-item-generated-${tabItemCounter++}`;
      }

      // Set a well-defined initial state.
      this.setAttribute('aria-selected', 'false');
      this.setAttribute('tabindex', -1);
      this.upgradeProperty('selected');
    }

    upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    attributeChangedCallback() {
      const value = this.hasAttribute('selected');
      this.setAttribute('aria-selected', value);
      this.setAttribute('tabindex', value ? 0 : -1);
    }

    set selected(value) {
      value = Boolean(value);
      if (value) {
        this.setAttribute('selected', '');
      } else {
        this.removeAttribute('selected');
      }
    }

    get selected() {
      return this.hasAttribute('selected');
    }
  }
  customElements.define('tab-item', TabItem);

  class TabPanel extends HTMLElement {
    connectedCallback() {
      this.setAttribute('role', 'tabpanel');
      if (!this.id) {
        this.id = `tab-panel-generated-${tabPanelCounter++}`;
      }
    }
  }
  customElements.define('tab-panel', TabPanel);
})();

(() => {
  class SliderComponent extends HTMLElement {
    constructor() {
      super();
      this.slider = this.querySelector('[id^="Slider-"]');
      this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
      this.enableSliderLooping = false;
      this.currentPageElement = this.querySelector('.slider-counter--current');
      this.pageTotalElement = this.querySelector('.slider-counter--total');
      this.prevButton = this.querySelector('.slider-button--prev');
      this.nextButton = this.querySelector('.slider-button--next');

      if (!this.slider || !this.nextButton) return;

      this.initPages();

      this.slider.addEventListener('scroll', this.update.bind(this));
      this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
      this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    }

    initPages() {
      this.itemsToShow = Array.from(this.sliderItems).filter(
        (element) => element.clientWidth > 0
      );
      if (this.itemsToShow.length < 2) return;
      this.itemOffset =
        this.itemsToShow[1].offsetLeft - this.itemsToShow[0].offsetLeft;

      this.slidesPerPage = Math.floor(
        (this.slider.clientWidth - this.itemsToShow[0].offsetLeft) /
          this.itemOffset
      );
      this.totalPages = this.itemsToShow.length - this.slidesPerPage + 1;
      this.update();
    }

    resetPages() {
      this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
      this.initPages();
    }

    update() {
      if (!this.slider || !this.nextButton) return;

      const previousPage = this.currentPage;
      this.currentPage =
        Math.round(this.slider.scrollLeft / this.itemOffset) + 1;

      if (this.currentPageElement && this.pageTotalElement) {
        this.currentPageElement.textContent = this.currentPage;
        this.pageTotalElement.textContent = this.totalPages;
      }

      if (this.currentPage !== previousPage) {
        this.dispatchEvent(
          new CustomEvent('slideChanged', {
            detail: {
              currentPage: this.currentPage,
              currentElement: this.itemsToShow[this.currentPage - 1],
            },
          })
        );
      }

      if (this.enableSliderLooping) return;

      if (
        this.isSlideVisible(this.itemsToShow[0]) &&
        this.slider.scrollLeft === 0
      ) {
        this.prevButton.setAttribute('disabled', 'disabled');
      } else {
        this.prevButton.removeAttribute('disabled');
      }

      if (this.isSlideVisible(this.itemsToShow[this.itemsToShow.length - 1])) {
        this.nextButton.setAttribute('disabled', 'disabled');
      } else {
        this.nextButton.removeAttribute('disabled');
      }
    }

    isSlideVisible(element, offset = 0) {
      const lastVisibleSlide =
        this.slider.clientWidth + this.slider.scrollLeft - offset;
      return (
        element.offsetLeft + element.clientWidth <= lastVisibleSlide &&
        element.offsetLeft >= this.slider.scrollLeft
      );
    }

    onButtonClick(event) {
      event.preventDefault();

      const step = event.currentTarget.dataset.step || 1;
      this.slideScrollPosition =
        event.currentTarget.name === 'next'
          ? this.slider.scrollLeft + step * this.itemOffset
          : this.slider.scrollLeft - step * this.itemOffset;
      this.setSlidePosition(this.slideScrollPosition);
    }

    setSlidePosition(position) {
      this.slider.scrollTo({
        left: position,
      });
    }
  }

  customElements.define('slider-component', SliderComponent);
})();