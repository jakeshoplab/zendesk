const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'animate-on-scroll';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'animate-on-scroll--offscreen';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'animate-on-scroll--cancel';

// Scroll in animation logic
function onIntersection(elements, observer) {
  elements.forEach((element, index) => {
    if (element.isIntersecting) {
      const elementTarget = element.target;
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade')) {
          const hasAnimationOrder = getComputedStyle(elementTarget).getPropertyValue('--animation-order');
          if (!hasAnimationOrder) {
            elementTarget.style.setProperty('style', `--animation-order: ${index};`);
          }
        }
      }
      observer.unobserve(elementTarget);
    } else {
      element.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      element.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document) {
  const animationTriggerElements = Array.from(
    rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME),
  );

  if (animationTriggerElements.length === 0) return;

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px',
  });
  animationTriggerElements.forEach((element) => observer.observe(element));
}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
});
