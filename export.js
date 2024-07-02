function exportData(format) {
    chrome.storage.local.get(['scrapedData'], (result) => {
      const data = result.scrapedData || [];
      let output = '';
  
      if (format === 'json') {
        output = JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        output = data.map(row => row.join(',')).join('\n');
      } else if (format === 'sql') {
        output = 'INSERT INTO scraped_data (data) VALUES \n' + data.map(row => `('${row.join("','")}')`).join(',\n') + ';';
      }
  
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scraped_data.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  