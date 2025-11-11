document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('shortForm');
  const urlInput = document.getElementById('urlInput');
  const result = document.getElementById('result');
  const shortLinkP = document.getElementById('shortLink');
  const openBtn = document.getElementById('openBtn');
  const analyticsSection = document.getElementById('analytics');
  const analyticsData = document.getElementById('analyticsData');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    try {
      // Try multiple endpoints for compatibility
      let endpoint = '/url';
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) throw new Error('Failed to create short URL');
      
      const data = await response.json();
      const shortId = data.shortId;
      const baseUrl = window.location.origin;
      const full = `${baseUrl}/${shortId}`;
      
      shortLinkP.textContent = full;
      shortLinkP.dataset.shortId = shortId;
      result.classList.remove('hidden');
      analyticsSection.classList.add('hidden');
    } catch (err) {
      alert(err.message || 'Error creating short URL');
      console.error(err);
    }
  });

  openBtn.addEventListener('click', async () => {
    const shortId = shortLinkP.dataset.shortId;
    if (!shortId) return;
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/${shortId}`, '_blank');
  });

  // Click on short link to fetch analytics
  shortLinkP.addEventListener('click', async () => {
    const shortId = shortLinkP.dataset.shortId;
    if (!shortId) return;
    try {
      const res = await fetch(`/url/analytics/${shortId}`);
      if (!res.ok) throw new Error('Analytics not available');
      const data = await res.json();
      analyticsData.textContent = JSON.stringify(data, null, 2);
      analyticsSection.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('Analytics: ' + (err.message || 'Error fetching analytics'));
    }
  });
});