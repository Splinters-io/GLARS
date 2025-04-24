/**
 * GLARS UI Components
 * Combined JavaScript for GLARS documentation pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling functionality
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            
            // Save preference to localStorage
            const isLightTheme = document.body.classList.contains('light-theme');
            localStorage.setItem('juri-theme', isLightTheme ? 'light' : 'dark');
            
            // Update theme icon
            updateThemeIcon(isLightTheme);
        });
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('juri-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            updateThemeIcon(true);
        }
    }
    
    // Function to update theme toggle icon based on current theme
    function updateThemeIcon(isLightTheme) {
        if (isLightTheme) {
            themeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
        } else {
            themeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        }
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
                
                // Update active state in navigation
                document.querySelectorAll('.toc a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Update active nav item on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.content-section');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        if (currentSection) {
            document.querySelectorAll('.toc a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSection) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Initialize collapsible sections if they exist
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', function() {
            const parent = this.parentElement;
            const content = this.nextElementSibling;
            const isActive = parent.classList.contains('active');
            
            // Toggle active state
            parent.classList.toggle('active');
            
            // Adjust max height based on active state
            if (!isActive) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0px';
            }
        });
    });
    
    // Initialize any GLARS charts if they exist
    if (typeof createGLARSChart === 'function' && document.getElementById('glars-chart-container')) {
        createGLARSChart();
    }
    
    // Initialize vector animation effects for the jurisdiction journey page
    if (document.querySelector('.journey-diagram')) {
        initializeJourneyAnimations();
    }
    
    // Function to initialize journey animations
    function initializeJourneyAnimations() {
        const entities = document.querySelectorAll('.entity');
        
        // Add hover effects to highlight connections
        entities.forEach(entity => {
            entity.addEventListener('mouseenter', function() {
                const index = Array.from(entities).indexOf(this);
                const lines = document.querySelectorAll('.connection-lines path');
                
                // Highlight relevant connection lines
                if (index === 0) { // UK
                    if (lines[0]) lines[0].style.strokeOpacity = '1';
                    if (lines[2]) lines[2].style.strokeOpacity = '1';
                } else if (index === 1) { // US
                    if (lines[0]) lines[0].style.strokeOpacity = '1';
                    if (lines[1]) lines[1].style.strokeOpacity = '1';
                    if (lines[3]) lines[3].style.strokeOpacity = '1';
                    if (lines[4]) lines[4].style.strokeOpacity = '1';
                } else if (index === 2) { // India
                    if (lines[1]) lines[1].style.strokeOpacity = '1';
                    if (lines[2]) lines[2].style.strokeOpacity = '1';
                }
            });
            
            entity.addEventListener('mouseleave', function() {
                // Reset all lines
                document.querySelectorAll('.connection-lines path').forEach(line => {
                    line.style.strokeOpacity = '';
                });
            });
        });
    }
    
    // Create a GLARS Chart visualization if element exists
    window.createGLARSChart = function() {
        const chartContainer = document.getElementById('glars-chart-container');
        if (!chartContainer) return;
        
        // Clear existing content
        chartContainer.innerHTML = '';
        
        // Create chart wrapper
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'glars-chart-wrapper';
        chartWrapper.style.display = 'flex';
        chartWrapper.style.flexDirection = 'column';
        chartWrapper.style.gap = '0.75rem';
        
        chartContainer.appendChild(chartWrapper);
        
        // Get risk scores - for demo purposes using dummy data
        // In a real implementation these would come from API data
        const components = [
            { name: "Legal Framework", score: 65 },
            { name: "Embargo Status", score: 35 },
            { name: "Sanctions", score: 45 },
            { name: "Data Access", score: 75 },
            { name: "Data Transfer", score: 50 }
        ];
        
        // Create a bar for each component
        components.forEach(component => {
            const barContainer = document.createElement('div');
            barContainer.className = 'glars-bar-container';
            barContainer.style.display = 'flex';
            barContainer.style.alignItems = 'center';
            barContainer.style.gap = '1rem';
            
            // Component name
            const nameLabel = document.createElement('div');
            nameLabel.className = 'glars-component-name';
            nameLabel.textContent = component.name;
            nameLabel.style.width = '180px';
            nameLabel.style.textAlign = 'right';
            nameLabel.style.fontWeight = 'bold';
            
            // Bar container
            const barWrapper = document.createElement('div');
            barWrapper.className = 'glars-bar-wrapper';
            barWrapper.style.flex = '1';
            barWrapper.style.height = '8px';
            barWrapper.style.borderRadius = '4px';
            barWrapper.style.backgroundColor = 'rgba(200, 200, 200, 0.2)';
            
            // The bar itself
            const bar = document.createElement('div');
            bar.style.height = '100%';
            bar.style.width = `${component.score}%`;
            bar.style.borderRadius = '4px';
            
            // Set background with opacity based on risk level
            if (component.score >= 66) {
                bar.style.backgroundColor = 'rgba(255, 59, 48, 0.2)';
                bar.style.border = '1px solid rgba(255, 59, 48, 0.8)';
            } else if (component.score >= 33) {
                bar.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
                bar.style.border = '1px solid rgba(255, 204, 0, 0.8)';
            } else {
                bar.style.backgroundColor = 'rgba(52, 199, 89, 0.2)';
                bar.style.border = '1px solid rgba(52, 199, 89, 0.8)';
            }
            
            bar.style.transition = 'width 0.5s ease-out';
            
            // Score label
            const scoreLabel = document.createElement('div');
            scoreLabel.textContent = `${component.score}%`;
            scoreLabel.style.width = '45px';
            scoreLabel.style.textAlign = 'right';
            scoreLabel.style.fontSize = '0.9rem';
            
            // Assemble
            barWrapper.appendChild(bar);
            barContainer.appendChild(nameLabel);
            barContainer.appendChild(barWrapper);
            barContainer.appendChild(scoreLabel);
            
            chartWrapper.appendChild(barContainer);
        });
        
        // Add a description
        const description = document.createElement('p');
        description.style.marginTop = '1rem';
        description.style.fontSize = '0.9rem';
        description.style.opacity = '0.8';
        description.textContent = 'The GLARS (Global Legal Access Risk Score) components show the breakdown of different risk factors in the overall assessment.';
        
        chartContainer.appendChild(description);
    };
});