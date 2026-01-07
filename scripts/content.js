// RoastForce Content Script

console.log("RoastForce: Loaded and judging you.");

function init() {
    // 1. Check for pending roast from previous page load
    const pendingRoast = sessionStorage.getItem('roastForce_pending');
    if (pendingRoast) {
        console.log("RoastForce: Delivering pending roast from previous attempt.");
        deliverRoast(pendingRoast); // Use the stored message
        sessionStorage.removeItem('roastForce_pending');
    }

    // Capture phase to ensure we see the event before propagation stops
    document.addEventListener('click', handleGlobalClick, true);
}

function handleGlobalClick(event) {
    const target = event.target;
    const button = target.closest('button, input[type="button"], input[type="submit"], a.btn');

    if (button) {
        if (isSaveButton(button)) {
            console.log("RoastForce: Save button detected!");
            checkDescription(event);
        }
    } else {
        if (isSaveButton(target)) {
            console.log("RoastForce: Save target detected (fallback)!");
            checkDescription(event);
        }
    }
}

function isSaveButton(element) {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    const value = (element.value || element.innerText || "").toLowerCase().trim();
    const name = (element.name || "").toLowerCase();
    const title = (element.title || "").toLowerCase();

    if (value === 'save' || value === 'quick save' || value.includes('save') ||
        name === 'save' || name.includes(':save') ||
        title === 'save' || title.includes('save')) {
        return true;
    }
    return false;
}

function checkDescription(event) {
    console.log("RoastForce: Checking for description...");

    // Find absolute description field
    // We look for a textarea with 'description' in an attribute
    const textAreas = document.querySelectorAll('textarea');
    let descriptionField = null;

    for (const area of textAreas) {
        const name = (area.name || "").toLowerCase();
        const id = (area.id || "").toLowerCase();
        const labelFn = area.getAttribute('aria-label')?.toLowerCase() || "";

        if (name.includes('description') || id.includes('description') || labelFn.includes('description')) {
            descriptionField = area;
            break;
        }
    }

    if (descriptionField) {
        console.log("RoastForce: Description field found.");
        const val = descriptionField.value.trim();

        if (val.length === 0) {
            console.log("RoastForce: Description is empty. ROASTING.");

            // 1. Get a roast
            const roastMsg = getRandomRoast();

            // 2. Set flag for next load (persistence) because page might reload instantly
            sessionStorage.setItem('roastForce_pending', roastMsg);

            // 3. Show immediate roast (in case page stays or prevents default)
            deliverRoast(roastMsg);
        } else {
            console.log("RoastForce: Description present. Clearing any pending shame.");
            // CRITICAL: Clear any pending flag if they fixed it
            sessionStorage.removeItem('roastForce_pending');
        }
    } else {
        console.log("RoastForce: No description field found.");
    }
}

function getRandomRoast() {
    if (!window.ROASTS) return "You forgot the description. Shame.";
    return window.ROASTS[Math.floor(Math.random() * window.ROASTS.length)];
}

function deliverRoast(message) {
    // Check if already showing to prevent stacking
    if (document.querySelector('.roast-force-toast')) return;

    const roastContainer = document.createElement('div');
    roastContainer.className = 'roast-force-toast';
    roastContainer.style.zIndex = "2147483647"; // Max int z-index
    roastContainer.innerHTML = `<span style="font-size: 24px; margin-right: 12px;">🔥</span> <span>${message}</span>`;

    document.body.appendChild(roastContainer);

    // Force reflow
    void roastContainer.offsetWidth;
    roastContainer.classList.add('show');

    // Remove after 8 seconds (longer duration)
    setTimeout(() => {
        roastContainer.classList.remove('show');
        setTimeout(() => roastContainer.remove(), 500);
    }, 8000);
}

// Start
init();
