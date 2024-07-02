document.getElementById('start-scraping').addEventListener('click', async () => {
  // Clear existing data
  chrome.storage.local.set({ scrapedData: [] });

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

document.getElementById('stop-scraping').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: stopScraping
  });
});

document.getElementById('export-data').addEventListener('click', () => {
  const format = document.getElementById('export-format').value;
  exportData(format);
});

document.getElementById('export-code').addEventListener('click', () => exportData('code'));

function stopScraping() {
  chrome.storage.local.set({ scraperActive: false });
  chrome.scripting.executeScript({
    target: { allFrames: true },
    func: () => {
      document.removeEventListener('click', handleClick, true);
      document.querySelectorAll('.scraper-outline').forEach(el => el.classList.remove('scraper-outline'));
    }
  });
}

function exportData(format) {
  chrome.storage.local.get(['scrapedData'], (result) => {
    const data = result.scrapedData || [];
    let output = '';

    if (format === 'json') {
      output = JSON.stringify(data.map(row => row[0]), null, 2);
    } else if (format === 'csv') {
      output = data.map(row => row[0]).join('\n');
    } else if (format === 'sql') {
      output = 'INSERT INTO scraped_data (data) VALUES \n' + data.map(row => `('${row[0]}')`).join(',\n') + ';';
    } else if (format === 'xml') {
      output = '<?xml version="1.0" encoding="UTF-8"?>\n<items>\n' + data.map(row => `  <item>${row[0]}</item>`).join('\n') + '\n</items>';
    } else if (format === 'txt') {
      output = data.map(row => row[0]).join('\n');
    } else if (format === 'code') {
      output = data.map(row => row[1]).join('\n\n');
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const extension = format === 'code' ? 'txt' : format;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped_data.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
