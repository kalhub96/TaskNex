const colorSwatches = document.querySelectorAll('.color-swatch');

//Lode saved
const savedColor = localStorage.getItem('themecolor') ||  '#4A90E2';
document.documentElement.style.setProperty('--theme-color', savedColor);

// Highlight active color
function setActive(color) {
  colorSwatches.forEach(s => s.classList.remove('active'));
  const match = Array.from(colorSwatches).find(s => s.dataset.color === color);
  if (match) match.classList.add('active');
}
setActive(savedColor);

// Apply and save color when clicked
colorSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('themeColor', color);
    setActive(color);
  });
});

document.addEventListener('DOMContentLoaded', function() {
      const dropdown = document.getElementById('tc');
      const allContent = document.querySelectorAll('.hidden-content');

      // Function to show/hide content based on selected value
      function updateContentVisibility() {
        const selectedValue = dropdown.value;

        allContent.forEach(contentDiv => {
          if (contentDiv.id === `content${selectedValue.slice(-1)}`) {
            // Assumes IDs like content1, content2
            contentDiv.style.display = 'block'; // Or 'flex', 'grid', etc.
          } else {
            contentDiv.style.display = 'none';
          }
        });
      }

      // Initial call to set visibility when the page loads
      updateContentVisibility();

      // Add event listener for dropdown changes
      dropdown.addEventListener('change', updateContentVisibility);
    });