(function() {
  if (window.scraperInitialized) {
    return;
  }
  
  window.scraperInitialized = true;

  function setupScraper() {
    chrome.storage.local.get(['scraperActive'], (result) => {
      if (result.scraperActive === true) {
        document.addEventListener('click', handleClick, true);
        const style = document.createElement('style');
        style.innerHTML = `.scraper-outline { outline: 2px solid cyan; }`;
        document.head.appendChild(style);
      }
    });
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;
    element.classList.add('scraper-outline');
    const elementText = element.innerText;
    const elementHtml = element.outerHTML;

    chrome.runtime.sendMessage({ action: 'output', data: [elementText, elementHtml] });

    // Save the scraped data
    chrome.storage.local.get(['scrapedData'], (result) => {
      let scrapedData = result.scrapedData || [];
      scrapedData.push([elementText, elementHtml]);
      chrome.storage.local.set({ scrapedData });
    });
  }

  setupScraper();

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'stopScraping') {
      document.removeEventListener('click', handleClick, true);
      document.querySelectorAll('.scraper-outline').forEach(el => el.classList.remove('scraper-outline'));
    }
  });

  // Re-check scraper status when the tab becomes active
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setupScraper();
    }
  });

  // Periodically check if scraping should be active
  setInterval(setupScraper, 1000);
})();