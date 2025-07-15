// Hide articles in section on mobile
function hideContentOnSmallScreens() {
  const detailsElement = document.querySelector(".lt-section-articles details");

  if (!detailsElement) return;

  if (window.innerWidth < 1199) {
    detailsElement.removeAttribute("open");
  } else {
    detailsElement.setAttribute("open", "open");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  hideContentOnSmallScreens();
  window.addEventListener("resize", hideContentOnSmallScreens);
});

function openZendeskChat() {
  if (typeof zE === "function") {
    zE("messenger", "open");
  } else {
    console.log("Zendesk Widget is not initialized");
  }
}

// Support status availability

function StatusIndicator(
  gmtOffsetElementSelector,
  businessHoursStart,
  businessHoursEnd
) {
  const statusObj = {
    status: "online",

    getGmtOffset() {
      const el = document.querySelector(gmtOffsetElementSelector);
      const rawOffset = el?.getAttribute("data-time-zone");
      return parseInt(rawOffset || 0, 10);
    },

    setAvailabilityStatus() {
      const storeGmtOffset = this.getGmtOffset();

      const [openingHour, openingMinutes] = businessHoursStart
        .split(":")
        .map(Number);
      const [closingHour, closingMinutes] = businessHoursEnd
        .split(":")
        .map(Number);

      const isAlwaysOpen =
        openingHour === 0 &&
        openingMinutes === 0 &&
        closingHour === 23 &&
        closingMinutes === 59;

      if (isAlwaysOpen) {
        this.status = "online";
        this.updateDOM();
        return;
      }

      const userGmtOffset = -(new Date().getTimezoneOffset() / 60);
      const gmtDifference = userGmtOffset - storeGmtOffset;

      const openingHourUserTime = (openingHour + gmtDifference + 24) % 24;
      const closingHourUserTime = (closingHour + gmtDifference + 24) % 24;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      const currentTimeInMinutes = currentHour * 60 + currentMinutes;
      const openingTimeInMinutesUser =
        openingHourUserTime * 60 + openingMinutes;
      const closingTimeInMinutesUser =
        closingHourUserTime * 60 + closingMinutes;

      const isOpen =
        (closingHourUserTime > openingHourUserTime &&
          currentTimeInMinutes >= openingTimeInMinutesUser &&
          currentTimeInMinutes < closingTimeInMinutesUser) ||
        (closingHourUserTime < openingHourUserTime &&
          (currentTimeInMinutes >= openingTimeInMinutesUser ||
            currentTimeInMinutes < closingTimeInMinutesUser));

      this.status = isOpen ? "online" : "offline";
      this.updateDOM();
      console.log("status", this.status);
    },

    updateDOM() {
      const statusSpan = document.querySelector(".support-status .status");
      statusSpan.textContent = this.status;
      
      const statusDiv = document.querySelector('[data-status]');
      statusDiv.setAttribute('data-status', this.status);
    },
  };

  return statusObj;
}

const indicator = StatusIndicator("[data-time-zone]", "08:00", "22:00");
indicator.setAvailabilityStatus();
