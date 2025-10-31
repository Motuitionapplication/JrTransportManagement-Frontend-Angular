// JR Transport Website JavaScript

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const pickup = this.querySelector('input[placeholder="Enter pickup location"]').value;
    const delivery = this.querySelector('input[placeholder="Enter delivery location"]').value;
    const truckType = this.querySelector('select').value;
    
    // Validation
    if (!pickup.trim()) {
        showMessage('Please enter pickup location', 'error');
        return;
    }
    
    if (!delivery.trim()) {
        showMessage('Please enter delivery location', 'error');
        return;
    }
    
    if (!truckType) {
        showMessage('Please select truck type', 'error');
        return;
    }
    
    // Show loading state
    const button = this.querySelector('.btn-primary');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching Available Trucks...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showMessage(`Great! We found trucks for ${pickup} to ${delivery}. Redirecting to booking page...`, 'success');
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Reset form after successful submission
        setTimeout(() => {
            this.reset();
        }, 2000);
    }, 2500);
});

// Toolbar interactions
document.querySelectorAll('.toolbar-item').forEach(item => {
    item.addEventListener('click', function() {
        const icon = this.querySelector('i');
        
        if (icon.classList.contains('fa-comment-dots')) {
            // Chat support
            showMessage('Opening chat support...', 'info');
            // Here you can integrate with your chat system
            // Example: window.Intercom && window.Intercom('show');
        } else if (icon.classList.contains('fa-phone')) {
            // Phone call
            window.open('tel:08044104410');
        } else if (icon.classList.contains('fa-whatsapp')) {
            // WhatsApp
            const message = encodeURIComponent('Hi! I need help with truck booking.');
            window.open(`https://wa.me/918044104410?text=${message}`, '_blank');
        }
    });
});

// Service card interactions
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function() {
        const serviceName = this.querySelector('h3').textContent;
        showMessage(`Redirecting to ${serviceName} page...`, 'info');
        
        // Add loading state to clicked card
        this.style.opacity = '0.7';
        setTimeout(() => {
            this.style.opacity = '1';
        }, 1000);
    });
});

// Feature item hover effects
document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(15px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0) scale(1)';
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Add stagger effect for grid items
            if (entry.target.classList.contains('service-card') || 
                entry.target.classList.contains('feature-item') ||
                entry.target.classList.contains('testimonial-card')) {
                
                const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                entry.target.style.transitionDelay = `${delay}ms`;
            }
        }
    });
}, observerOptions);

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state for animated elements
    document.querySelectorAll('.service-card, .feature-item, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
    
    // Add fade-in animation to section headers
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(header);
    });
    
    // Counter animation for hero stats
    animateCounters();
});

// Counter animation function
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        let current = 0;
        const increment = target / 100;
        const duration = 2000; // 2 seconds
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent.replace(/[\d,]+/, target.toLocaleString());
                clearInterval(timer);
            } else {
                counter.textContent = counter.textContent.replace(/[\d,]+/, Math.ceil(current).toLocaleString());
            }
        }, duration / 100);
    });
}

// Message notification system
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessage = document.querySelector('.notification-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `notification-message notification-${type}`;
    messageEl.textContent = message;
    
    // Style the message
    Object.assign(messageEl.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        fontSize: '0.9rem',
        zIndex: '9999',
        maxWidth: '350px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
    });
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    messageEl.style.background = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 300);
        }
    }, 4000);
    
    // Click to dismiss
    messageEl.addEventListener('click', () => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 300);
    });
}

// Lazy loading for better performance
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Form input enhancements
document.querySelectorAll('input, select').forEach(input => {
    // Add focus effects
    input.addEventListener('focus', function() {
        this.parentNode.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentNode.classList.remove('focused');
        if (this.value.trim() === '') {
            this.parentNode.classList.remove('filled');
        } else {
            this.parentNode.classList.add('filled');
        }
    });
    
    // Add input validation
    input.addEventListener('input', function() {
        if (this.type === 'text' && this.required) {
            if (this.value.trim().length < 2) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        }
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Close messages with Escape key
    if (e.key === 'Escape') {
        const message = document.querySelector('.notification-message');
        if (message) {
            message.click();
        }
    }
    
    // Submit form with Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        const form = document.querySelector('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Performance optimization: Debounce scroll events
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(function() {
        // Add any scroll-based functionality here
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-bg-pattern');
        
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    }, 10);
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading
    lazyLoadImages();
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');
    
    console.log('JR Transport website loaded successfully!');
});
window.calculateFare = async function() {
  const pickup = document.getElementById("pickupCity").value;
  const delivery = document.getElementById("deliveryCity").value;
  const truckType = document.getElementById("truckType").value;

  if (!pickup.trim()) return showMessage('Please enter pickup location', 'error');
  if (!delivery.trim()) return showMessage('Please enter delivery location', 'error');
  if (!truckType) return showMessage('Please select truck type', 'error');

  const button = document.querySelector('.btn-primary');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating Fare...';
  button.disabled = true;

  try {
    const fromCoords = await getCoordinates(pickup);
    const toCoords = await getCoordinates(delivery);
    const distance = await getDistance(fromCoords, toCoords);

    const rateMap = { mini: 12, medium: 15, large: 19, container: 19, trailer: 23 };
    const baseFare = 1500;
    const fare = baseFare + (distance * rateMap[truckType]);

    document.getElementById("fareResult").innerHTML = `
      Distance: ${distance.toFixed(2)} km<br>
      Estimated Fare: ₹${fare.toFixed(2)}
    `;

    showMessage(`Estimated Fare: ₹${fare.toFixed(2)} (${distance.toFixed(2)} km)`, 'success');
  } catch (err) {
    showMessage("Error calculating fare: " + err, 'error');
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}
