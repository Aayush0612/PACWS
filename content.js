(function() {
  if (window.scraperInitialized) {
    return;
  }
  
  window.scraperInitialized = true;

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

  chrome.storage.local.get(['scraperActive'], (result) => {
    if (result.scraperActive !== false) {
      document.addEventListener('click', handleClick, true);
    }
  });

  const style = document.createElement('style');
  style.innerHTML = `.scraper-outline { outline: 2px solid red; }`;
  document.head.appendChild(style);
})();
